/**
 * Circuit breakers for gateway facades — production hardening P0
 * (AUDIT_2026-10-30 item 6). A 3-state breaker per external dependency
 * (closed → open on the failure threshold → half-open probe → closed) so
 * a down gateway fails FAST instead of degrading whole flows. Registry
 * instances are per-facade bulkheads: OpenAI exhaustion must never open
 * the MyFatoorah circuit.
 */
import { logger } from './logger';

export type BreakerState = 'closed' | 'open' | 'halfOpen';

export interface CircuitBreakerOptions {
  name: string;
  /** Consecutive failures that open the circuit (default 5). */
  failureThreshold?: number;
  /** Open → half-open wait (default 30s). */
  resetTimeoutMs?: number;
  /** Alert/log hook on every state transition. */
  onStateChange?: (name: string, from: BreakerState, to: BreakerState) => void;
}

export class CircuitOpenError extends Error {
  constructor(public readonly breaker: string) {
    super(`Circuit open: ${breaker}`);
    this.name = 'CircuitOpenError';
  }
}

export class CircuitBreaker {
  state: BreakerState = 'closed';
  private failures = 0;
  private openedAt = 0;
  private probes = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(private readonly opts: CircuitBreakerOptions) {
    this.failureThreshold = opts.failureThreshold ?? 5;
    this.resetTimeoutMs = opts.resetTimeoutMs ?? 30_000;
  }

  private transition(to: BreakerState): void {
    if (this.state === to) return;
    const from = this.state;
    this.state = to;
    this.opts.onStateChange?.(this.opts.name, from, to);
    logger.warn({ breaker: this.opts.name, from, to }, 'circuit-breaker state change');
  }

  /**
   * Run a gateway call through the breaker. Throws CircuitOpenError when
   * the circuit is open (fast-fail, the fn is NOT called) — otherwise
   * returns/rethrows the fn's own result/error and counts failures.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.openedAt + this.resetTimeoutMs) {
        throw new CircuitOpenError(this.opts.name);
      }
      this.transition('halfOpen');
    }
    if (this.state === 'halfOpen' && this.probes >= 1) {
      throw new CircuitOpenError(this.opts.name);
    }
    if (this.state === 'halfOpen') this.probes += 1;

    try {
      const result = await fn();
      this.failures = 0;
      this.probes = 0;
      if (this.state !== 'closed') this.transition('closed');
      return result;
    } catch (err) {
      if (this.state === 'halfOpen') {
        // The probe failed — reopen immediately.
        this.probes = 0;
        this.openedAt = Date.now();
        this.transition('open');
      } else {
        this.failures += 1;
        if (this.failures >= this.failureThreshold) {
          this.openedAt = Date.now();
          this.transition('open');
        }
      }
      throw err;
    }
  }

  /** Test seam — back to a clean closed state. */
  reset(): void {
    this.failures = 0;
    this.probes = 0;
    this.openedAt = 0;
    if (this.state !== 'closed') this.transition('closed');
  }
}

const registry = new Map<string, CircuitBreaker>();

/** Per-gateway breaker instance (bulkheads) — one per name per process. */
export function getBreaker(
  name: string,
  opts?: Omit<CircuitBreakerOptions, 'name'>,
): CircuitBreaker {
  const existing = registry.get(name);
  if (existing) return existing;
  const breaker = new CircuitBreaker({ name, ...opts });
  registry.set(name, breaker);
  return breaker;
}

/** Test seam — reset every registered breaker between tests. */
export function resetAllBreakersForTests(): void {
  for (const breaker of registry.values()) breaker.reset();
}
