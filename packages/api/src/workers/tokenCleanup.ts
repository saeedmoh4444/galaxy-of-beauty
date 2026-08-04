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

    const total = expired.count + revoked.count + resetExpired.count + resetUsed.count;
    if (total > 0) {
      console.log(
        `[TokenCleanup] Purged ${total} tokens (refresh: ${expired.count + revoked.count}, reset: ${resetExpired.count + resetUsed.count})`,
      );
    }
  } catch (err: any) {
    console.error(`[TokenCleanup] Error: ${err.message}`);
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
