import { FastifyInstance } from 'fastify';
import { handleMercadoLibreWebhook } from './mercadolibre';

export async function webhookRoutes(fastify: FastifyInstance) {
  // MercadoLibre webhook endpoint
  fastify.post('/webhooks/ml', handleMercadoLibreWebhook);
  fastify.post('/api/webhooks/meli', handleMercadoLibreWebhook); // Alias for user config

  console.log('📡 Webhook routes registered');
}
