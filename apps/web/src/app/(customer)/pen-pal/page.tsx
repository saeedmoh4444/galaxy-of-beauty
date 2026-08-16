'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PenPalPage(): JSX.Element {
  const { data: interests } = api.penPal.interests.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const {
    data: matches,
    isLoading,
    isError,
    refetch,
  } = api.penPal.match.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const registerMut = api.penPal.register.useMutation({ onSuccess: () => refetch() });

  const [selected, setSelected] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    if (selected.length < 2) return;
    registerMut.mutate({ interests: selected, bio: bio || undefined });
    setRegistered(true);
  };

  const allInterests = (interests ?? []) as Array<Record<string, unknown>>;
  const pals = (matches ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> Beauty Pen Pal</h1>
          <p className="mt-1 text-sm text-text-secondary">
            تواصلي مع عضوات يشاركنكِ نفس اهتمامات الجمال
          </p>
        </div>

        {!registered ? (
          <Card padding="lg">
            <h3 className="font-bold mb-4"> اختاري اهتماماتكِ (٢ على الأقل)</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {allInterests.map((i: Record<string, unknown>) => (
                <button
                  key={i.key as string}
                  onClick={() =>
                    setSelected((p) =>
                      p.includes(i.key as string)
                        ? p.filter((x) => x !== i.key)
                        : [...p, i.key as string],
                    )
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${selected.includes(i.key as string) ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800 hover:bg-gray-200'}`}
                >
                  {i.emoji as string} {i.nameAr as string}
                </button>
              ))}
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="نبذة عنكِ (اختياري)..."
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mb-3"
              rows={2}
            />
            <Button
              onClick={handleRegister}
              disabled={selected.length < 2}
              loading={registerMut.isPending}
              className="w-full"
            >
              ابحثي عن صديقات
            </Button>
          </Card>
        ) : isLoading ? (
          <GridSkeleton count={6} />
        ) : isError ? (
          <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
        ) : pals.length === 0 ? (
          <EmptyState title="لا توجد تطابقات بعد" description="لم تسجل عضوات أخريات بعد" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pals.map((p: Record<string, unknown>) => (
              <Card key={p.userId as number} padding="lg" className="text-center">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-white text-xl font-bold">
                  {(p.userName as string)?.[0] ?? ''}
                </div>
                <div className="mt-2 flex justify-center">
                  <span className="rounded-full bg-green-100 dark:bg-green-900 px-3 py-0.5 text-xs font-bold text-green-700">
                    {p.score as number} اهتمامات مشتركة
                  </span>
                </div>
                {(p.bio as string) ? (
                  <p className="text-xs text-text-secondary mt-2">{p.bio as string}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {(p.interests as string[])?.map((i: string) => (
                    <span key={i} className="text-lg">
                      {(allInterests.find((x) => x.key === i)?.emoji as string) ?? ''}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
