import axios from 'axios';
import prisma from './prisma';

const TINY_TOKEN_URL = 'https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token';

// Helper function to refresh token
export async function refreshTinyERPToken(userId: string) {
  try {
    const account = await prisma.tinyERPAccount.findUnique({
      where: { userId },
    });

    if (!account || !account.refreshToken) {
      throw new Error('No TinyERP account or refresh token found');
    }

    const clientId = process.env.TINY_CLIENT_ID;
    const clientSecret = process.env.TINY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('TinyERP credentials not configured');
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('refresh_token', account.refreshToken);

    const response = await axios.post(TINY_TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Update account
    const updatedAccount = await prisma.tinyERPAccount.update({
      where: { userId },
      data: {
        accessToken: access_token,
        refreshToken: refresh_token, // Tiny might rotate refresh tokens
        expiresAt: expiresAt,
      },
    });

    return updatedAccount.accessToken;
  } catch (error: any) {
    console.error('Error refreshing TinyERP token:', error.response?.data || error.message);
    throw error;
  }
}
