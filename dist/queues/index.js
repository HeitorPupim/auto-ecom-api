"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tinyerpSyncQueue = exports.mlSyncQueue = exports.mlWebhookQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../lib/redis"));
// MercadoLibre webhook queue
exports.mlWebhookQueue = new bullmq_1.Queue('ml-webhook', {
    connection: redis_1.default,
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
exports.mlSyncQueue = new bullmq_1.Queue('ml-sync', {
    connection: redis_1.default,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
    },
});
// TinyERP sync queue
exports.tinyerpSyncQueue = new bullmq_1.Queue('tinyerp-sync', {
    connection: redis_1.default,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 3000,
        },
    },
});
console.log('📦 Queues initialized');
exports.default = {
    mlWebhookQueue: exports.mlWebhookQueue,
    mlSyncQueue: exports.mlSyncQueue,
    tinyerpSyncQueue: exports.tinyerpSyncQueue,
};
