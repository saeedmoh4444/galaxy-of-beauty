'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const LEVELS: Record<string,{label:string;color:string}> = { beginner: { label: 'مبتدئ', color: 'bg-green-100 text-green-700' }, intermediate: { label: 'متوسط', color: 'bg-amber-100 text-amber-700' }, advanced: { label: 'متقدم', color: 'bg-red-100 text-red-700' } };

export default function BeautyCoursesPage(): JSX.Element {
  const { data: courses, isLoading } = api.beautyCourses.list.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const { data: myCourses } = api.beautyCourses.myCourses.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const enrollMut = api.beautyCourses.enroll.useMutation();
  const [enrolled, setEnrolled] = useState<number[]>((myCourses??[]).map(c=>c.courseId as number));

  const handleEnroll = (courseId: number) => {
    enrollMut.mutate({ courseId }, { onSuccess: () => setEnrolled(prev => [...prev, courseId]) });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">📚 دورات تجميل</h1><p className="mt-1 text-sm text-gray-500">تعلمي مهارات التجميل من الخبيرات</p></div>

        {enrolled.length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">✅ دوراتي ({enrolled.length})</h3><div className="flex flex-wrap gap-2">{(courses??[]).filter(c=>enrolled.includes(c.id as number)).map(c=><span key={c.id as number} className="rounded-full bg-green-100 px-3 py-1 text-sm">{c.emoji as string} {c.titleAr as string}</span>)}</div></Card>}

        {isLoading ? <div className="grid gap-4 sm:grid-cols-2">{Array.from({length:4},(_,i)=><CardSkeleton key={i}/>)}</div> :
          <div className="grid gap-4 sm:grid-cols-2">{(courses??[]).map((c: Record<string,unknown>) => {
            const isEnrolled = enrolled.includes(c.id as number);
            const level = LEVELS[c.level as string] ?? LEVELS['beginner']!;
            return (
              <Card key={c.id as number} padding="lg">
                <div className="flex items-start gap-3">
                  <span className="text-4xl">{c.emoji as string}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{c.titleAr as string}</h3>
                    <p className="text-xs text-gray-500 mt-1">{c.descAr as string}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="text-gray-600">👩‍🏫 {c.instructor as string}</span>
                      <span className="text-gray-600">📖 {c.lessons as number} دروس</span>
                      <span className="text-gray-600">⏱️ {c.duration as string}</span>
                      <span className={`rounded-full px-2 py-0.5 ${level.color}`}>{level.label}</span>
                      <span>⭐{c.rating as number}</span>
                      <span>👥{c.enrolledCount as number}</span>
                    </div>
                    <Button size="sm" onClick={() => handleEnroll(c.id as number)} loading={enrollMut.isPending} disabled={isEnrolled} className="mt-3 w-full">{isEnrolled ? '✅ مسجلة' : '📝 سجلي الآن'}</Button>
                  </div>
                </div>
              </Card>
            );
          })}</div>
        }
      </div>
    </DashboardLayout>
  );
}
