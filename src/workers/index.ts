import mlWebhookWorker from './ml-webhook.worker';
import mlSyncWorker from './ml-sync.worker';
import tinyerpSyncWorker from './tinyerp-sync.worker';

console.log('🚀 Starting all workers...');

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
