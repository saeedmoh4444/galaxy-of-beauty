/**
 * 3.2a — FaceMesh landmark geometry tests (pure math, lives in the api
 * test runner because @galaxy/shared is tested through it).
 *
 * Synthetic 478-point landmarks: a rough face layout (eyes upper third,
 * lips lower third, cheeks mid-face) lets the tests assert contour
 * shape sanity without a real detector.
 */
import { describe, it, expect } from 'vitest';
import {
  lipOuterPath,
  lipInnerPath,
  leftEyePath,
  rightEyePath,
  cheekCenters,
  boundsOf,
  drawContour,
  mirrorLandmarks,
  LIP_OUTER_INDICES,
  type FaceLandmarks,
} from '@galaxy/shared/tryOn';

function syntheticFace(): FaceLandmarks {
  const lm: FaceLandmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  // Lips: lower third, an ellipse-ish ring around (0.5, 0.72).
  const lip = (i: number, t: number) => {
    const ang = (i / 20) * Math.PI * 2;
    return { x: 0.5 + Math.cos(ang) * (0.14 + t), y: 0.72 + Math.sin(ang) * (0.05 + t) };
  };
  LIP_OUTER_INDICES.forEach((idx, i) => (lm[idx] = lip(i, 0)));
  // Inner lip ring slightly smaller.
  const INNER = [
    78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191,
  ];
  INNER.forEach((idx, i) => (lm[idx] = lip(i, -0.05)));
  // Eyes: two small rings in the upper third.
  const eye = (cx: number, i: number, n: number) => {
    const ang = (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(ang) * 0.08, y: 0.32 + Math.sin(ang) * 0.03 };
  };
  const LE = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
  const RE = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
  LE.forEach((idx, i) => (lm[idx] = eye(0.34, i, LE.length)));
  RE.forEach((idx, i) => (lm[idx] = eye(0.66, i, RE.length)));
  // Cheeks.
  lm[123] = { x: 0.32, y: 0.52 };
  lm[352] = { x: 0.68, y: 0.52 };
  return lm;
}

describe('tryOn landmark geometry', () => {
  const lm = syntheticFace();

  it('returns closed lip contours below the face midline', () => {
    const outer = lipOuterPath(lm);
    const inner = lipInnerPath(lm);
    expect(outer).toHaveLength(20);
    expect(inner).toHaveLength(20);

    const ob = boundsOf(outer);
    const ib = boundsOf(inner);
    // Lips sit in the lower third and are wider than tall.
    expect(ob.minY).toBeGreaterThan(0.5);
    expect(ob.maxX - ob.minX).toBeGreaterThan(ob.maxY - ob.minY);
    // Inner lip sits inside the outer lip.
    expect(ib.minX).toBeGreaterThan(ob.minX);
    expect(ib.maxX).toBeLessThan(ob.maxX);
  });

  it('returns symmetric eye contours in the upper third', () => {
    const le = boundsOf(leftEyePath(lm));
    const re = boundsOf(rightEyePath(lm));
    expect(le.maxY).toBeLessThan(0.45);
    expect(re.maxY).toBeLessThan(0.45);
    const leCenter = (le.minX + le.maxX) / 2;
    const reCenter = (re.minX + re.maxX) / 2;
    // Roughly symmetric around the face midline.
    expect(1 - reCenter).toBeCloseTo(leCenter, 1);
  });

  it('returns cheek centers in the mid-face', () => {
    const { left, right } = cheekCenters(lm);
    expect(left.x).toBeLessThan(0.5);
    expect(right.x).toBeGreaterThan(0.5);
    expect(left.y).toBeGreaterThan(0.4);
    expect(left.y).toBeLessThan(0.7);
  });

  it('mirrors landmarks horizontally', () => {
    const mirrored = mirrorLandmarks(lm);
    expect(mirrored).toHaveLength(478);
    expect(mirrored[123]!.x).toBeCloseTo(1 - lm[123]!.x, 6);
    expect(mirrored[123]!.y).toBeCloseTo(lm[123]!.y, 6);
  });

  it('draws a scaled closed contour', () => {
    const calls: string[] = [];
    const ctx = {
      beginPath: () => calls.push('begin'),
      moveTo: () => calls.push('move'),
      lineTo: () => calls.push('line'),
      closePath: () => calls.push('close'),
      fill: () => calls.push('fill'),
    };
    drawContour(ctx, lipOuterPath(lm), 720, 1280);
    expect(calls[0]).toBe('begin');
    expect(calls[1]).toBe('move');
    expect(calls[calls.length - 2]).toBe('close');
    expect(calls[calls.length - 1]).toBe('fill');
  });

  it('skips contours with too few points', () => {
    const calls: string[] = [];
    const ctx = {
      beginPath: () => calls.push('begin'),
      moveTo: () => calls.push('move'),
      lineTo: () => calls.push('line'),
      closePath: () => calls.push('close'),
      fill: () => calls.push('fill'),
    };
    drawContour(ctx, [], 720, 1280);
    expect(calls).toHaveLength(0);
  });
});
