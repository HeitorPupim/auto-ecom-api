import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

// Redis connection for BullMQ
export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || '31.97.83.214',
  port: parseInt(process.env.REDIS_PORT || '4322'),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USER || 'default',
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
});

redisConnection.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redisConnection;
