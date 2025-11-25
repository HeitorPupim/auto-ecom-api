import { FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import prisma from '../../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const callbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(), // We'll use state to pass the userId
});

// Helper to generate PKCE Verifier and Challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

export async function handleMercadoLibreCallback(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { code, state } = callbackSchema.parse(request.query);

    // In a real app, we should validate 'state' to prevent CSRF and ensure it matches the user
    // For now, we assume 'state' is the userId
    const userId = state;

    if (!userId) {
      return reply.code(400).send({ error: 'Missing state (userId)' });
    }

    // Verify if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return reply.redirect(`${frontendUrl}/dashboard/integrations?integration=error&message=UserNotFound`);
    }

    // Retrieve code_verifier from cookie
    const codeVerifier = request.cookies.ml_code_verifier;

    if (!codeVerifier) {
      console.error('Missing code_verifier cookie');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return reply.redirect(`${frontendUrl}/dashboard/integrations?integration=error&message=MissingCodeVerifier`);
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.ML_REDIRECT_URI || 'http://localhost:8001/auth/callback/mercadolibre',
        code_verifier: codeVerifier, // Send the verifier
      },
    });

    const { access_token, refresh_token, expires_in, user_id: mlUserId } = tokenResponse.data;

    // Get ML User Info to get nickname and siteId
    const userResponse = await axios.get(`https://api.mercadolibre.com/users/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { nickname, site_id } = userResponse.data;

    // Calculate expiration date
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Save/Update account in database
    await prisma.mercadoLibreAccount.upsert({
      where: {
        userId_mlUserId: {
          userId: userId,
          mlUserId: mlUserId.toString(),
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expiresAt,
        nickname: nickname,
        siteId: site_id,
        isActive: true,
      },
      create: {
        userId: userId,
        mlUserId: mlUserId.toString(),
        nickname: nickname,
        siteId: site_id,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expiresAt,
      },
    });

    // Clear the cookie
    reply.clearCookie('ml_code_verifier', { path: '/' });

    // Redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return reply.redirect(`${frontendUrl}/dashboard/integrations?integration=success`);

  } catch (error: any) {
    console.error('Error handling ML callback:', error);
    console.error('Error details:', error.response?.data || error.message);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = error.response?.data?.message || error.message || 'UnknownError';
    return reply.redirect(`${frontendUrl}/dashboard/integrations?integration=error&message=${encodeURIComponent(errorMessage)}`);
  }
}

export async function getMercadoLibreAuthUrl(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Authenticate user to get userId for state
    await request.jwtVerify();
    const { id: userId } = request.user as { id: string };

    const redirectUri = process.env.ML_REDIRECT_URI || 'http://localhost:8001/auth/callback/mercadolibre';
    const clientId = process.env.ML_CLIENT_ID;

    if (!clientId) {
      return reply.code(500).send({ error: 'ML_CLIENT_ID not configured' });
    }

    // Generate PKCE
    const { verifier, challenge } = generatePKCE();

    // Store verifier in cookie (httpOnly, secure in prod)
    reply.setCookie('ml_code_verifier', verifier, {
      path: '/',
      httpOnly: true,
      secure: true, // Always true because we need SameSite=None for cross-domain (Localhost -> Ngrok)
      maxAge: 60 * 10, // 10 minutes
      sameSite: 'none', // Allow cross-site cookie (Frontend Localhost -> Backend Ngrok)
    });

    // Construct URL
    // We use .com.br as default but it works for other regions usually, or we can make it configurable
    const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${userId}&code_challenge=${challenge}&code_challenge_method=S256`;

    return { url: authUrl };
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
