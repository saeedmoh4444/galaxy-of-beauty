/**
 * 4.2 A/B testing — deterministic variant assignment.
 *
 * A user always lands in the same variant for a given test (hash of
 * userId + testKey), so their experience is stable across sessions.
 * `trafficSplit` (1–99) is the percentage sent to variant B.
 */
import { createHash } from 'node:crypto';

export function assignVariant(userId: number, testKey: string, trafficSplit: number): 'A' | 'B' {
  const hash = createHash('sha256').update(`${userId}:${testKey}`).digest();
  const bucket = hash[0]! % 100;
  return bucket < trafficSplit ? 'B' : 'A';
}
