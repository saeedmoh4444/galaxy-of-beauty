import Image from 'next/image';

/**
 * Branded route-level loading splash: logo + bouncing dots + loading text.
 *
 * Replaces the five hand-copied loading.tsx variants with one consistent
 * component. Announces loading state to screen readers via role="status"
 * and respects prefers-reduced-motion via the global CSS gate.
 */
interface LogoLoaderProps {
  /** Logo display size in px */
  size?: 'sm' | 'md' | 'lg';
  /** Text announced and shown below the dots */
  label?: string;
  /** Fill the viewport height (route-level splash screens) */
  fullHeight?: boolean;
  className?: string;
}

const SIZES = { sm: 56, md: 64, lg: 80 } as const;

export function LogoLoader({
  size = 'md',
  label = 'جاري التحميل...',
  fullHeight = false,
  className = '',
}: LogoLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`flex flex-col items-center justify-center ${
        fullHeight ? 'min-h-screen bg-white dark:bg-gray-950' : 'py-24'
      } ${className}`}
    >
      <div className="animate-pulse">
        <Image
          src="/logo.png"
          alt=""
          width={SIZES[size]}
          height={SIZES[size]}
          className="rounded-2xl object-cover shadow-lg"
        />
      </div>
      <div className="mt-6 flex items-center gap-1">
        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-600 [animation-delay:0ms]" />
        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-500 [animation-delay:150ms]" />
        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-400 [animation-delay:300ms]" />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-400">{label}</p>
    </div>
  );
}
