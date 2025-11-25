"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMercadoLibreWebhook = handleMercadoLibreWebhook;
const queues_1 = require("../../queues");
async function handleMercadoLibreWebhook(request, reply) {
    try {
        // TODO: Validate ML webhook signature
        // const signature = request.headers['x-signature'];
        // if (!validateMLSignature(signature, request.body)) {
        //   return reply.code(401).send({ error: 'Invalid signature' });
        // }
        const { topic, resource, user_id, application_id } = request.body;
        // Add job to queue immediately (very fast)
        await queues_1.mlWebhookQueue.add('process-webhook', {
            topic,
            resource,
            userId: user_id,
            applicationId: application_id,
            receivedAt: new Date(),
        });
        console.log(`📨 Webhook received: ${topic} - ${resource}`);
        // Respond immediately (under 100ms)
        return reply.code(200).send({ ok: true });
    }
    catch (error) {
        console.error('Error handling webhook:', error);
        return reply.code(500).send({ error: 'Internal server error' });
    }
}
// TODO: Implement signature validation
// function validateMLSignature(signature: string, body: any): boolean {
//   // ML webhook signature validation logic
//   return true;
// }
