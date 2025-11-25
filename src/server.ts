import fastify from 'fastify';
import { webhookRoutes } from './routes/webhooks';

const server = fastify({
  logger: true
});

server.get('/', async (request, reply) => {
  return { message: 'Welcome to AutoEcom API (Fastify)' };
});

server.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Register webhook routes
server.register(webhookRoutes);

const start = async () => {
  try {
    await server.listen({ port: 8001, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
