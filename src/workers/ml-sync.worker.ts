import { Worker } from 'bullmq';
import redisConnection from '../lib/redis';
import axios from 'axios';
import prisma from '../lib/prisma';

interface MLSyncJob {
  userId: string;
  mlUserId: string;
  accessToken: string;
}

export const mlSyncWorker = new Worker(
  'ml-sync',
  async (job) => {
    console.log(`🔄 Processing job ${job.name} for user ${job.data.userId}`);

    try {
      if (job.name === 'initial_sync') {
        const data = job.data as MLSyncJob;
        await syncItems(data.userId, data.mlUserId, data.accessToken);
      }
    } catch (error) {
      console.error(`❌ Error syncing ML data:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Limit concurrency to avoid rate limits during heavy syncs
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

async function syncItems(userId: string, mlUserId: string, accessToken: string) {
  console.log(`📦 Starting items sync for ML User ${mlUserId}`);

  // Find the account ID in our DB
  const account = await prisma.mercadoLibreAccount.findUnique({
    where: {
      userId_mlUserId: {
        userId,
        mlUserId,
      },
    },
  });

  if (!account) {
    throw new Error(`Account not found for user ${userId} and ML user ${mlUserId}`);
  }

  // Update status to syncing
  await prisma.mercadoLibreAccount.update({
    where: { id: account.id },
    data: { syncStatus: 'syncing', syncProgress: 0 },
  });

  let scrollId: string | undefined;
  let hasMore = true;
  const BATCH_SIZE = 20; // Multiget limit is 20
  let totalItems = 0;
  let processedItems = 0;

  try {
    // First call to get total count
    const initialSearch = await axios.get(`https://api.mercadolibre.com/users/${mlUserId}/items/search`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { search_type: 'scan', limit: 1 },
    });
    totalItems = initialSearch.data.paging.total;
    console.log(`Found ${totalItems} total items to sync.`);

    while (hasMore) {
      // 1. Fetch Item IDs (Scan)
      const searchUrl = `https://api.mercadolibre.com/users/${mlUserId}/items/search`;
      const searchParams: any = {
        search_type: 'scan',
        limit: 100,
      };
      if (scrollId) {
        searchParams.scroll_id = scrollId;
      }

      const searchResponse = await axios.get(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: searchParams,
      });

      const { results, scroll_id } = searchResponse.data;
      scrollId = scroll_id;

      if (!results || results.length === 0) {
        hasMore = false;
        break;
      }

      // 2. Multiget Details
      // Split into chunks of 50
      for (let i = 0; i < results.length; i += BATCH_SIZE) {
        const chunk = results.slice(i, i + BATCH_SIZE);
        const ids = chunk.join(',');

        const itemsResponse = await axios.get(`https://api.mercadolibre.com/items`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { ids, attributes: 'id,title,price,base_price,original_price,currency_id,initial_quantity,available_quantity,sold_quantity,permalink,thumbnail,status,listing_type_id,seller_custom_field,condition,pictures,attributes,variations' },
        });

        const itemsData = itemsResponse.data;

        // 3. Upsert to DB
        for (const itemWrapper of itemsData) {
          if (itemWrapper.code === 200) {
            const item = itemWrapper.body;

            // Extract attributes
            const attributes = item.attributes || [];
            const gtin = attributes.find((a: any) => a.id === 'GTIN')?.value_name;
            const brand = attributes.find((a: any) => a.id === 'BRAND')?.value_name;
            const model = attributes.find((a: any) => a.id === 'MODEL')?.value_name;
            const sellerSku = item.seller_custom_field;

            await prisma.mercadoLibreItem.upsert({
              where: { id: item.id },
              update: {
                title: item.title,
                price: item.price,
                basePrice: item.base_price,
                originalPrice: item.original_price,
                currencyId: item.currency_id,
                initialQuantity: item.initial_quantity,
                availableQuantity: item.available_quantity,
                soldQuantity: item.sold_quantity,
                permalink: item.permalink,
                thumbnail: item.thumbnail,
                status: item.status,
                listingTypeId: item.listing_type_id,

                // New fields
                sku: sellerSku,
                gtin: gtin,
                brand: brand,
                model: model,
                condition: item.condition,
                pictures: item.pictures,
                attributes: item.attributes,
                variations: item.variations,

                updatedAt: new Date(),
              },
              create: {
                id: item.id,
                mercadoLibreAccountId: account.id,
                title: item.title,
                price: item.price,
                basePrice: item.base_price,
                originalPrice: item.original_price,
                currencyId: item.currency_id,
                initialQuantity: item.initial_quantity,
                availableQuantity: item.available_quantity,
                soldQuantity: item.sold_quantity,
                permalink: item.permalink,
                thumbnail: item.thumbnail,
                status: item.status,
                listingTypeId: item.listing_type_id,

                // New fields
                sku: sellerSku,
                gtin: gtin,
                brand: brand,
                model: model,
                condition: item.condition,
                pictures: item.pictures,
                attributes: item.attributes,
                variations: item.variations,
              },
            });
          }
        }

        processedItems += chunk.length;
        const progress = Math.min(Math.round((processedItems / totalItems) * 100), 99);

        // Update progress
        await prisma.mercadoLibreAccount.update({
          where: { id: account.id },
          data: { syncProgress: progress },
        });
      }
    }

    // Finish
    await prisma.mercadoLibreAccount.update({
      where: { id: account.id },
      data: { syncStatus: 'idle', syncProgress: 100, lastSyncAt: new Date() },
    });

    console.log(`✅ Items sync completed for ML User ${mlUserId}`);

  } catch (error) {
    console.error('Error during sync:', error);
    await prisma.mercadoLibreAccount.update({
      where: { id: account.id },
      data: { syncStatus: 'error' },
    });
    throw error;
  }
}

mlSyncWorker.on('completed', (job) => {
  console.log(`✅ Sync job ${job.id} completed`);
});

mlSyncWorker.on('failed', (job, err) => {
  console.error(`❌ Sync job ${job?.id} failed:`, err);
});

export default mlSyncWorker;
