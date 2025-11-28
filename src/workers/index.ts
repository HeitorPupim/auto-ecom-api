import mlWebhookWorker from './ml-webhook.worker';
import mlSyncWorker from './ml-sync.worker';
import tinyerpSyncWorker from './tinyerp-sync.worker';

import prisma from '../lib/prisma';

console.log('🚀 Starting all workers...');

// Reset stuck syncs on startup
async function resetStuckSyncs() {
  try {
    const stuckTinyAccounts = await prisma.tinyERPAccount.updateMany({
      where: { syncStatus: 'syncing' },
      data: { syncStatus: 'error', syncProgress: 0 },
    });

    if (stuckTinyAccounts.count > 0) {
      console.log(`⚠️ Reset ${stuckTinyAccounts.count} stuck TinyERP syncs to error state.`);
    }
  } catch (error) {
    console.error('Failed to reset stuck syncs:', error);
  }
}

resetStuckSyncs();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down workers...');

  await mlWebhookWorker.close();
  await mlSyncWorker.close();
  await tinyerpSyncWorker.close();

  console.log('✅ Workers shut down gracefully');
  process.exit(0);
});

console.log('✅ All workers started successfully');
console.log('📊 Workers running:');
console.log('  - ML Webhook Worker (concurrency: 5)');
console.log('  - ML Sync Worker (concurrency: 3)');
console.log('  - TinyERP Sync Worker (concurrency: 2)');
