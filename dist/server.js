"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const webhooks_1 = require("./routes/webhooks");
const server = (0, fastify_1.default)({
    logger: true
});
server.get('/', async (request, reply) => {
    return { message: 'Welcome to AutoEcom API (Fastify)' };
});
server.get('/health', async (request, reply) => {
    return { status: 'ok' };
});
// Register webhook routes
server.register(webhooks_1.webhookRoutes);
const start = async () => {
    try {
        await server.listen({ port: 8001, host: '0.0.0.0' });
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
