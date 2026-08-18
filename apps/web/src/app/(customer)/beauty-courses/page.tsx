'use client';

import { api } from '@/lib/trpc';
import { useState } from 'react';
import {
  PageContainer,
  PageTitle,
  BeautyWebinarCard,
  BeautyExpertTalkCard,
  BeautyLearningPathCard,
  BeautyCertificationPathCard,
  BeautyCareerPathCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';
import type { TranslationKey } from '@galaxy/shared';

const LEVELS: Record<string, { label: TranslationKey; color: string }> = {
  beginner: { label: 'beautyCourses.level.beginner', color: '#10b981' },
  intermediate: { label: 'beautyCourses.level.intermediate', color: '#f59e0b' },
  advanced: { label: 'beautyCourses.level.advanced', color: '#ef4444' },
};

export default function BeautyCoursesPage(): JSX.Element {
  const { t, locale } = useLocale();
  const courses = api.beautyCourses.list.useQuery();
  const myCourses = api.beautyCourses.myCourses.useQuery();
  const [enrolled, setEnrolled] = useState<number[]>([]);
  const enrollMut = api.beautyCourses.enroll.useMutation();

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollMut.mutateAsync({ courseId });
      setEnrolled((prev) => [...prev, courseId]);
    } catch {
      /* noop */
    }
  };

  const items = courses?.data ?? [];
  const myItems = myCourses?.data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyCourses.title')} subtitle={t('beautyCourses.subtitle')} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {myItems.length > 0 && (
              <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950">
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {t('beautyCourses.myCourses', { count: myItems.length })}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {myItems.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-emerald-200 px-3 py-1 text-xs text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                    >
                      {localize(
                        (c.course as Record<string, unknown> | undefined)?.titleJson,
                        locale,
                      ) || t('beautyCourses.courseFallback', { id: c.courseId })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {items.map((c) => {
                const isEnrolled =
                  enrolled.includes(c.id) || myItems.some((m) => m.courseId === c.id);
                const level = LEVELS[c.level] ?? LEVELS['beginner']!;
                return (
                  <div
                    key={c.id}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <span className="text-5xl shrink-0">{c.emoji}</span>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-text-primary dark:text-gray-100">
                        {c.titleAr}
                      </h4>
                      <p className="mt-1 text-xs text-text-secondary dark:text-gray-400">
                        {c.descAr}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-tertiary dark:text-gray-500">
                        <span>‍ {c.instructor}</span>
                        <span> {t('beautyCourses.lessons', { count: c.lessons })}</span>
                        <span> {c.rating}</span>
                        <span
                          className="rounded-lg px-2 py-0.5 text-[11px] font-semibold"
                          style={{ backgroundColor: level.color + '20', color: level.color }}
                        >
                          {t(level.label)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEnroll(c.id)}
                        disabled={isEnrolled}
                        className={`mt-3 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${isEnrolled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
                      >
                        {isEnrolled ? t('beautyCourses.enrolled') : t('beautyCourses.enrollNow')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <BeautyWebinarCard
              webinar={{
                title: t('beautyCourses.webinar.title'),
                instructor: 'د. نورة',
                date: t('beautyCourses.webinar.date'),
                time: t('beautyCourses.webinar.time'),
                isFree: true,
                topic: t('beautyCourses.webinar.topic'),
              }}
            />
            <BeautyExpertTalkCard
              talk={{
                title: t('beautyCourses.talk.title'),
                expert: 'م. سارة',
                date: t('beautyCourses.talk.date'),
                isFree: true,
                emoji: '',
              }}
            />
            <BeautyLearningPathCard
              path={{
                title: t('beautyCourses.path.title'),
                modules: 8,
                completed: 0,
                emoji: '',
                duration: t('beautyCourses.path.duration'),
              }}
            />
            <BeautyCertificationPathCard path="skincare" />
            <BeautyCareerPathCard path="makeup_artist" />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
