import fastify from 'fastify';

const server = fastify({
  logger: true
});

server.get('/', async (request, reply) => {
  return { message: 'Welcome to AutoEcom API (Fastify)' };
});

server.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await server.listen({ port: 8001, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
