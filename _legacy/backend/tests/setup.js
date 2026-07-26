/**
 * Jest test setup — ESM format.
 */
import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/Galaxy_of_Beauty_db_test?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-characters!!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-characters!!!';
process.env.REDIS_URL = 'redis://localhost:6379';

// Increase timeout for integration tests
jest.setTimeout(30000);
