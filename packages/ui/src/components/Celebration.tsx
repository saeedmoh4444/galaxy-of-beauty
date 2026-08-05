'use client';

import { useEffect, useState } from 'react';

/**
 * Lightweight CSS celebration animation — confetti sparkles.
 * Shows for 3 seconds then auto-dismisses.
 *
 * Usage:
 *   <Celebration />
 */

const EMOJIS = ['✨', '🎉', '💫', '🌟', '💖', '🎊', '💄', '💅'];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function Celebration({ duration = 3000 }: { duration?: number }): JSX.Element | null {
  const [visible, setVisible] = useState(true);
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length]!,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 2,
      size: 16 + Math.random() * 24,
    })),
  );

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}
