import { Worker } from 'bullmq';
import redisConnection from '../lib/redis';

interface MLSyncJob {
  accountId: string;
  syncType: 'orders' | 'items' | 'inventory';
  userId: string;
}

export const mlSyncWorker = new Worker(
  'ml-sync',
  async (job) => {
    const data = job.data as MLSyncJob;

    console.log(`🔄 Syncing ML data: ${data.syncType} for account ${data.accountId}`);

    try {
      switch (data.syncType) {
        case 'orders':
          await syncOrders(data.accountId);
          break;
        case 'items':
          await syncItems(data.accountId);
          break;
        case 'inventory':
          await syncInventory(data.accountId);
          break;
      }

      console.log(`✅ Synced ${data.syncType} for account ${data.accountId}`);
    } catch (error) {
      console.error(`❌ Error syncing ML data:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

async function syncOrders(accountId: string) {
  // TODO: Implement order sync from ML API
  console.log(`Syncing orders for account: ${accountId}`);
}

async function syncItems(accountId: string) {
  // TODO: Implement items sync from ML API
  console.log(`Syncing items for account: ${accountId}`);
}

async function syncInventory(accountId: string) {
  // TODO: Implement inventory sync from ML API
  console.log(`Syncing inventory for account: ${accountId}`);
}

mlSyncWorker.on('completed', (job) => {
  console.log(`✅ Sync job ${job.id} completed`);
});

mlSyncWorker.on('failed', (job, err) => {
  console.error(`❌ Sync job ${job?.id} failed:`, err);
});

export default mlSyncWorker;
