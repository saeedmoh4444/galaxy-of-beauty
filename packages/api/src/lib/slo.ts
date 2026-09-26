/**
 * 7.3 Observability 2.0 — in-process SLO counters.
 *
 * Cumulative since process start (resetSloCounters exists for tests and
 * ops); windowed decay is a follow-up. Fed by the requestCounter
 * middleware in trpc.ts: every procedure records a request, its latency,
 * and (on rejection) an error.
 */
import { burnRate } from '@galaxy/shared';

let requests = 0;
let errors = 0;
let latencies: number[] = [];

export function resetSloCounters(): void {
  requests = 0;
  errors = 0;
  latencies = [];
}

export function recordSloRequest(): void {
  requests++;
}

export function recordSloError(): void {
  errors++;
}

export function recordSloLatency(ms: number): void {
  latencies.push(ms);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const s = [...sorted].sort((a, b) => a - b);
  const idx = Math.ceil(p * s.length) - 1;
  return s[Math.max(0, idx)] ?? 0;
}

export function getSloSnapshot(): {
  requests: number;
  errors: number;
  availability: number;
  p95Ms: number;
  burnRate: number;
} {
  const availability =
    requests === 0 ? 1 : Math.round(((requests - errors) / requests) * 10_000) / 10_000;
  return {
    requests,
    errors,
    availability,
    p95Ms: percentile(latencies, 0.95),
    burnRate: burnRate(requests, errors),
  };
}
