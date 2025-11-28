import { FastifyRequest, FastifyReply } from 'fastify';

// TinyERP Webhook Handler
export async function handleTinyERPWebhook(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const payload = request.body;
    console.log('Received TinyERP Webhook:', JSON.stringify(payload, null, 2));

    // TODO: Process the webhook payload
    // TinyERP webhooks usually send data about orders, products, etc.
    // We need to determine the type of event and handle it accordingly.

    return reply.code(200).send({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error handling TinyERP webhook:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
