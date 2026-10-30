/**
 * Circuit breakers for gateway facades (production hardening P0 —
 * AUDIT_2026-10-30 item 6). A 3-state breaker per external dependency
 * (closed → open on the failure threshold → half-open probe → closed)
 * so a down gateway fails FAST instead of degrading whole flows.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CircuitBreaker,
  CircuitOpenError,
  getBreaker,
  resetAllBreakersForTests,
} from '../lib/circuitBreaker';

describe('circuit breaker', () => {
  beforeEach(() => {
    resetAllBreakersForTests();
  });

  it('passes calls through while closed and resets the failure count on success', async () => {
    const breaker = new CircuitBreaker({ name: 'test', failureThreshold: 3 });
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(42);
    await expect(breaker.execute(fn)).rejects.toThrow('boom');
    await expect(breaker.execute(fn)).rejects.toThrow('boom');
    // Two failures then a success — the count resets, never opens.
    const ok = await breaker.execute(fn);
    expect(ok).toBe(42);
    expect(breaker.state).toBe('closed');
  });

  it('opens after the failure threshold and rejects fast without calling the fn', async () => {
    const breaker = new CircuitBreaker({ name: 'test', failureThreshold: 3 });
    const fn = vi.fn().mockRejectedValue(new Error('down'));
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(fn)).rejects.toThrow('down');
    }
    expect(breaker.state).toBe('open');

    const calls = fn.mock.calls.length;
    await expect(breaker.execute(fn)).rejects.toBeInstanceOf(CircuitOpenError);
    await expect(breaker.execute(fn)).rejects.toBeInstanceOf(CircuitOpenError);
    expect(fn.mock.calls.length).toBe(calls); // fast-fail — no new gateway calls
  });

  it('half-open probe succeeds and closes the circuit', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 2,
      resetTimeoutMs: 20,
    });
    // Force the failure path deterministically:
    const bad = vi.fn().mockRejectedValue(new Error('down'));
    await expect(breaker.execute(bad)).rejects.toThrow('down');
    await expect(breaker.execute(bad)).rejects.toThrow('down');
    expect(breaker.state).toBe('open');

    await new Promise((r) => setTimeout(r, 25)); // pass the reset timeout
    const ok = await breaker.execute(async () => 'recovered');
    expect(ok).toBe('recovered');
    expect(breaker.state).toBe('closed');
  });

  it('half-open probe failure reopens the circuit', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 2,
      resetTimeoutMs: 20,
    });
    const bad = vi.fn().mockRejectedValue(new Error('still down'));
    await expect(breaker.execute(bad)).rejects.toThrow('still down');
    await expect(breaker.execute(bad)).rejects.toThrow('still down');
    expect(breaker.state).toBe('open');

    await new Promise((r) => setTimeout(r, 25));
    await expect(breaker.execute(bad)).rejects.toThrow('still down');
    expect(breaker.state).toBe('open'); // probe failed → open again
  });

  it('rejects extra calls while a half-open probe is in flight', async () => {
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 1,
      resetTimeoutMs: 10,
    });
    const bad = vi.fn().mockRejectedValue(new Error('down'));
    await expect(breaker.execute(bad)).rejects.toThrow('down');
    await new Promise((r) => setTimeout(r, 15));

    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const probe = breaker.execute(async () => {
      await gate;
      return 'ok';
    });
    await expect(breaker.execute(async () => 'x')).rejects.toBeInstanceOf(CircuitOpenError);
    release();
    expect(await probe).toBe('ok');
    expect(breaker.state).toBe('closed');
  });

  it('keeps per-gateway instances isolated through the registry', () => {
    const a = getBreaker('gateway-a', { failureThreshold: 1 });
    const b = getBreaker('gateway-b', { failureThreshold: 1 });
    expect(a).not.toBe(b);
    expect(getBreaker('gateway-a')).toBe(a); // same instance per name
  });

  it('reports state changes through the hook', async () => {
    const changes: Array<[string, string]> = [];
    const breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 1,
      resetTimeoutMs: 10,
      onStateChange: (_n, from, to) => changes.push([from, to]),
    });
    await expect(breaker.execute(async () => 1))
      .rejects.toThrow('down')
      .catch(() => {});
    const bad = vi.fn().mockRejectedValue(new Error('down'));
    await expect(breaker.execute(bad)).rejects.toThrow('down');
    expect(changes).toContainEqual(['closed', 'open']);
  });
});
