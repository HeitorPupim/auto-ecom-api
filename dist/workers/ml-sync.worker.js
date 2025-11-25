"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mlSyncWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
exports.mlSyncWorker = new bullmq_1.Worker('ml-sync', async (job) => {
    const data = job.data;
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
    }
    catch (error) {
        console.error(`❌ Error syncing ML data:`, error);
        throw error;
    }
}, {
    connection: redis_1.default,
    concurrency: 3,
});
async function syncOrders(accountId) {
    // TODO: Implement order sync from ML API
    console.log(`Syncing orders for account: ${accountId}`);
}
async function syncItems(accountId) {
    // TODO: Implement items sync from ML API
    console.log(`Syncing items for account: ${accountId}`);
}
async function syncInventory(accountId) {
    // TODO: Implement inventory sync from ML API
    console.log(`Syncing inventory for account: ${accountId}`);
}
exports.mlSyncWorker.on('completed', (job) => {
    console.log(`✅ Sync job ${job.id} completed`);
});
exports.mlSyncWorker.on('failed', (job, err) => {
    console.error(`❌ Sync job ${job?.id} failed:`, err);
});
exports.default = exports.mlSyncWorker;
