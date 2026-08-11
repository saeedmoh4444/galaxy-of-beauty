import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { verifyAccessToken } from '../lib/jwt';
import { getEnv } from '../lib/env';
import type { JwtPayload } from '../lib/jwt';

// ── Types ──────────────────────────────────────────────────

interface AuthenticatedSocket {
  userId: number;
  role: string;
  email: string;
}

// ── Server Instance ────────────────────────────────────────

let io: Server | null = null;

// ── Helpers ────────────────────────────────────────────────

/**
 * Parse cookies from a raw cookie header string.
 */
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

      const decoded = verifyAccessToken(token) as unknown as JwtPayload;
      // Normalize: JWT uses `id`, socket code uses `userId`
      (socket as unknown as Record<string, unknown>).user = {
        userId: decoded.id,
        role: decoded.role,
        email: decoded.email,
      };
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection handler ─────────────────────────────────
  io.on('connection', (socket) => {
    const user = (socket as unknown as Record<string, unknown>).user as
      | AuthenticatedSocket
      | undefined;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    const { userId, role } = user;
    // eslint-disable-next-line no-console
    console.log(`[Socket] Connected: user=${userId} role=${role} socket=${socket.id}`);

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

    // ── Waitlist subscription (authorized) ──
    // Only customers can join another technician's waitlist.
    // Technicians can only join their own waitlist room.
    socket.on('join:waitlist', (technicianId: number) => {
      // Technicians: only join their own waitlist room
      if (role === 'TECHNICIAN' && technicianId !== userId) {
        // eslint-disable-next-line no-console
        console.warn(`[Socket] Unauthorized waitlist join: tech ${userId} → tech ${technicianId}`);
        return;
      }
      // Customers: allowed to join any waitlist room (public channel)
      socket.join(`waitlist:${technicianId}`);
    });

    socket.on('leave:waitlist', (technicianId: number) => {
      socket.leave(`waitlist:${technicianId}`);
    });

    socket.on('disconnect', (reason: string) => {
      // eslint-disable-next-line no-console
      console.log(`[Socket] Disconnected: user=${userId} reason=${reason}`);
    });
  });

  // eslint-disable-next-line no-console
  console.log('[Socket] Server initialized');
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

/**
 * Emit an event to a specific user's personal room.
 */
export function emitToUser(userId: number, event: string, data: unknown): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit an event to a technician's booking-request room.
 */
export function emitToTechnician(techId: number, event: string, data: unknown): void {
  if (io) {
    io.to(`technician:${techId}`).emit(event, data);
  }
}

/**
 * Emit an event to a technician's waitlist room.
 */
export function emitToWaitlist(techId: number, event: string, data: unknown): void {
  if (io) {
    io.to(`waitlist:${techId}`).emit(event, data);
  }
}

/**
 * Emit an event to the admin dashboard room.
 */
export function emitToAdmin(event: string, data: unknown): void {
  if (io) {
    io.to('admin').emit(event, data);
  }
}
