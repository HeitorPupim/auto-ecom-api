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

    // In the future, we will fetch Shopee and TinyERP accounts here too

    return {
      mercadolibre: mlAccounts,
      shopee: [],
      tinyerp: [],
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

    // Verify ownership
    const account = await prisma.mercadoLibreAccount.findUnique({
      where: { id },
    });

    if (!account || account.userId !== userId) {
      return reply.code(404).send({ error: 'Account not found' });
    }

    // Revoke authorization on MercadoLibre side
    try {
      await axios.delete(`https://api.mercadolibre.com/users/${account.mlUserId}/applications/${process.env.ML_CLIENT_ID}`, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      });
      console.log(`Revoked ML authorization for user ${account.mlUserId}`);
    } catch (error: any) {
      console.error('Failed to revoke ML authorization:', error.response?.data || error.message);
      // Continue with deletion even if revocation fails (token might be already invalid)
    }

    // Delete
    await prisma.mercadoLibreAccount.delete({
      where: { id },
    });

    return { success: true };
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

    // Verify ownership
    const account = await prisma.mercadoLibreAccount.findUnique({
      where: { id },
    });

    if (!account || account.userId !== userId) {
      return reply.code(404).send({ error: 'Account not found' });
    }

    // Trigger sync
    await mlSyncQueue.add('initial_sync', {
      userId,
      mlUserId: account.mlUserId,
      accessToken: account.accessToken,
    });

    return { success: true, message: 'Sync started' };
  });
}
