'use client';

/**
 * Floating Action Button — "Book Now" CTA fixed at bottom-right.
 * Mobile-optimized with pulse animation and haptic-ready callback.
 */

interface FloatingActionButtonProps {
  label: string;
  onClick: () => void;
  icon?: string;
  className?: string;
}

export function FloatingActionButton({ label, onClick, icon = '✨', className = '' }: FloatingActionButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-700 hover:scale-105 hover:shadow-xl active:scale-95 md:bottom-8 md:right-8 md:px-6 md:py-4 ${className}`}
      aria-label={label}
    >
      <span className="animate-pulse">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
