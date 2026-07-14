/**
 * Skeleton loader that matches the shape of a service/booking card.
 * Use instead of generic spinners for better perceived performance.
 */
export function ServiceSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-40 bg-gray-200 rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
    </div>
  );
}

export function BookingSkeleton() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (<ServiceSkeleton key={i} />))}
    </div>
  );
}
