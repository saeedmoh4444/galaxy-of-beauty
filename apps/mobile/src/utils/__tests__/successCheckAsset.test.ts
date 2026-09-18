import { describe, it, expect } from 'vitest';
import successCheck from '@galaxy/ui/assets/success-check.json';

// The confirmation animation ships as a hand-authored Lottie JSON —
// this test guards its structural contract (version, frame rate, a
// shape layer with a trim-path animator and a green stroke) so a
// malformed edit fails here instead of rendering blank on devices.
describe('success-check.lottie.json', () => {
  it('is a valid Lottie animation document', () => {
    expect(successCheck.v).toMatch(/^5\./);
    expect(successCheck.fr).toBe(60);
    expect(successCheck.w).toBe(100);
    expect(successCheck.h).toBe(100);
    expect(Array.isArray(successCheck.layers)).toBe(true);
    expect(successCheck.layers.length).toBeGreaterThan(0);
  });

  it('contains a trim-path stroke in the brand success green', () => {
    const layer = successCheck.layers[0] as {
      shapes?: Array<{ it?: Array<Record<string, unknown>> }>;
    };
    const items = layer.shapes?.[0]?.it ?? [];
    const trim = items.find((i) => i.ty === 'tm');
    const stroke = items.find((i) => i.ty === 'st');
    expect(trim).toBeDefined();
    expect(stroke).toBeDefined();
    const color = (stroke as { c?: { k?: number[] } })?.c?.k ?? [];
    // #059669 → [0.02, 0.588, 0.412, 1] (rounded, tolerant compare)
    expect(color[0]).toBeCloseTo(0.02, 1);
    expect(color[1]).toBeCloseTo(0.588, 1);
    expect(color[2]).toBeCloseTo(0.412, 1);
    expect(color[3]).toBe(1);
  });
});
