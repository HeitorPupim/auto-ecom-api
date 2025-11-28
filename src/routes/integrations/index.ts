import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { mlSyncQueue } from '../../queues';
import axios from 'axios';

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
        syncStatus: true,
        syncProgress: true,
      }
    });

    const tinyAccounts = await prisma.tinyERPAccount.findMany({
      where: { userId },
      select: {
        id: true,
        isActive: true,
        syncStatus: true,
        syncProgress: true,
        lastSyncAt: true,
      }
    });

    return {
      mercadolibre: mlAccounts,
      shopee: [],
      tinyerp: tinyAccounts.map(acc => ({
        ...acc,
        nickname: 'TinyERP Account', // TinyERP doesn't have a nickname in the same way
        accountId: acc.id,
      })),
    };
  });

  fastify.delete('/integrations/:id', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }]
  }, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id } = request.params as { id: string };

    console.log(`Attempting to delete integration ${id} for user ${userId}`);

    // Verify ownership (MercadoLibre)
    const mlAccount = await prisma.mercadoLibreAccount.findUnique({
      where: { id },
    });

    if (mlAccount && mlAccount.userId === userId) {
      // Revoke authorization on MercadoLibre side
      try {
        await axios.delete(`https://api.mercadolibre.com/users/${mlAccount.mlUserId}/applications/${process.env.ML_CLIENT_ID}`, {
          headers: {
            Authorization: `Bearer ${mlAccount.accessToken}`,
          },
        });
        console.log(`Revoked ML authorization for user ${mlAccount.mlUserId}`);
      } catch (error: any) {
        console.error('Failed to revoke ML authorization:', error.response?.data || error.message);
      }

      await prisma.mercadoLibreAccount.delete({ where: { id } });
      return { success: true };
    }

    // Verify ownership (TinyERP)
    const tinyAccount = await prisma.tinyERPAccount.findUnique({
      where: { id },
    });

    if (tinyAccount && tinyAccount.userId === userId) {
      await prisma.tinyERPAccount.delete({ where: { id } });
      return { success: true };
    }

    return reply.code(404).send({ error: 'Account not found' });
  });


  fastify.post('/integrations/:id/sync', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }]
  }, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id } = request.params as { id: string };

    // Check MercadoLibre
    const mlAccount = await prisma.mercadoLibreAccount.findUnique({
      where: { id },
    });

    if (mlAccount && mlAccount.userId === userId) {
      await mlSyncQueue.add('initial_sync', {
        userId,
        mlUserId: mlAccount.mlUserId,
        accessToken: mlAccount.accessToken,
      });
      return { success: true, message: 'MercadoLibre sync started' };
    }

    // Check TinyERP
    const tinyAccount = await prisma.tinyERPAccount.findUnique({
      where: { id },
    });

    if (tinyAccount && tinyAccount.userId === userId) {
      // Import queue dynamically or use the imported instance if available
      const { tinyerpSyncQueue } = await import('../../workers/tinyerp-sync.worker');

      await tinyerpSyncQueue.add('sync_products', {
        userId,
        accountId: tinyAccount.id,
        syncType: 'product',
      });
      return { success: true, message: 'TinyERP sync started' };
    }

    return reply.code(404).send({ error: 'Account not found' });
  });
}
