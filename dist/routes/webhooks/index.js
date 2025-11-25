"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = webhookRoutes;
const mercadolibre_1 = require("./mercadolibre");
async function webhookRoutes(fastify) {
    // MercadoLibre webhook endpoint
    fastify.post('/webhooks/ml', mercadolibre_1.handleMercadoLibreWebhook);
    console.log('📡 Webhook routes registered');
}
