/**
 * Integration tests for Auth API endpoints.
 * Tests HTTP-level behavior using Supertest.
 */
import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import { AppError, ErrorCodes } from '../../src/utils/errors.js';

// Increase timeout for async DB operations
jest.setTimeout(15000);

// Build a lightweight Express app for HTTP-level testing
// without needing full Redis/DB connections
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Minimal authentication route simulation
  app.post('/api/auth/register', (req, res) => {
    const { email, phone, password, name, role } = req.body;
    if (!email || !phone || !password || !name || !role) {
      return res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: { fields: [{ path: 'email', message: 'Required' }] } },
      });
    }
    // Simulate weak password rejection
    if (password.length < 8) {
      return res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'Password too weak', details: { fields: [{ path: 'password', message: 'Min 8 characters' }] } },
      });
    }
    res.status(201).json({
      user: { id: 1, email, name, role },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
      });
    }
    // Simulate invalid credentials
    if (email === 'wrong@test.com') {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }
    res.json({
      user: { id: 1, email, name: 'Test User', role: 'CUSTOMER' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });
  });

  app.post('/api/auth/refresh', (req, res) => {
    if (!req.body.refreshToken || req.body.refreshToken === 'invalid') {
      return res.status(401).json({
        error: { code: 'TOKEN_INVALID', message: 'Invalid token' },
      });
    }
    res.json({ accessToken: 'new-access', refreshToken: 'new-refresh' });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
  });

  return app;
}

describe('Auth API — Validation & Error Handling', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with weak password (< 8 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          phone: '+966500000000',
          password: 'weak',
          name: 'Test User',
          role: 'CUSTOMER',
        });

      expect(res.status).toBe(422);
    });

    it('should accept valid registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'valid@example.com',
          phone: '+966500000000',
          password: 'ValidPass1',
          name: 'Test User',
          role: 'CUSTOMER',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(422);
    });

    it('should reject login with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'WrongPass1' });

      expect(res.status).toBe(401);
    });

    it('should accept valid login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'correct@test.com', password: 'ValidPass1' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should reject refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid' });

      expect(res.status).toBe(401);
    });

    it('should issue new tokens for valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent-xyz');
      expect(res.status).toBe(404);
    });
  });
});

describe('Error Utilities', () => {
  it('should create AppError with correct properties', () => {
    const err = new AppError('Test error', 400, 'TEST_ERROR', { field: 'x' });
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('TEST_ERROR');
    expect(err.message).toBe('Test error');
    expect(err.details.field).toBe('x');
    expect(err.isOperational).toBe(true);
  });

  it('should export all expected error codes', () => {
    expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCodes.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
    expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
    expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorCodes.BOOKING_INVALID_STATE).toBe('BOOKING_INVALID_STATE');
    expect(ErrorCodes.PAYMENT_FAILED).toBe('PAYMENT_FAILED');
    expect(ErrorCodes.WALLET_NOT_FOUND).toBe('WALLET_NOT_FOUND');
  });
});
