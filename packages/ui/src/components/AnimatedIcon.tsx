'use client';

/**
 * Animated icons for confirmation, success, and notification states.
 *
 * Usage:
 *   <SuccessIcon />
 *   <PulseDot />
 *   <Shimmer />
 */

// ── Success Checkmark ──────────────────────────────────────
export function SuccessIcon({
  size = 64,
  label = 'تم بنجاح',
}: {
  size?: number;
  label?: string;
}): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="animate-success"
      aria-label={label}
    >
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeDasharray="188"
        strokeDashoffset="188"
        className="animate-success-circle"
      />
      <path
        d="M18 32l10 10 18-20"
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="50"
        strokeDashoffset="50"
        className="animate-success-check"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .animate-success-circle { animation: drawCircle 0.6s ease-out forwards; }
        .animate-success-check { animation: drawCheck 0.4s 0.4s ease-out forwards; }
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .animate-success-circle, .animate-success-check { animation: none; stroke-dashoffset: 0; }
        }
      `,
        }}
      />
    </svg>
  );
}

// ── Pulse Dot (Notification Indicator) ─────────────────────
export function PulseDot({
  color = '#ef4444',
  size = 10,
}: {
  color?: string;
  size?: number;
}): JSX.Element {
  return (
    <span className="relative flex" style={{ width: size, height: size }}>
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}

// ── Shimmer Loading Line ───────────────────────────────────
export function Shimmer({
  width = '100%',
  height = 16,
}: {
  width?: string;
  height?: number;
}): JSX.Element {
  return (
    <div
      className="animate-shimmer rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
      style={{ width, height, backgroundSize: '200% 100%' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (prefers-reduced-motion: reduce) { .animate-shimmer { animation: none; } }
      `,
        }}
      />
    </div>
  );
}
