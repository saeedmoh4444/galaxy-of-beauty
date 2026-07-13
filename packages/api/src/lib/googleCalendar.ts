// ── Types ──────────────────────────────────────────────────

interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

// ── Configuration ──────────────────────────────────────────

function getGoogleConfig() {
  const clientId = process.env['GOOGLE_CLIENT_ID'];
  const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

// ── OAuth2 Token Exchange ──────────────────────────────────

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<GoogleTokens | null> {
  const config = getGoogleConfig();
  if (!config) return null;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok || !data['access_token']) return null;

    return {
      accessToken: data['access_token'] as string,
      refreshToken: data['refresh_token'] as string,
      expiryDate: Date.now() + (data['expires_in'] as number) * 1000,
    };
  } catch {
    return null;
  }
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokens | null> {
  const config = getGoogleConfig();
  if (!config) return null;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
      }).toString(),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok || !data['access_token']) return null;

    return {
      accessToken: data['access_token'] as string,
      refreshToken,
      expiryDate: Date.now() + (data['expires_in'] as number) * 1000,
    };
  } catch {
    return null;
  }
}

// ── Calendar Events ────────────────────────────────────────

interface CalendarEvent {
  summary: string;
  description?: string;
  start: string; // ISO 8601 date-time
  end: string;   // ISO 8601 date-time
  timezone?: string;
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: CalendarEvent,
): Promise<string | null> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description || '',
          start: {
            dateTime: event.start,
            timeZone: event.timezone || 'Asia/Riyadh',
          },
          end: {
            dateTime: event.end,
            timeZone: event.timezone || 'Asia/Riyadh',
          },
        }),
      },
    );

    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) return null;

    return data['id'] as string;
  } catch {
    return null;
  }
}

export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.ok || response.status === 410; // 410 = already deleted
  } catch {
    return false;
  }
}

/**
 * Get the Google OAuth2 authorization URL.
 */
export function getGoogleAuthUrl(redirectUri: string, state: string): string | null {
  const config = getGoogleConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
