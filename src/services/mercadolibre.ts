import axios from 'axios';
import prisma from '../lib/prisma';

export async function refreshMercadoLibreToken(accountId: string) {
  const account = await prisma.mercadoLibreAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  try {
    const response = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
      params: {
        grant_type: 'refresh_token',
        client_id: process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        refresh_token: account.refreshToken,
      },
    });

    const { access_token, refresh_token, expires_in } = response.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Update account in database
    const updatedAccount = await prisma.mercadoLibreAccount.update({
      where: { id: accountId },
      data: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expiresAt,
      },
    });

    return updatedAccount;
  } catch (error) {
    console.error('Error refreshing ML token:', error);
    throw error;
  }
}

export async function getValidMercadoLibreToken(accountId: string) {
  const account = await prisma.mercadoLibreAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  // Check if token is expired or about to expire (e.g., within 5 minutes)
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (account.expiresAt < fiveMinutesFromNow) {
    console.log(`Token for account ${accountId} is expired or expiring soon. Refreshing...`);
    return (await refreshMercadoLibreToken(accountId)).accessToken;
  }

  return account.accessToken;
}
