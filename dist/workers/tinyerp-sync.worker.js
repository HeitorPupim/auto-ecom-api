"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tinyerpSyncWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
exports.tinyerpSyncWorker = new bullmq_1.Worker('tinyerp-sync', async (job) => {
    const jobData = job.data;
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
    }
    catch (error) {
        console.error(`❌ Error syncing to TinyERP:`, error);
        throw error;
    }
}, {
    connection: redis_1.default,
    concurrency: 2, // Lower concurrency to avoid rate limits
});
async function syncOrderToTinyERP(data) {
    // TODO: Implement order sync to TinyERP API
    console.log(`Syncing order to TinyERP:`, data.data);
}
async function syncProductToTinyERP(data) {
    // TODO: Implement product sync to TinyERP API
    console.log(`Syncing product to TinyERP:`, data.data);
}
async function syncInventoryToTinyERP(data) {
    // TODO: Implement inventory sync to TinyERP API
    console.log(`Syncing inventory to TinyERP:`, data.data);
}
exports.tinyerpSyncWorker.on('completed', (job) => {
    console.log(`✅ TinyERP sync job ${job.id} completed`);
});
exports.tinyerpSyncWorker.on('failed', (job, err) => {
    console.error(`❌ TinyERP sync job ${job?.id} failed:`, err);
});
exports.default = exports.tinyerpSyncWorker;
