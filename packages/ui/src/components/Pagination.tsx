'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  navLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
  pageLabel?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  navLabel = 'التنقل بين الصفحات',
  prevLabel = 'الصفحة السابقة',
  nextLabel = 'الصفحة التالية',
  pageLabel = 'صفحة',
}: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav aria-label={navLabel} className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-30 dark:text-text-tertiary dark:hover:bg-gray-800"
        aria-label={prevLabel}
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-text-tertiary">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-brand-600 text-white'
                : 'text-text-secondary hover:bg-surface-muted dark:text-text-tertiary dark:hover:bg-gray-800'
            }`}
            aria-label={`${pageLabel} ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-30 dark:text-text-tertiary dark:hover:bg-gray-800"
        aria-label={nextLabel}
      >
        ›
      </button>
    </nav>
  );
}
