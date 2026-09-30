/**
 * 3.2 AR Try-On — FaceMesh landmark geometry (pure, framework-free).
 *
 * Maps MediaPipe FaceLandmarker 478-point output to canvas contours for
 * makeup overlays. Coordinates are normalized [0..1] relative to the
 * detection frame; callers scale by canvas size.
 */

export type Point = { x: number; y: number };
export type FaceLandmarks = Point[];

/** Outer lip contour (20 points, FaceMesh canonical order). */
export const LIP_OUTER_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185,
];

/** Inner lip contour (20 points). */
export const LIP_INNER_INDICES = [
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191,
];

/** Left eye (subject's left — appears on the right in mirrored selfie). */
export const LEFT_EYE_INDICES = [
  33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7,
];

/** Right eye (subject's right). */
export const RIGHT_EYE_INDICES = [
  263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249,
];

/** Cheek landmarks used for blush centers (left, right). */
export const CHEEK_INDICES = { left: 123, right: 352 };

export function pickIndices(lm: FaceLandmarks, indices: number[]): Point[] {
  return indices.map((i) => lm[i]).filter((p): p is Point => Boolean(p));
}

export function lipOuterPath(lm: FaceLandmarks): Point[] {
  return pickIndices(lm, LIP_OUTER_INDICES);
}

export function lipInnerPath(lm: FaceLandmarks): Point[] {
  return pickIndices(lm, LIP_INNER_INDICES);
}

export function leftEyePath(lm: FaceLandmarks): Point[] {
  return pickIndices(lm, LEFT_EYE_INDICES);
}

export function rightEyePath(lm: FaceLandmarks): Point[] {
  return pickIndices(lm, RIGHT_EYE_INDICES);
}

export function cheekCenters(lm: FaceLandmarks): { left: Point; right: Point } {
  const left = lm[CHEEK_INDICES.left];
  const right = lm[CHEEK_INDICES.right];
  return {
    left: left ?? { x: 0.3, y: 0.55 },
    right: right ?? { x: 0.7, y: 0.55 },
  };
}

/** Bounding box of a contour — used for fallbacks and hit-testing. */
export function boundsOf(points: Point[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

/** Draw a landmark contour scaled to a canvas, as a closed filled path. */
export function drawContour(
  ctx: {
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    closePath(): void;
    fill(): void;
  },
  points: Point[],
  width: number,
  height: number,
): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0]!.x * width, points[0]!.y * height);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i]!.x * width, points[i]!.y * height);
  }
  ctx.closePath();
  ctx.fill();
}

/** Mirror normalized landmarks horizontally (selfie preview flip). */
export function mirrorLandmarks(lm: FaceLandmarks): FaceLandmarks {
  return lm.map((p) => ({ x: 1 - p.x, y: p.y }));
}
