/**
 * 5.1 — brand mascot moods. Dependency-free inline SVGs of the "Beauty
 * Galaxy" mascot (a smiling star) in four moods, used by EmptyState /
 * ErrorAlert to give states personality instead of raw emoji.
 */
import type { JSX } from 'react';

export type MascotMood = 'happy' | 'sparkle' | 'sad' | 'oops';

const PALETTE: Record<MascotMood, { main: string; cheek: string; eye: string }> = {
  happy: { main: '#c2255c', cheek: '#f9a8d4', eye: '#4c1d33' },
  sparkle: { main: '#d98e4a', cheek: '#fde68a', eye: '#7c2d12' },
  sad: { main: '#a78bfa', cheek: '#ddd6fe', eye: '#312e81' },
  oops: { main: '#f472b6', cheek: '#fbcfe8', eye: '#831843' },
};

/** Star-body mascot: circle face + rays + mood mouth/eyes. */
function StarMascot({ mood }: { mood: MascotMood }): JSX.Element {
  const p = PALETTE[mood];
  const mouth =
    mood === 'sad'
      ? 'M 34 62 Q 40 56 46 62'
      : mood === 'oops'
        ? 'M 36 60 Q 40 58 44 60'
        : 'M 34 58 Q 40 66 46 58';
  const eyes = mood === 'oops' ? 'x' : mood === 'sad' ? '_' : 'o';
  return (
    <svg viewBox="0 0 80 80" role="img" aria-label={`mascot-${mood}`} fill="none">
      {/* rays */}
      {[0, 45, 90, 135].map((deg) => (
        <path
          key={deg}
          d="M 40 8 L 43 20 L 40 24"
          stroke={p.main}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
      {/* face */}
      <circle cx="40" cy="40" r="20" fill={p.main} />
      <circle cx="33" cy="36" r="4.5" fill={p.cheek} opacity="0.9" />
      <circle cx="47" cy="36" r="4.5" fill={p.cheek} opacity="0.9" />
      {/* eyes */}
      {eyes === 'x' ? (
        <>
          <path
            d="M 30 38 l 7 7 M 37 38 l -7 7"
            stroke={p.eye}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 43 38 l 7 7 M 50 38 l -7 7"
            stroke={p.eye}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M 29.5 37 Q 33 33.5 36.5 37"
            stroke={p.eye}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 43.5 37 Q 47 33.5 50.5 37"
            stroke={p.eye}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {/* mouth */}
      <path d={mouth} stroke={p.eye} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {mood === 'sparkle' && (
        <path d="M 58 22 l 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill={p.main} />
      )}
    </svg>
  );
}

export function Mascot({
  mood = 'happy',
  size = 64,
  className = '',
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <StarMascot mood={mood} />
    </span>
  );
}
