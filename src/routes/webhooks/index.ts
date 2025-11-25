import { FastifyInstance } from 'fastify';
import { handleMercadoLibreWebhook } from './mercadolibre';

export async function webhookRoutes(fastify: FastifyInstance) {
  // MercadoLibre webhook endpoint
  fastify.post('/webhooks/ml', handleMercadoLibreWebhook);

  console.log('📡 Webhook routes registered');
}
