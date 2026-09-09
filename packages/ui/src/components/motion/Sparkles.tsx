/**
 * Sparkles — twinkling four-point stars for hero sections.
 * Decorative only (aria-hidden). Positions are logical (start/end)
 * so they mirror correctly in RTL.
 */

export interface SparkleSpec {
  /** inset-block-start position, e.g. '12%' */
  top: string;
  /** inset-inline-start position, e.g. '8%' */
  start: string;
  size?: number;
  /** negative animation-delay for desync */
  delay?: number;
  color?: string;
}

interface SparklesProps {
  sparkles?: SparkleSpec[];
}

const DEFAULT_SPARKLES: SparkleSpec[] = [
  { top: '14%', start: '10%', size: 18, delay: -0.5 },
  { top: '22%', start: '88%', size: 14, delay: -2.1 },
  { top: '68%', start: '6%', size: 12, delay: -1.2 },
  { top: '74%', start: '92%', size: 20, delay: -3.0 },
  { top: '38%', start: '94%', size: 10, delay: -0.9 },
];

export function Sparkles({ sparkles = DEFAULT_SPARKLES }: SparklesProps): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {sparkles.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={s.size ?? 14}
          height={s.size ?? 14}
          className="animate-twinkle absolute"
          style={{
            top: s.top,
            insetInlineStart: s.start,
            animationDelay: s.delay ? `${s.delay}s` : undefined,
          }}
        >
          <path
            d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z"
            fill={s.color ?? 'currentColor'}
          />
        </svg>
      ))}
    </div>
  );
}
