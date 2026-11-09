import { prisma } from '@galaxy/db';
import { logger } from './logger';

import { getBreaker } from './circuitBreaker';

// Circuit breaker (P0 hardening): a down Expo push service fails fast.
const expoPushBreaker = getBreaker('expo-push', { failureThreshold: 3, resetTimeoutMs: 15_000 });

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
 * E2 — classify Expo's per-ticket responses: a DeviceNotRegistered ticket
 * means the app was uninstalled (or the token rotated) and every future
 * send to it is wasted. Returns the indexes into the token array that must
 * be pruned. Transient errors (MessageTooBig, etc.) are deliberately kept.
 */
export function invalidTokenIndexes(tickets: ExpoPushTicket[]): number[] {
  return tickets
    .map((t, i) => (t.status === 'error' && t.details?.error === 'DeviceNotRegistered' ? i : -1))
    .filter((i) => i >= 0);
}

/**
 * Send a push notification via Expo's Push API.
 * Falls back to logging if EXPO_ACCESS_TOKEN is not configured.
 */
async function sendExpoPush(tokens: string[], message: PushMessage): Promise<void> {
  const accessToken = process.env['EXPO_ACCESS_TOKEN'];

  if (!accessToken) {
    logger.warn({ tokenCount: tokens.length, title: message.title }, 'Expo push not configured');
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
    const response = await expoPushBreaker.execute(() =>
      fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(messages),
      }),
    );

    if (!response.ok) {
      logger.error({ status: response.status }, 'Expo push API error');
      return;
    }

    const tickets = (await response.json()) as { data?: ExpoPushTicket[] };

    const errors = (tickets.data || []).filter((t) => t.status === 'error');
    if (errors.length > 0) {
      // Count only — never log individual ticket details (contains device tokens)
      logger.error(
        { errorCount: errors.length, totalCount: tickets.data?.length },
        'Expo push ticket errors',
      );
    }

    // E2 — prune dead device tokens (app uninstalled / token rotated):
    // every future send to them is a wasted request AND counts against the
    // circuit breaker. Tickets align 1:1 with the message array.
    const dead = invalidTokenIndexes(tickets.data || []);
    if (dead.length > 0) {
      const deadTokens = dead
        .map((i) => tokens[i])
        .filter((t): t is string => typeof t === 'string' && t.length > 0);
      await prisma.pushToken
        .deleteMany({ where: { token: { in: deadTokens } } })
        .then((r) => {
          if (r.count > 0) {
            logger.warn({ pruned: r.count }, 'Pruned dead push tokens');
          }
        })
        .catch((err) => {
          logger.warn({ err }, 'Failed to prune dead push tokens');
        });
    }
  } catch (err) {
    logger.error({ err }, 'Failed to send Expo push');
  }
}

// ── Public API ─────────────────────────────────────────────

/**
 * Send a push notification to a specific user's registered devices.
 *
 * @param userId - The user to notify
 * @param message - The push notification payload
 */
export async function sendPushToUser(userId: number, message: PushMessage): Promise<void> {
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
    console.error('[Push] Error sending to admins:', err);
  }
}
