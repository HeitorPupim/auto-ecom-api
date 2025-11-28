import { FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import prisma from '../../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { tinyerpSyncQueue } from '../../workers/tinyerp-sync.worker';

// TinyERP might not use PKCE, but we'll keep the structure similar to ML for consistency if applicable.
// However, TinyERP usually uses a simpler API key or a different OAuth flow.
// Assuming standard OAuth2 for now based on "Redirect URL" request.

const callbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

const TINY_AUTH_URL = 'https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/auth';
const TINY_TOKEN_URL = 'https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token';

export async function handleTinyERPCallback(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { code, state } = callbackSchema.parse(request.query);
    const userId = state;

    if (!userId) {
      return reply.code(400).send({ error: 'Missing state (userId)' });
    }

    // Verify if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return reply.redirect(`${frontendUrl}/integrations?integration=error&message=UserNotFound`);
    }

    const redirectUri = process.env.TINY_REDIRECT_URI || 'http://localhost:8001/auth/callback/tiny';
    const clientId = process.env.TINY_CLIENT_ID;
    const clientSecret = process.env.TINY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('TinyERP credentials not configured');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return reply.redirect(`${frontendUrl}/integrations?integration=error&message=ServerConfigError`);
    }

    // Exchange code for tokens
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirectUri);
    params.append('code', code);

    const tokenResponse = await axios.post(TINY_TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Calculate expiration date
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Save/Update account in database
    const account = await prisma.tinyERPAccount.upsert({
      where: {
        userId: userId,
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expiresAt,
        isActive: true,
        syncStatus: 'idle', // Reset sync status on reconnect
      },
      create: {
        userId: userId,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expiresAt,
      },
    });

    console.log(`TinyERP Token received and saved for user ${userId}`);

    // Trigger initial sync
    await tinyerpSyncQueue.add('initial_sync', {
      userId,
      accountId: account.id,
      syncType: 'initial_sync',
    });

    // Redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return reply.redirect(`${frontendUrl}/integrations?integration=success&provider=tiny`);

  } catch (error: any) {
    console.error('Error handling TinyERP callback:', error);
    console.error('Error details:', error.response?.data || error.message);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = error.response?.data?.error_description || error.message || 'UnknownError';
    return reply.redirect(`${frontendUrl}/integrations?integration=error&message=${encodeURIComponent(errorMessage)}`);
  }
}

export async function getTinyERPAuthUrl(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const { id: userId } = request.user as { id: string };

    const redirectUri = process.env.TINY_REDIRECT_URI || 'http://localhost:8001/auth/callback/tiny';
    const clientId = process.env.TINY_CLIENT_ID;

    if (!clientId) {
      return reply.code(500).send({ error: 'TINY_CLIENT_ID not configured' });
    }

    // Construct URL
    const authUrl = `${TINY_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${userId}&scope=openid`;

    return { url: authUrl };
  } catch (error) {
    console.error('Error generating TinyERP auth URL:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}


