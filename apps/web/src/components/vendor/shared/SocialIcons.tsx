import type { JSX } from 'react';

/**
 * B6 — social presence icons (web). Letter badges in each network's
 * brand color; only networks with a URL render (zero-link hygiene).
 * The mobile app has its own mirror in the store detail screen.
 */
const NETWORKS = [
  { key: 'snapchat', letter: 'S', classes: 'bg-[#FFFC00] text-black' },
  { key: 'tiktok', letter: 'T', classes: 'bg-black text-white dark:bg-white dark:text-black' },
  { key: 'x', letter: 'X', classes: 'bg-black text-white dark:bg-white dark:text-black' },
  { key: 'instagram', letter: 'I', classes: 'bg-[#E4405F] text-white' },
  { key: 'facebook', letter: 'F', classes: 'bg-[#1877F2] text-white' },
] as const;

export function SocialIcons({
  links,
  className = '',
}: {
  links: Record<string, string> | null | undefined;
  className?: string;
}): JSX.Element | null {
  const rows = NETWORKS.filter((n) => (links?.[n.key] ?? '') !== '');
  if (rows.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {rows.map((n) => (
        <a
          key={n.key}
          href={links![n.key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={n.key}
          data-testid={`social-icon-${n.key}`}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${n.classes}`}
        >
          {n.letter}
        </a>
      ))}
    </div>
  );
}
