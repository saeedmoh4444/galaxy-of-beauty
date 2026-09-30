'use client';
/**
 * 3.2a — MediaPipe FaceLandmarker loader (lazy, cached, CDN wasm).
 *
 * The detector is loaded only when the live try-on starts; failures
 * clear the cached promise so a retry can re-attempt.
 */
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import type { FaceLandmarks } from '@galaxy/shared/tryOn';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

export function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    })();
    landmarkerPromise.catch(() => {
      landmarkerPromise = null;
    });
  }
  return landmarkerPromise;
}

/** Detect one face and return normalized [0..1] landmarks, or null. */
export function detectLandmarks(
  landmarker: FaceLandmarker,
  video: HTMLVideoElement,
  nowMs: number,
): FaceLandmarks | null {
  const result = landmarker.detectForVideo(video, nowMs);
  const face = result.faceLandmarks?.[0];
  if (!face) return null;
  return face.map((p) => ({ x: p.x, y: p.y }));
}
