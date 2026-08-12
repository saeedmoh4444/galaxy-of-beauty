/**
 * Periodic cleanup of expired/revoked refresh tokens.
 * Runs every hour via setInterval. Can also be triggered manually.
 */
import { prisma } from '@galaxy/db';

const CLEANUP_INTERVAL_MS = 3600_000; // 1 hour

let intervalId: ReturnType<typeof setInterval> | null = null;

async function cleanupTokens(): Promise<void> {
  try {
    const now = new Date();

    // Delete expired refresh tokens
    const expired = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    // Delete revoked tokens
    const revoked = await prisma.refreshToken.deleteMany({
      where: { revokedAt: { not: null } },
    });

    // Delete expired reset tokens
    const resetExpired = await prisma.resetToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    // Delete used reset tokens
    const resetUsed = await prisma.resetToken.deleteMany({
      where: { usedAt: { not: null } },
    });

    // Clean old notifications (30+ days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const oldNotifs = await prisma.notification.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo }, isRead: true },
    });

    const total =
      expired.count + revoked.count + resetExpired.count + resetUsed.count + oldNotifs.count;
    if (total > 0) {
      console.log(
        `[Cleanup] Purged ${total} items (refresh: ${expired.count + revoked.count}, reset: ${resetExpired.count + resetUsed.count}, notifications: ${oldNotifs.count})`,
      );
    }
  } catch (err: any) {
    console.error(`[Cleanup] Error: ${err.message}`);
  }
}

export function startTokenCleanup(): void {
  if (intervalId) return;

  // Run immediately on start
  cleanupTokens();

  // Then every hour
  intervalId = setInterval(cleanupTokens, CLEANUP_INTERVAL_MS);
  console.log(`[TokenCleanup] Scheduled every ${CLEANUP_INTERVAL_MS / 1000}s`);
}

export function stopTokenCleanup(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
