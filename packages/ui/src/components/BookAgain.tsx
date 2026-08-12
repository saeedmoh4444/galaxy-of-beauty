'use client';

/**
 * "Book Again" one-click button for re-booking a previous service.
 *
 * Usage:
 *   <BookAgain serviceId={123} technicianId={456} onBook={() => router.push('/bookings/create?service=123&tech=456')} />
 */

interface BookAgainProps {
  serviceName?: string;
  technicianName?: string;
  onBook: () => void;
  className?: string;
}

export function BookAgain({
  serviceName,
  technicianName,
  onBook,
  className = '',
}: BookAgainProps): JSX.Element {
  return (
    <button
      onClick={onBook}
      className={`inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:scale-105 active:scale-95 ${className}`}
    >
      <span></span>
      {serviceName ? <span>احجزي {serviceName} مرة أخرى</span> : <span>احجزي مرة أخرى</span>}
      {technicianName ? <span className="text-xs text-brand-200">مع {technicianName}</span> : null}
    </button>
  );
}
