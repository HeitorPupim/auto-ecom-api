import { FastifyInstance } from 'fastify';
import { handleMercadoLibreWebhook } from './mercadolibre';
import { handleTinyERPWebhook } from './tiny';

export async function webhookRoutes(fastify: FastifyInstance) {
  // MercadoLibre webhook endpoint
  fastify.post('/webhooks/ml', handleMercadoLibreWebhook);
  fastify.post('/api/webhooks/meli', handleMercadoLibreWebhook); // Alias for user config

  // TinyERP webhook endpoint
  fastify.post('/webhooks/tiny', handleTinyERPWebhook);

  console.log('📡 Webhook routes registered');
}
