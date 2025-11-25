import { Queue } from 'bullmq';
import redisConnection from '../lib/redis';

// MercadoLibre webhook queue
export const mlWebhookQueue = new Queue('ml-webhook', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs for debugging
    },
  },
});

// MercadoLibre data sync queue (for scheduled syncs)
export const mlSyncQueue = new Queue('ml-sync', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// TinyERP sync queue
export const tinyerpSyncQueue = new Queue('tinyerp-sync', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});

console.log('📦 Queues initialized');

export default {
  mlWebhookQueue,
  mlSyncQueue,
  tinyerpSyncQueue,
};
