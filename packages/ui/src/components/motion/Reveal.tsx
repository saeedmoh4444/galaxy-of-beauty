'use client';

/**
 * Reveal — scroll-triggered fade-up wrapper (IntersectionObserver).
 * Content fades/rises once when it enters the viewport; becomes inert
 * afterwards. No new dependencies; transform/opacity only (RTL-safe).
 * prefers-reduced-motion users see content instantly (CSS handles it).
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms (for lists of reveals) */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: RevealProps): JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
