'use client';

import { useEffect } from 'react';

/**
 * Reports Core Web Vitals to the monitoring dashboard.
 * Uses the web-vitals library (lightweight ~1KB).
 *
 * Add to layout:
 *   <WebVitals />
 */

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

const THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000], // < 2.5s good, < 4s needs-improvement
  CLS: [0.1, 0.25], // < 0.1 good, < 0.25 needs-improvement
  INP: [200, 500], // < 200ms good, < 500ms needs-improvement
  FCP: [1800, 3000], // < 1.8s good, < 3s needs-improvement
  TTFB: [800, 1800], // < 800ms good, < 1.8s needs-improvement
};

function getRating(name: string, value: number): VitalMetric['rating'] {
  const [good, poor] = THRESHOLDS[name] ?? [Infinity, Infinity];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

// In-memory store (cleared on page navigation in dev)
const vitalsBuffer: VitalMetric[] = [];

export function getLatestVitals(): VitalMetric[] {
  return [...vitalsBuffer];
}

export function WebVitals(): null {
  useEffect(() => {
    // Dynamic import to avoid bundling — skip gracefully if not installed
    // @ts-expect-error — web-vitals is an optional dependency
    import('web-vitals')
      .then(({ onLCP, onCLS, onINP, onFCP, onTTFB }: any) => {
        const report = (metric: { name: string; value: number; delta: number }) => {
          const entry: VitalMetric = {
            name: metric.name,
            value: Math.round(metric.value * 100) / 100,
            rating: getRating(metric.name, metric.value),
            delta: Math.round(metric.delta * 100) / 100,
          };

          // Keep last 20 entries
          vitalsBuffer.push(entry);
          if (vitalsBuffer.length > 20) vitalsBuffer.shift();

          // Log in development
          if (process.env.NODE_ENV === 'development') {
            const emoji =
              entry.rating === 'good' ? '' : entry.rating === 'needs-improvement' ? '' : '';
            console.log(`[WebVitals] ${emoji} ${entry.name}: ${entry.value}`);
          }
        };

        onLCP(report);
        onCLS(report);
        onINP(report);
        onFCP(report);
        onTTFB(report);
      })
      .catch(() => {
        // web-vitals not installed — skip silently
      });
  }, []);

  return null;
}
