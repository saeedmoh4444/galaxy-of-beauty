import prisma from '../config/database.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import logger from '../config/logger.js';
import env from '../config/env.js';
import { encrypt, decrypt } from '../utils/encryption.js';

/**
 * Exchange Google OAuth authorization code for tokens.
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env.
 */
export async function connectGoogleCalendar(userId, authCode, redirectUri) {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new AppError('Google Calendar integration not configured', 503, ErrorCodes.SERVICE_UNAVAILABLE);
  }

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: authCode,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.json();
    logger.error('Google OAuth token exchange failed', { error: err });
    throw new AppError('Failed to connect Google Calendar', 400, ErrorCodes.INVALID_INPUT);
  }

  const tokens = await tokenResponse.json();

  // Get user email from Google
  const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await userInfo.json();

  // Store encrypted tokens in technician profile
  const encryptedTokenData = encrypt(JSON.stringify({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + (tokens.expires_in * 1000),
  }));

  await prisma.technician.update({
    where: { userId },
    data: {
      googleCalendarToken: encryptedTokenData,
      googleCalendarEmail: profile.email,
    },
  });

  logger.info('Google Calendar connected', { userId, googleEmail: profile.email });

  return { connected: true, email: profile.email };
}

/**
 * Disconnect Google Calendar integration.
 */
export async function disconnectGoogleCalendar(userId) {
  await prisma.technician.update({
    where: { userId },
    data: {
      googleCalendarToken: null,
      googleCalendarEmail: null,
    },
  });

  logger.info('Google Calendar disconnected', { userId });
  return { connected: false };
}

/**
 * Refresh Google access token if expired.
 */
export async function refreshGoogleToken(userId) {
  const tech = await prisma.technician.findUnique({ where: { userId } });
  if (!tech?.googleCalendarToken) return null;

  const decrypted = decrypt(tech.googleCalendarToken);
  if (!decrypted) return null;

  const tokens = JSON.parse(decrypted);

  if (Date.now() < tokens.expires_at - 60000) {
    return tokens.access_token; // Still valid
  }

  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) return null;

  const newTokens = await response.json();

  const updatedTokenData = encrypt(JSON.stringify({
    ...tokens,
    access_token: newTokens.access_token,
    expires_at: Date.now() + (newTokens.expires_in * 1000),
  }));

  await prisma.technician.update({
    where: { userId },
    data: {
      googleCalendarToken: updatedTokenData,
    },
  });

  return newTokens.access_token;
}

/**
 * Get Google Calendar connection status.
 */
export async function getCalendarStatus(userId) {
  const tech = await prisma.technician.findUnique({
    where: { userId },
    select: { googleCalendarEmail: true, googleCalendarToken: true },
  });

  return {
    connected: !!tech?.googleCalendarToken,
    email: tech?.googleCalendarEmail || null,
  };
}

export default { connectGoogleCalendar, disconnectGoogleCalendar, refreshGoogleToken, getCalendarStatus };
