'use client';

import { api } from '@/lib/trpc';
import { useState, useCallback, useEffect } from 'react';
import { PageContainer, PageTitle, Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CH: Record<string, { emoji: string; color: string; label: string }> = {
  '7day_skincare': { emoji: '', color: '#ec4899', label: '7 أيام عناية' },
  '5bookings': { emoji: '‍️', color: '#f59e0b', label: '5 حجوزات' },
  first_review: { emoji: '', color: '#3b82f6', label: 'أول تقييم' },
  streak_4weeks: { emoji: '', color: '#8b5cf6', label: '4 أسابيع متواصلة' },
  refer_3friends: { emoji: '‍️', color: '#10b981', label: '3 إحالات' },
};

export default function ChallengesPage(): JSX.Element {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    Promise.all([(api as any).challenges.list.query(), (api as any).challenges.progress.query()])
      .then(([c, p]: any[]) => {
        setChallenges(c ?? []);
        setProgress(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const join = (challengeId: string) => {
    (api as any).challenges.join.mutate({ challengeId }).then(() => fetch());
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title=" التحديات" subtitle="تحديات ممتعة لجمالكِ" />

        <div className="space-y-4">
          {challenges.map((c: any) => {
            const cfg = CH[c.type] ?? { emoji: '', color: '#6b7280', label: c.type };
            const prog = (progress as any)?.[c.type];
            return (
              <Card key={c.id} className="flex items-center gap-4 p-5">
                <span className="text-4xl">{cfg.emoji}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
                    {cfg.label}
                  </h4>
                  {prog && (
                    <p className="mt-1 text-xs text-text-tertiary dark:text-gray-500">
                      {prog.current}/{prog.total} — {Math.round((prog.current / prog.total) * 100)}%
                    </p>
                  )}
                  {prog && (
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round((prog.current / prog.total) * 100)}%`,
                          backgroundColor: cfg.color,
                        }}
                      />
                    </div>
                  )}
                </div>
                <Button onClick={() => join(c.id)} className="shrink-0">
                  انضمي
                </Button>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
