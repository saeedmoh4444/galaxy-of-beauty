'use client';
import { cn } from '@galaxy/shared';
export function BeautyEidGlowCard({
  className = '',
  title = 'إشراقة العيد',
  subtitle = 'خطة جمالية متكاملة للعيد',
  locale = 'ar',
}: {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'قبل بأسبوع: فيشل + حواجب + مانيكير',
              en: 'A week before: facial + brows + manicure',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ليلة العيد: حمام زيت + مرطب + نوم مبكر',
              en: 'Eid eve: oil treatment + moisturizer + early sleep',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'صباح العيد: مكياج ناعم + عطر العيد',
              en: 'Eid morning: soft makeup + Eid perfume',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'صوري إطلالتك — ذكريات العيد',
              en: 'Photograph your look — Eid memories',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
