/**
 * Marquee — infinite soft scrolling strip of pill chips.
 * The inner track is forced dir="ltr" so the motion direction is
 * identical in AR and EN (bidi keeps the text itself correct).
 */

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  className?: string;
}

export function Marquee({ items, reverse = false, className = '' }: MarqueeProps): JSX.Element {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div
        dir="ltr"
        className={`flex w-max items-center gap-8 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
      >
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-8">
            {doubled.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
                <span className="text-sm font-semibold text-text-secondary">{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
