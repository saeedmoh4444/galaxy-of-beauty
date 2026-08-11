'use client';

/**
 * Hero Banner — landing page hero section with title, subtitle, CTA, and stats.
 *
 * Usage:
 *   <HeroBanner title="جالكسي بيوتي" subtitle="منصتكِ الأولى لحجز خدمات التجميل" cta="احجزي الآن" onCta={() => ...} />
 */

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  cta?: string;
  onCta?: () => void;
  className?: string;
}

export function HeroBanner({
  title,
  subtitle,
  cta,
  onCta,
  className = '',
}: HeroBannerProps): JSX.Element {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 px-8 py-16 text-center text-white md:py-24 ${className}`}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />

      <h1 className="relative text-3xl font-extrabold md:text-5xl">{title}</h1>
      {subtitle ? (
        <p className="relative mt-4 text-lg text-brand-100 md:text-xl">{subtitle}</p>
      ) : null}
      {cta && onCta ? (
        <button
          onClick={onCta}
          className="relative mt-8 rounded-xl bg-white px-8 py-3.5 text-lg font-bold text-brand-700 transition-all hover:bg-brand-50 hover:scale-105 active:scale-95"
        >
          {cta}
        </button>
      ) : null}
    </div>
  );
}
