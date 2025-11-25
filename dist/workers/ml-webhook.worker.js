"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mlWebhookWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
exports.mlWebhookWorker = new bullmq_1.Worker('ml-webhook', async (job) => {
    const data = job.data;
    console.log(`🔄 Processing ML webhook: ${data.topic} - ${data.resource}`);
    try {
        switch (data.topic) {
            case 'orders':
                await processOrderWebhook(data);
                break;
            case 'items':
                await processItemWebhook(data);
                break;
            case 'questions':
                await processQuestionWebhook(data);
                break;
            case 'claims':
                await processClaimWebhook(data);
                break;
            default:
                console.log(`⚠️  Unknown webhook topic: ${data.topic}`);
        }
        console.log(`✅ Processed ML webhook: ${data.topic} - ${data.resource}`);
    }
    catch (error) {
        console.error(`❌ Error processing ML webhook:`, error);
        throw error; // Re-throw to trigger retry
    }
}, {
    connection: redis_1.default,
    concurrency: 5, // Process 5 jobs concurrently
});
// Webhook processors
async function processOrderWebhook(data) {
    // TODO: Implement order webhook processing
    // 1. Fetch order details from ML API
    // 2. Update database
    // 3. Sync to TinyERP if needed
    console.log(`Processing order: ${data.resource}`);
}
async function processItemWebhook(data) {
    // TODO: Implement item webhook processing
    console.log(`Processing item: ${data.resource}`);
}
async function processQuestionWebhook(data) {
    // TODO: Implement question webhook processing
    console.log(`Processing question: ${data.resource}`);
}
async function processClaimWebhook(data) {
    // TODO: Implement claim webhook processing
    console.log(`Processing claim: ${data.resource}`);
}
exports.mlWebhookWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});
exports.mlWebhookWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
});
exports.default = exports.mlWebhookWorker;
