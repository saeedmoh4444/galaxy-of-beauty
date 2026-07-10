import { CardSkeleton } from '@galaxy/shared';

export default function RootLoading(): JSX.Element {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
