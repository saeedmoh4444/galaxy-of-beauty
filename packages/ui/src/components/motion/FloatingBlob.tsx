/**
 * FloatingBlob — soft organic gradient blob for hero backgrounds.
 * Decorative only (aria-hidden), transform-only animation (RTL-safe).
 */

interface FloatingBlobProps {
  className?: string;
  /** Tailwind gradient stops, e.g. 'from-brand-200 to-accent-200' */
  gradient?: string;
  /** Motion class: 'blob' (drift) | 'float' | 'float-slow' */
  animation?: 'blob' | 'float' | 'float-slow';
  /** Negative animation-delay so blobs are never in sync */
  delay?: number;
  /** Soft blur for the glassy K-beauty look */
  blur?: boolean;
  /** Opacity override (0-100) */
  opacity?: number;
}

export function FloatingBlob({
  className = '',
  gradient = 'from-brand-200 to-accent-200',
  animation = 'blob',
  delay = 0,
  blur = true,
  opacity = 60,
}: FloatingBlobProps): JSX.Element {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full bg-gradient-to-br ${gradient} ${blur ? 'blur-2xl' : ''} animate-${animation} ${className}`}
      style={{ opacity: opacity / 100, animationDelay: delay ? `${delay}s` : undefined }}
    />
  );
}
