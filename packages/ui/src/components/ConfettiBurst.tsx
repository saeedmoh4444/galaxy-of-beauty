'use client';

import { useEffect, useRef } from 'react';
import type { JSX } from 'react';

/**
 * 5.1 — success celebration. Dependency-free canvas confetti that bursts
 * once on mount and self-clears (canvas node removed after the particles
 * settle). Brand palette: Rose Blush + gold + green accents.
 */
const COLORS = ['#c2255c', '#d98e4a', '#fbbf24', '#34d399', '#a78bfa', '#f472b6'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  life: number;
}

const PARTICLE_COUNT = 140;
const GRAVITY = 0.12;
const LIFETIME_FRAMES = 180;

export function ConfettiBurst({ className = '' }: { className?: string }): JSX.Element {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: width / 2,
      y: height * 0.45,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 11 - 3,
      size: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      life: LIFETIME_FRAMES,
    }));

    let raf = 0;
    let frame = 0;
    const tick = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (p.life <= 0) continue;
        p.life -= 1;
        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (frame < LIFETIME_FRAMES) {
        raf = requestAnimationFrame(tick);
      } else {
        // Self-clean: the burst is a one-shot celebration.
        canvas.remove();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      width={640}
      height={360}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-50 h-full w-full ${className}`}
    />
  );
}
