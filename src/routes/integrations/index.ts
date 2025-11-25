import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';

export async function integrationRoutes(fastify: FastifyInstance) {
  fastify.get('/integrations', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }]
  }, async (request, reply) => {
    const { id: userId } = request.user as { id: string };

    const mlAccounts = await prisma.mercadoLibreAccount.findMany({
      where: { userId },
      select: {
        id: true,
        nickname: true,
        siteId: true,
        isActive: true,
        mlUserId: true,
      }
    });

    // In the future, we will fetch Shopee and TinyERP accounts here too

    return {
      mercadolibre: mlAccounts,
      shopee: [],
      tinyerp: [],
    };
  });
}
