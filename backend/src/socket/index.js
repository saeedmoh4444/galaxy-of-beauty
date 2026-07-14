import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

let io;

/**
 * Initialize Socket.IO server.
 * Authenticates connections via JWT and joins rooms based on user role/ID.
 *
 * Rooms:
 *   - user:<userId>        Personal notifications
 *   - technician:<techId>  Booking requests for a technician
 *   - waitlist:<techId>    Waitlist updates per technician
 *   - admin                Admin dashboard updates
 *
 * @param {import('http').Server} httpServer
 * @returns {Server}
 */
export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = verifyToken(token, 'access');
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role } = socket.user;
    logger.info('Socket connected', { userId, role, socketId: socket.id });

    // Join personal room
    socket.join(`user:${userId}`);

    // Technicians join their booking-requests room
    if (role === 'TECHNICIAN') {
      socket.join(`technician:${userId}`);
      logger.debug('Technician joined room', { userId });
    }

    // Admins join admin room
    if (role === 'ADMIN') {
      socket.join('admin');
      logger.debug('Admin joined admin room');
    }

    // Waitlist updates
    socket.on('join:waitlist', (technicianId) => {
      socket.join(`waitlist:${technicianId}`);
    });

    socket.on('leave:waitlist', (technicianId) => {
      socket.leave(`waitlist:${technicianId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { userId, reason });
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

/**
 * Get the Socket.IO server instance.
 * @returns {Server}
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}

/**
 * Emit an event to a specific user's room.
 * @param {number|string} userId
 * @param {string} event
 * @param {object} data
 */
export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit an event to a technician's booking room.
 * @param {number|string} techId
 * @param {string} event
 * @param {object} data
 */
export function emitToTechnician(techId, event, data) {
  if (io) {
    io.to(`technician:${techId}`).emit(event, data);
  }
}

/**
 * Emit to waitlist room.
 * @param {number|string} techId
 * @param {string} event
 * @param {object} data
 */
export function emitToWaitlist(techId, event, data) {
  if (io) {
    io.to(`waitlist:${techId}`).emit(event, data);
  }
}

/**
 * Emit to admin dashboard room.
 * @param {string} event
 * @param {object} data
 */
export function emitToAdmin(event, data) {
  if (io) {
    io.to('admin').emit(event, data);
  }
}

export default { initializeSocket, getIO, emitToUser, emitToTechnician, emitToWaitlist, emitToAdmin };
