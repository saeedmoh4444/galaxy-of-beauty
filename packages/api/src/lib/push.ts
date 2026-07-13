import { prisma } from '@galaxy/db';

// ── Types ──────────────────────────────────────────────────

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// ── Expo Push API ──────────────────────────────────────────

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

/**
 * Send a push notification via Expo's Push API.
 * Falls back to logging if EXPO_ACCESS_TOKEN is not configured.
 */
async function sendExpoPush(
  tokens: string[],
  message: PushMessage,
): Promise<void> {
  const accessToken = process.env['EXPO_ACCESS_TOKEN'];

  if (!accessToken) {
    // Expo push not configured — log for development
    // eslint-disable-next-line no-console
    console.log(`[Push] Would send to ${tokens.length} device(s): "${message.title}"`);
    return;
  }

  const messages = tokens.map((to) => ({
    to,
    sound: 'default' as const,
    title: message.title,
    body: message.body,
    data: message.data || {},
    priority: 'high' as const,
  }));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(`[Push] Expo API error: ${response.status}`);
      return;
    }

    const tickets = (await response.json()) as { data?: ExpoPushTicket[] };

    // Check for errors in individual tickets
    const errors = (tickets.data || []).filter((t) => t.status === 'error');
    if (errors.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        `[Push] ${errors.length} ticket(s) failed:`,
        errors.map((e) => e.details?.error || e.message),
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Push] Failed to send Expo push:', err);
  }
}

// ── Public API ─────────────────────────────────────────────

/**
 * Send a push notification to a specific user's registered devices.
 *
 * @param userId - The user to notify
 * @param message - The push notification payload
 */
export async function sendPushToUser(
  userId: number,
  message: PushMessage,
): Promise<void> {
  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    await sendExpoPush(
      tokens.map((t) => t.token),
      message,
    );
  } catch (err) {
    // Log but don't throw — push failures must not break the API
    // eslint-disable-next-line no-console
    console.error(`[Push] Error sending to user ${userId}:`, err);
  }
}

/**
 * Send a push notification to all admin users.
 */
export async function sendPushToAdmins(message: PushMessage): Promise<void> {
  try {
    const adminTokens = await prisma.pushToken.findMany({
      where: { user: { role: 'ADMIN' } },
      select: { token: true },
    });

    if (adminTokens.length === 0) return;

    await sendExpoPush(
      adminTokens.map((t) => t.token),
      message,
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Push] Error sending to admins:', err);
  }
}
