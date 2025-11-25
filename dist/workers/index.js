"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ml_webhook_worker_1 = __importDefault(require("./ml-webhook.worker"));
const ml_sync_worker_1 = __importDefault(require("./ml-sync.worker"));
const tinyerp_sync_worker_1 = __importDefault(require("./tinyerp-sync.worker"));
console.log('🚀 Starting all workers...');
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down workers...');
    await ml_webhook_worker_1.default.close();
    await ml_sync_worker_1.default.close();
    await tinyerp_sync_worker_1.default.close();
    console.log('✅ Workers shut down gracefully');
    process.exit(0);
});
console.log('✅ All workers started successfully');
console.log('📊 Workers running:');
console.log('  - ML Webhook Worker (concurrency: 5)');
console.log('  - ML Sync Worker (concurrency: 3)');
console.log('  - TinyERP Sync Worker (concurrency: 2)');
