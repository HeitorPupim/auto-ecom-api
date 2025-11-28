import { Worker, Queue } from 'bullmq';
import redisConnection from '../lib/redis';
import prisma from '../lib/prisma';
import axios from 'axios';
import { refreshTinyERPToken } from '../lib/tinyerp';

interface TinyERPSyncJob {
  userId: string;
  accountId: string; // TinyERPAccount ID (database ID, not Tiny ID)
  syncType: 'order' | 'product' | 'inventory' | 'initial_sync';
  data?: any;
}

export const tinyerpSyncQueue = new Queue('tinyerp-sync', {
  connection: redisConnection,
});

export const tinyerpSyncWorker = new Worker(
  'tinyerp-sync',
  async (job) => {
    const jobData = job.data as TinyERPSyncJob;

    console.log(`🔄 Syncing to/from TinyERP: ${jobData.syncType} for account ${jobData.accountId}`);

    try {
      switch (jobData.syncType) {
        case 'initial_sync':
        case 'product':
          await syncProductsFromTinyERP(jobData, job);
          break;
        case 'order':
          await syncOrderToTinyERP(jobData);
          break;
        case 'inventory':
          await syncInventoryToTinyERP(jobData);
          break;
      }

      console.log(`✅ Synced ${jobData.syncType} for TinyERP account ${jobData.accountId}`);
    } catch (error) {
      console.error(`❌ Error syncing TinyERP:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Keep concurrency low for now
    limiter: {
      max: 1,
      duration: 1000, // 1 job per second to respect rate limits
    },
    lockDuration: 30 * 60 * 1000, // 30 minutes lock duration to prevent job from stalling during long syncs
  }
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeRequestWithRetry(url: string, config: any, retries = 5, delay = 2000): Promise<any> {
  try {
    return await axios.get(url, config);
  } catch (error: any) {
    if (retries > 0 && error.response?.status === 429) {
      // If we hit a rate limit, wait longer. TinyERP might block for a minute if exceeded.
      console.warn(`⚠️ Rate limited by TinyERP. Retrying in ${delay}ms...`);
      await sleep(delay);
      return makeRequestWithRetry(url, config, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function syncProductsFromTinyERP(data: TinyERPSyncJob, job: any) {
  const { userId, accountId } = data;

  const account = await prisma.tinyERPAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error(`TinyERP Account ${accountId} not found`);
  }

  let accessToken = account.accessToken;

  // Check if token needs refresh (simple check, ideally check expiration date)
  if (account.expiresAt < new Date()) {
    console.log('Token expired, refreshing...');
    accessToken = await refreshTinyERPToken(userId);
  }

  let offset = 0;
  const limit = 100; // Default limit
  let hasMore = true;
  const TINY_API_URL = 'https://api.tiny.com.br/public-api/v3';

  // Update sync status
  await prisma.tinyERPAccount.update({
    where: { id: accountId },
    data: { syncStatus: 'syncing', syncProgress: 0 },
  });

  try {
    while (hasMore) {
      console.log(`Fetching products with offset ${offset}...`);

      const response = await makeRequestWithRetry(`${TINY_API_URL}/produtos`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          offset: offset,
          limit: limit
        },
      });

      // User provided structure: { itens: [...], paginacao: {...} }
      const productsList = response.data.itens || [];
      const pagination = response.data.paginacao || {};

      console.log(`Fetched ${productsList.length} products. Pagination:`, JSON.stringify(pagination));

      if (productsList.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of productsList) {
        try {
          // Fetch details for each product to get stock info
          // User mentioned: GET productos/{idProduto} -> likely /produtos/{id}
          // console.log(`Fetching details for product ${item.id}...`); // Reduce logging noise

          const detailResponse = await makeRequestWithRetry(`${TINY_API_URL}/produtos/${item.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const product = detailResponse.data;

          // Map API response to database schema
          await prisma.tinyERPProduct.upsert({
            where: { id: String(product.id) },
            update: {
              sku: product.sku || product.codigo,
              name: product.descricao || product.nome,
              price: product.precos?.preco || 0,
              costPrice: product.precos?.precoCusto,
              stock: product.estoque?.quantidade || 0,
              minStock: product.estoque?.minimo,
              maxStock: product.estoque?.maximo,
              gtin: product.gtin,
              unit: product.unidade,
              updatedAt: new Date(),
            },
            create: {
              id: String(product.id),
              tinyERPAccountId: accountId,
              sku: product.sku || product.codigo,
              name: product.descricao || product.nome,
              price: product.precos?.preco || 0,
              costPrice: product.precos?.precoCusto,
              stock: product.estoque?.quantidade || 0,
              minStock: product.estoque?.minimo,
              maxStock: product.estoque?.maximo,
              gtin: product.gtin,
              unit: product.unidade,
            },
          });

          // Add a delay to respect the rate limit (120 req/min = 2 req/sec)
          // We use 600ms to be safe (approx 1.6 req/sec)
          await sleep(600);

          // Extend lock to prevent job from being marked as stalled
          await job.extendLock(30 * 60 * 1000); // Extend by another 30 mins

        } catch (detailError: any) {
          console.error(`Failed to fetch details for product ${item.id}:`, detailError.message);
          // Continue to next product even if one fails
        }
      }

      // Check pagination
      const total = pagination.total || 0;

      // Update offset
      offset += productsList.length;

      // If we fetched fewer items than limit, we are done
      if (productsList.length < limit) {
        hasMore = false;
      }
      // Or if we reached the total
      else if (total > 0 && offset >= total) {
        hasMore = false;
      }

      // Update progress (approximate)
      const progress = total > 0 ? Math.min(99, Math.floor((offset / total) * 100)) : 50;

      await prisma.tinyERPAccount.update({
        where: { id: accountId },
        data: { syncProgress: progress },
      });
    }

    // Sync complete
    await prisma.tinyERPAccount.update({
      where: { id: accountId },
      data: { syncStatus: 'idle', syncProgress: 100, lastSyncAt: new Date() },
    });

  } catch (error: any) {
    console.error('Error fetching products:', error.response?.data || error.message);
    console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));

    await prisma.tinyERPAccount.update({
      where: { id: accountId },
      data: { syncStatus: 'error' },
    });
    throw error;
  }
}

async function syncOrderToTinyERP(data: TinyERPSyncJob) {
  // TODO: Implement order sync to TinyERP API
  console.log(`Syncing order to TinyERP:`, data.data);
}

async function syncInventoryToTinyERP(data: TinyERPSyncJob) {
  // TODO: Implement inventory sync to TinyERP API
  console.log(`Syncing inventory to TinyERP:`, data.data);
}

tinyerpSyncWorker.on('completed', (job) => {
  console.log(`✅ TinyERP sync job ${job.id} completed`);
});

tinyerpSyncWorker.on('failed', (job, err) => {
  console.error(`❌ TinyERP sync job ${job?.id} failed:`, err);
});

export default tinyerpSyncWorker;
