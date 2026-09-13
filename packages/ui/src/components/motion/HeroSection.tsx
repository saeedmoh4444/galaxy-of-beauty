/**
 * HeroSection — K-beauty flat-design hero shell for landing pages.
 *
 * Soft gradient wash + floating blobs + twinkling sparkles + optional
 * media slot. Layout uses logical properties (grid + logical alignment)
 * so AR mirrors perfectly. Content slots stay dumb — callers pass
 * translated strings and their own CTA/trust nodes.
 */

import { FloatingBlob } from './FloatingBlob';
import { Marquee } from './Marquee';
import { Sparkles, type SparkleSpec } from './Sparkles';
import type { ReactNode } from 'react';

interface HeroBlobSpec {
  gradient: string;
  className: string;
  animation?: 'blob' | 'float' | 'float-slow';
  delay?: number;
  opacity?: number;
}

interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  trust?: ReactNode;
  media?: ReactNode;
  /** Tailwind gradient wash classes for the section background */
  gradient?: string;
  blobs?: HeroBlobSpec[];
  sparkles?: SparkleSpec[];
  marqueeItems?: string[];
  className?: string;
  align?: 'start' | 'center';
}

const DEFAULT_BLOBS: HeroBlobSpec[] = [
  {
    gradient: 'from-brand-200 to-accent-100',
    className: '-top-24 -start-24 h-72 w-72',
    animation: 'blob',
    delay: 0,
    opacity: 70,
  },
  {
    gradient: 'from-accent-200 to-brand-100',
    className: 'top-1/3 -end-20 h-80 w-80',
    animation: 'float-slow',
    delay: -4,
    opacity: 60,
  },
  {
    gradient: 'from-brand-300 to-brand-100',
    className: 'bottom-0 start-1/4 h-56 w-56',
    animation: 'float',
    delay: -2,
    opacity: 40,
  },
];

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  actions,
  trust,
  media,
  gradient = 'from-brand-50 via-surface to-accent-50',
  blobs = DEFAULT_BLOBS,
  sparkles,
  marqueeItems,
  className = '',
  align = 'start',
}: HeroSectionProps): JSX.Element {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-b ${gradient} ${className}`}>
      {/* decorative layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {blobs.map((b, i) => (
          <FloatingBlob key={i} {...b} />
        ))}
        <Sparkles sparkles={sparkles} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div
          className={`grid items-center gap-10 md:grid-cols-2 ${
            align === 'center' ? 'md:grid-cols-1 md:text-center' : ''
          }`}
        >
          <div>
            {eyebrow ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-100/80 px-4 py-1.5 text-sm font-bold text-brand-700 ring-1 ring-brand-200">
                {eyebrow}
              </span>
            ) : null}
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-text-primary md:text-5xl lg:text-6xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-5 max-w-xl text-lg text-text-secondary md:text-xl">{subtitle}</p>
            ) : null}
            {actions ? (
              <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>
            ) : null}
            {trust ? <div className="mt-8">{trust}</div> : null}
          </div>
          {media ? <div className="relative">{media}</div> : null}
        </div>

        {marqueeItems && marqueeItems.length > 0 ? (
          <div className="mt-14">
            <Marquee items={marqueeItems} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
