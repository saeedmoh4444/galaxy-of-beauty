/**
 * Unit tests for frontend hooks.
 * Tests utility hooks used across the application.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock React
vi.mock('react', () => ({
  useState: (val) => [val, vi.fn()],
  useEffect: vi.fn(),
  useRef: vi.fn(() => ({ current: undefined })),
  useCallback: (fn) => fn,
}));

describe('useDebounce', () => {
  let useDebounce;

  beforeEach(async () => {
    vi.useFakeTimers();
    // Dynamic import to allow mocking
    const mod = await import('../../hooks/useDebounce');
    useDebounce = mod.default || mod.useDebounce;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be importable (module exists)', () => {
    // At minimum, verify the module exports a function
    expect(typeof useDebounce).toBe('function');
  });
});

describe('API Client (lib/api.js)', () => {
  let api;

  beforeEach(async () => {
    const mod = await import('../../lib/api');
    api = mod.default || mod.api;
  });

  it('should export an axios instance', () => {
    expect(api).toBeDefined();
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
    expect(typeof api.patch).toBe('function');
    expect(typeof api.delete).toBe('function');
  });

  it('should have base configuration', () => {
    expect(api.defaults).toBeDefined();
    expect(api.interceptors).toBeDefined();
  });
});

describe('Validators (frontend)', () => {
  it('should export auth validation schemas', async () => {
    const validators = await import('../../validators/auth');
    expect(validators.loginSchema || validators.default).toBeDefined();
    expect(validators.registerSchema || validators.default).toBeDefined();
  });
});
