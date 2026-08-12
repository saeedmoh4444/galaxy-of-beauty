'use client';

import { cn } from '@galaxy/shared';

/**
 * She Leads Program Card — fast-track women technicians to salon management.
 * From Phase W10: Saudi Women Leadership — "She Leads" Program.
 *
 * Usage:
 *   <SheLeadsProgramCard participants={34} onApply={() => {}} />
 */

interface SheLeadsProgramCardProps {
  participants: number;
  duration?: string;
  onApply?: () => void;
  className?: string;
}

const MODULES = [
  { emoji: '📊', title: 'إدارة الأعمال', desc: 'محاسبة، تسعير، إدارة المخزون' },
  { emoji: '👥', title: 'قيادة الفريق', desc: 'توظيف، تدريب، تحفيز الخبيرات' },
  { emoji: '📣', title: 'التسويق', desc: 'وسائل التواصل، العلامة التجارية' },
  { emoji: '💻', title: 'التقنية', desc: 'نظام الحجز، التحليلات، التقارير' },
  { emoji: '🤝', title: 'خدمة العملاء', desc: 'بناء العلاقات، حل المشكلات' },
  { emoji: '💡', title: 'الابتكار', desc: 'تطوير خدمات جديدة، التميز' },
];

export function SheLeadsProgramCard({
  participants,
  duration = '6 أشهر',
  onApply,
  className = '',
}: SheLeadsProgramCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          🚀
        </span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">She Leads</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          من خبيرة إلى قائدة — برنامج المسار السريع للإدارة
        </p>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">المدة</p>
          <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{duration}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">الملتحقات</p>
          <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{participants}+</p>
        </div>
      </div>

      {/* Modules */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {MODULES.map((m) => (
          <div key={m.title} className="rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/60">
            <span className="text-lg" aria-hidden="true">
              {m.emoji}
            </span>
            <p className="mt-0.5 text-[10px] font-bold text-text-primary dark:text-gray-100">
              {m.title}
            </p>
            <p className="text-[9px] text-text-tertiary dark:text-gray-400">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-center text-[10px] italic text-amber-700 dark:text-amber-300">
          &ldquo;من خبيرة تجميل إلى مديرة صالون في سنة واحدة&rdquo;
        </p>
        <p className="mt-1 text-center text-[9px] text-text-tertiary dark:text-gray-500">
          — نورة، خريجة البرنامج
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onApply}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] transition-all shadow-sm"
      >
        انضمي للبرنامج 🚀
      </button>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
        👑 لأن القيادة تبدأ بخطوة
      </p>
    </div>
  );
}
