import { Worker } from 'bullmq';
import redisConnection from '../lib/redis';

interface MLWebhookJob {
  topic: string;
  resource: string;
  userId: string;
  applicationId: string;
  receivedAt: Date;
}

export const mlWebhookWorker = new Worker(
  'ml-webhook',
  async (job) => {
    const data = job.data as MLWebhookJob;

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
    } catch (error) {
      console.error(`❌ Error processing ML webhook:`, error);
      throw error; // Re-throw to trigger retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs concurrently
  }
);

// Webhook processors
async function processOrderWebhook(data: MLWebhookJob) {
  // TODO: Implement order webhook processing
  // 1. Fetch order details from ML API
  // 2. Update database
  // 3. Sync to TinyERP if needed
  console.log(`Processing order: ${data.resource}`);
}

async function processItemWebhook(data: MLWebhookJob) {
  // TODO: Implement item webhook processing
  console.log(`Processing item: ${data.resource}`);
}

async function processQuestionWebhook(data: MLWebhookJob) {
  // TODO: Implement question webhook processing
  console.log(`Processing question: ${data.resource}`);
}

async function processClaimWebhook(data: MLWebhookJob) {
  // TODO: Implement claim webhook processing
  console.log(`Processing claim: ${data.resource}`);
}

mlWebhookWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

mlWebhookWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

export default mlWebhookWorker;
