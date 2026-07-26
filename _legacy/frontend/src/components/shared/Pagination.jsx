export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 text-sm rounded border disabled:opacity-30"
      >
        ‹
      </button>
      <span className="text-sm text-gray-500">{page} / {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 text-sm rounded border disabled:opacity-30"
      >
        ›
      </button>
    </div>
  );
}
