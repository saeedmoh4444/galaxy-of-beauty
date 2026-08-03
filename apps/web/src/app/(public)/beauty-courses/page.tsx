'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';
import Link from 'next/link';

export default function BeautyCoursesPage(): JSX.Element {
  const { user } = useAuth();
  const { data: courses, isLoading, isError, refetch } = api.beautyCourses.list.useQuery() as {
    data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void;
  };
  const enrollMut = api.beautyCourses.enroll.useMutation();

  const items = courses ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-6xl">🎓</span>
        <h1 className="mt-4 text-3xl font-bold">دورات التجميل</h1>
        <p className="mt-2 text-text-secondary">تعلمي من خبراء معتمدين — دورات متكاملة مع شهادات إتمام</p>
      </div>

      {isLoading ? <div className="grid gap-6 sm:grid-cols-2">{Array.from({length:4},(_,i)=><CardSkeleton key={i}/>)}</div>
      : isError ? <ErrorAlert message="فشل التحميل" onRetry={()=>refetch()} />
      : items.length === 0 ? <EmptyState title="لا توجد دورات" />
      : <div className="grid gap-6 sm:grid-cols-2">
          {items.map((c: Record<string,unknown>) => (
            <Card key={c.id as number} padding="lg" className="hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <span className="text-5xl">{c.emoji as string}</span>
                <div className="flex-1">
                  <span className="rounded-full bg-surface-muted dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium">{(c.level as string) === 'beginner' ? 'مبتدئ' : (c.level as string) === 'intermediate' ? 'متوسط' : 'متقدم'}</span>
                  <h3 className="text-lg font-bold mt-1">{c.titleAr as string}</h3>
                  <p className="text-xs text-text-secondary mt-1">{c.descAr as string}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
                    <span>👩‍🏫 {c.instructor as string}</span>
                    <span>📚 {c.lessons as number} دروس</span>
                    <span>⏱️ {c.duration as string}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span>⭐ {c.rating as number}</span>
                    <span>👥 {(c.enrolledCount as number).toLocaleString()} مشترك</span>
                  </div>
                  <div className="mt-4">
                    {user ? (
                      <Button size="sm" onClick={() => enrollMut.mutate({ courseId: c.id as number })} loading={enrollMut.isPending}>🎓 سجّلي الآن</Button>
                    ) : (
                      <Link href="/login"><Button size="sm">تسجيل الدخول</Button></Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}
