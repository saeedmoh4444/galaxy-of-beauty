import { describe, it, expect } from 'vitest';
import { assessQueueHealth, DEFAULT_THRESHOLDS } from '../lib/queueHealth';

const q = (
  name: string,
  counts: {
    waiting?: number;
    active?: number;
    delayed?: number;
    failed?: number;
    completed?: number;
  },
) => ({
  name,
  counts: { waiting: 0, active: 0, delayed: 0, failed: 0, completed: 0, ...counts } as {
    waiting: number;
    active: number;
    delayed: number;
    failed: number;
    completed: number;
  },
  sampleFailed: [] as Array<{ id: string; failedReason: string }>,
});

describe('assessQueueHealth', () => {
  it('is ok when every queue is within thresholds', () => {
    const res = assessQueueHealth([q('a', { waiting: 5 }), q('b', { failed: 2 })]);
    expect(res.status).toBe('ok');
    expect(res.reasons).toEqual([]);
  });

  it('flags failed jobs at the critical threshold', () => {
    const res = assessQueueHealth([q('a', { failed: DEFAULT_THRESHOLDS.failedCritical })]);
    expect(res.status).toBe('critical');
    expect(res.reasons[0]).toContain('20 failed');
  });

  it('warns on a long waiting queue and escalates at the critical bound', () => {
    expect(assessQueueHealth([q('a', { waiting: 100 })]).status).toBe('warn');
    expect(assessQueueHealth([q('a', { waiting: 500 })]).status).toBe('critical');
  });

  it('warns on a growing delayed backlog', () => {
    const res = assessQueueHealth([q('a', { delayed: 200 })]);
    expect(res.status).toBe('warn');
  });

  it('ignores queues with null counts (Redis unavailable — degraded)', () => {
    const res = assessQueueHealth([{ name: 'x', counts: null, sampleFailed: [] }]);
    expect(res.status).toBe('ok');
  });
});
