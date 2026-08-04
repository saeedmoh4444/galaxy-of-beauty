'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState } from '@galaxy/ui';
import Link from 'next/link';

interface Badge {
  id: number;
  key: string;
  nameJson: Record<string, string>;
  iconUrl: string | null;
  descriptionJson?: Record<string, string>;
}

const BADGE_META: Record<string, { emoji: string; gradient: string; descAr: string }> = {
  top_rated: { emoji: '⭐', gradient: 'from-amber-400 to-yellow-500', descAr: 'حصلت على أعلى التقييمات من العميلات' },
  most_booked: { emoji: '🔥', gradient: 'from-red-400 to-orange-500', descAr: 'الأكثر حجوزات في منصتنا' },
  quick_response: { emoji: '⚡', gradient: 'from-cyan-400 to-blue-500', descAr: 'استجابة سريعة وتأكيد فوري للحجوزات' },
  premium: { emoji: '💎', gradient: 'from-purple-400 to-indigo-500', descAr: 'فنية متميزة معتمدة من جالكسي بيوتي' },
  certified: { emoji: '🏅', gradient: 'from-green-400 to-emerald-500', descAr: 'حاصلة على شهادات معتمدة في مجال التجميل' },
  newcomer: { emoji: '🌱', gradient: 'from-lime-400 to-green-500', descAr: 'انضمت حديثاً وأثبتت جدارتها' },
  loyal: { emoji: '👑', gradient: 'from-pink-400 to-rose-500', descAr: 'معنا منذ أكثر من سنتين من الخدمة المتميزة' },
  mentor: { emoji: '🎓', gradient: 'from-teal-400 to-cyan-500', descAr: 'مدربة وخبيرة تدرب فنيات أخريات' } };

function getBadgeMeta(key: string) {
  return BADGE_META[key] ?? { emoji: '🏷️', gradient: 'from-gray-400 to-gray-500', descAr: 'شارة تميز' };
}

export default function TechnicianBadgesPage(): JSX.Element {
  const { data: badges, isLoading, isError, refetch } = api.technicianBadges.list.useQuery() as {
    data: Badge[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const allBadges = badges ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-6xl">🏅</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">شارات الفنيات</h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          تعرفي على شارات التميز التي تحصل عليها فنياتنا — دليل على الاحترافية والجودة
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorAlert message="فشل تحميل الشارات" onRetry={() => refetch()} />
      ) : allBadges.length === 0 ? (
        <EmptyState title="لا توجد شارات بعد" description="لم تُضف أي شارات للفنيات حتى الآن" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {allBadges.map((badge) => {
            const meta = getBadgeMeta(badge.key);
            const name = badge.nameJson?.ar ?? badge.nameJson?.en ?? badge.key;
            const desc = badge.descriptionJson?.ar ?? badge.descriptionJson?.en ?? meta.descAr;

            return (
              <Card key={badge.id} padding="lg" className="group text-center transition-all hover:shadow-xl hover:-translate-y-1">
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-4xl shadow-lg transition-transform group-hover:scale-110`}>
                  {badge.iconUrl ? (
                    <img src={badge.iconUrl} alt={name} className="h-12 w-12 object-contain" />
                  ) : (
                    meta.emoji
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary dark:text-gray-100">{name}</h3>
                <p className="mt-1 text-xs text-text-secondary dark:text-gray-400 leading-relaxed">{desc}</p>
                <div className={`mt-3 inline-block rounded-full bg-gradient-to-r ${meta.gradient} px-3 py-0.5 text-[10px] font-bold text-white`}>
                  {badge.key.replace(/_/g, ' ').toUpperCase()}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 p-6 text-center text-white">
        <p className="text-2xl font-bold">🏅 ابحثي عن فنيات معتمدات</p>
        <p className="mt-1 text-white/80">الفنيات الحاصلات على شارات التميز يقدمن أعلى مستويات الجودة</p>
        <Link href="/technicians" className="mt-4 inline-block">
          <span className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2 text-sm font-bold backdrop-blur hover:bg-white/30 transition-colors">
            تصفحي الفنيات ←
          </span>
        </Link>
      </div>
    </div>
  );
}
