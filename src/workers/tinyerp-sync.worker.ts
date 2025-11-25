import { Worker } from 'bullmq';
import redisConnection from '../lib/redis';

interface TinyERPSyncJob {
  accountId: string;
  syncType: 'order' | 'product' | 'inventory';
  data: any;
}

export const tinyerpSyncWorker = new Worker(
  'tinyerp-sync',
  async (job) => {
    const jobData = job.data as TinyERPSyncJob;

    console.log(`🔄 Syncing to TinyERP: ${jobData.syncType} for account ${jobData.accountId}`);

    try {
      switch (jobData.syncType) {
        case 'order':
          await syncOrderToTinyERP(jobData);
          break;
        case 'product':
          await syncProductToTinyERP(jobData);
          break;
        case 'inventory':
          await syncInventoryToTinyERP(jobData);
          break;
      }

      console.log(`✅ Synced ${jobData.syncType} to TinyERP`);
    } catch (error) {
      console.error(`❌ Error syncing to TinyERP:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Lower concurrency to avoid rate limits
  }
);

async function syncOrderToTinyERP(data: TinyERPSyncJob) {
  // TODO: Implement order sync to TinyERP API
  console.log(`Syncing order to TinyERP:`, data.data);
}

async function syncProductToTinyERP(data: TinyERPSyncJob) {
  // TODO: Implement product sync to TinyERP API
  console.log(`Syncing product to TinyERP:`, data.data);
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
