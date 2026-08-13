import type { Socket } from 'socket.io';
import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { z } from 'zod';
import { verifyAccessToken } from '../lib/jwt';
import { getEnv } from '../lib/env';
import { getRedis } from '../lib/redis';
import { logger } from '../lib/logger';
import type { JwtPayload } from '../lib/jwt';

// ── Types ──────────────────────────────────────────────────

interface AuthenticatedSocket {
  userId: number;
  role: string;
  email: string;
  tokenExp: number;
}

// ── Zod Schemas for Incoming Events ───────────────────────

const JoinWaitlistSchema = z.object({
  technicianId: z.number().int().positive(),
});

const LeaveWaitlistSchema = z.object({
  technicianId: z.number().int().positive(),
});

// ── Server Instance ────────────────────────────────────────

let io: Server | null = null;

// ── Message Rate Limiting (per-socket) ─────────────────────

const socketMessageCounts = new Map<string, { count: number; resetAt: number }>();
const SOCKET_MSG_LIMIT = 30; // max 30 messages per second per socket
const SOCKET_MSG_WINDOW_MS = 1000;

function checkSocketRateLimit(socketId: string): boolean {
  const now = Date.now();
  const entry = socketMessageCounts.get(socketId);

  if (!entry || now > entry.resetAt) {
    socketMessageCounts.set(socketId, { count: 1, resetAt: now + SOCKET_MSG_WINDOW_MS });
    return true;
  }

  entry.count++;
  if (entry.count > SOCKET_MSG_LIMIT) {
    return false;
  }

  return true;
}

// Clean up stale rate-limit entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of socketMessageCounts) {
    if (now > entry.resetAt) socketMessageCounts.delete(id);
  }
}, 60_000);

// ── Helpers ────────────────────────────────────────────────

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > 0) {
      cookies[pair.substring(0, idx).trim()] = pair.substring(idx + 1).trim();
    }
  });
  return cookies;
}

/** Decode JWT without verification to read expiry (for token-expiry checks). */
function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]!;
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

// ── Event Validation Helper ────────────────────────────────

/**
 * Validate an incoming socket event payload against a Zod schema.
 * If valid, calls the handler. Otherwise, sends a structured error
 * via the acknowledgement callback.
 */
function validatedOn<T>(
  socket: Socket,
  event: string,
  schema: z.ZodSchema<T>,
  handler: (data: T, ack?: (response: unknown) => void) => void | Promise<void>,
): void {
  socket.on(event, (raw: unknown, ack?: (response: unknown) => void) => {
    // Rate limit
    if (!checkSocketRateLimit(socket.id)) {
      ack?.({ error: 'RATE_LIMITED', message: 'Too many messages' });
      return;
    }

    const result = schema.safeParse(raw);
    if (!result.success) {
      logger.warn({ socketId: socket.id, event, errors: result.error.flatten() }, '[Socket] Invalid payload');
      ack?.({ error: 'VALIDATION_ERROR', message: 'Invalid payload', details: result.error.flatten() });
      return;
    }

    handler(result.data, ack);
  });
}

// ── Public API ─────────────────────────────────────────────

/**
 * Initialize the Socket.IO server on an HTTP server instance.
 * Must be called once at startup.
 *
 * Room scheme:
 *   user:<userId>         — Personal notifications & wallet updates
 *   technician:<techId>   — Booking requests for a specific technician
 *   waitlist:<techId>     — Waitlist position updates (authorized access only)
 *   admin                 — Admin dashboard live updates
 */
export function initializeSocket(httpServer: HttpServer): Server {
  const env = getEnv();

  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    // ── RT-005: Redis adapter for multi-instance ──────────
    ...(getRedis()
      ? { adapter: createAdapter(getRedis()!, getRedis()!.duplicate()) }
      : {}),
  });

  // ── Authentication middleware ──────────────────────────
  io.use((socket, next) => {
    try {
      let token: string | undefined;

      // 1. Try explicit auth token (mobile / legacy clients)
      token =
        (socket.handshake.auth as Record<string, unknown>).token as string | undefined;

      // 2. Try query param (mobile fallback)
      if (!token) {
        token = (socket.handshake.query as Record<string, string>).token;
      }

      // 3. Try HttpOnly cookie (web same-origin connections)
      if (!token) {
        const rawCookie = socket.handshake.headers.cookie;
        if (rawCookie) {
          const cookies = parseCookies(rawCookie);
          token = cookies['gob_access'];
        }
      }

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // ── RT-004: Check token expiry before accepting ──
      const decodedHeader = decodeJwtPayload(token);
      if (decodedHeader?.exp && decodedHeader.exp * 1000 < Date.now()) {
        return next(new Error('Token expired — please re-authenticate'));
      }

      const decoded = verifyAccessToken(token) as unknown as JwtPayload;
      const tokenExp = decodedHeader?.exp ?? Math.floor(Date.now() / 1000) + 900;

      // Normalize: JWT uses `id`, socket code uses `userId`
      (socket as unknown as Record<string, unknown>).user = {
        userId: decoded.id,
        role: decoded.role,
        email: decoded.email,
        tokenExp,
      };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection handler ─────────────────────────────────
  io.on('connection', (socket) => {
    const user = (socket as unknown as Record<string, unknown>).user as
      AuthenticatedSocket | undefined;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    const { userId, role } = user;
    logger.info({ userId, role, socketId: socket.id }, '[Socket] Connected');

    // Join personal room (everyone gets one)
    socket.join(`user:${userId}`);

    // Technicians join their booking-requests room
    if (role === 'TECHNICIAN') {
      socket.join(`technician:${userId}`);
    }

    // Admins join the admin dashboard room
    if (role === 'ADMIN') {
      socket.join('admin');
    }

    // ── RT-003 + RT-006: Zod-validated events with ack ────

    // Waitlist: join (with authorization)
    validatedOn(socket, 'join:waitlist', JoinWaitlistSchema, (data, ack) => {
      // Technicians: only join their own waitlist room
      if (role === 'TECHNICIAN' && data.technicianId !== userId) {
        logger.warn({ userId, role, targetTechId: data.technicianId }, '[Socket] Unauthorized waitlist join');
        ack?.({ error: 'FORBIDDEN', message: 'Cannot join another technician waitlist' });
        return;
      }
      socket.join(`waitlist:${data.technicianId}`);
      ack?.({ ok: true, room: `waitlist:${data.technicianId}` });
    });

    // Waitlist: leave
    validatedOn(socket, 'leave:waitlist', LeaveWaitlistSchema, (data, ack) => {
      socket.leave(`waitlist:${data.technicianId}`);
      ack?.({ ok: true });
    });

    // ── RT-004: Token-expiry check on reconnect ──────────
    socket.on('reconnect_attempt', () => {
      // Token expiry is checked in middleware on re-handshake
      logger.debug({ userId }, '[Socket] Reconnect attempt');
    });

    // ── Ping health check (clients can verify connection) ──
    socket.on('ping:health', (_raw, ack) => {
      ack?.({ ok: true, timestamp: Date.now(), userId });
    });

    // ── Disconnect ────────────────────────────────────────
    socket.on('disconnect', (reason: string) => {
      logger.info({ userId, reason, socketId: socket.id }, '[Socket] Disconnected');
      // Clean up rate limit entry
      socketMessageCounts.delete(socket.id);
    });
  });

  logger.info('[Socket] Server initialized');
  return io;
}

/**
 * Return the active Socket.IO server instance.
 * Throws if not yet initialized.
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket() first.');
  }
  return io;
}

// ── Emit helpers (safe — no-op if server not initialized) ──

/** Emit an event to a specific user's personal room. */
export function emitToUser(userId: number, event: string, data: unknown): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/** Emit an event to a technician's booking-request room. */
export function emitToTechnician(techId: number, event: string, data: unknown): void {
  if (io) {
    io.to(`technician:${techId}`).emit(event, data);
  }
}

/** Emit an event to a technician's waitlist room. */
export function emitToWaitlist(techId: number, event: string, data: unknown): void {
  if (io) {
    io.to(`waitlist:${techId}`).emit(event, data);
  }
}

/** Emit an event to the admin dashboard room. */
export function emitToAdmin(event: string, data: unknown): void {
  if (io) {
    io.to('admin').emit(event, data);
  }
}
