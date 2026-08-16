'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton } from '@galaxy/ui';
export default function ApiDocsPage(): JSX.Element {
  const { data, isLoading } = api.apiDocs.reference.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: openapi } = api.apiDocs.openapi.useQuery() as {
    data: Record<string, unknown> | undefined;
  };
  const categories = (data?.categories ?? []) as Array<Record<string, unknown>>;

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(openapi, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi.json';
    a.click();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold">API Documentation</h1>
        <p className="mt-2 text-text-secondary">{data?.description as string}</p>
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : (
        <>
          <Card padding="lg" className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  {data?.title as string} v{data?.version as string}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {data?.endpoints as number} routers · {data?.procedures as string} procedures
                </p>
              </div>
              <button
                onClick={downloadJSON}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white"
              >
                OpenAPI JSON
              </button>
            </div>
            <div className="mt-4 rounded-xl bg-surface-muted dark:bg-gray-800 p-4">
              <p className="text-xs font-bold text-text-secondary mb-2"> Authentication</p>
              <code className="text-xs break-all">
                {(data?.authentication as Record<string, string>)?.header}
              </code>
              <p className="text-xs text-text-tertiary mt-1">
                {(data?.authentication as Record<string, string>)?.csrf}
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            {categories.map((cat: Record<string, unknown>) => (
              <Card key={cat.name as string} padding="lg">
                <h3 className="font-bold text-lg mb-1">
                  {cat.emoji as string} {cat.name as string}
                </h3>
                <p className="text-xs text-text-secondary mb-3">{cat.description as string}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(cat.routers as string[]).map((r: string) => (
                    <span
                      key={r}
                      className="rounded-full bg-surface-muted dark:bg-gray-800 px-2.5 py-1 text-xs font-mono"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
