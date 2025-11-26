import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { webhookRoutes } from './routes/webhooks';
import { authRoutes } from './routes/auth';
import { integrationRoutes } from './routes/integrations';

const server = fastify({
  logger: true,
  trustProxy: true, // Required for Ngrok/Proxies to handle Secure cookies correctly
});

// Register plugins
server.register(cookie, {
  secret: process.env.COOKIE_SECRET || 'supersecret-cookie-secret',
  hook: 'onRequest',
});

server.register(cors, {
  origin: true, // Allow all origins for now (dev mode)
  credentials: true, // Required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret',
});

server.get('/', async (request, reply) => {
  return { message: 'Welcome to AutoEcom API (Fastify)' };
});

server.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Register routes
server.register(webhookRoutes);
server.register(authRoutes);
server.register(integrationRoutes);

const start = async () => {
  try {
    await server.listen({ port: 8001, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
