'use client';

import { cn } from '@galaxy/shared';

/**
 * New Mom Support Card — beauty services adapted for new mothers.
 * From Phase W7: Mother-Daughter & Family.
 *
 * Usage:
 *   <NewMomSupportCard babyAge={3} onBook={() => {}} />
 */

interface NewMomSupportCardProps {
  babyAge: number; // in months
  momName?: string;
  onBook?: () => void;
  className?: string;
}

export function NewMomSupportCard({
  babyAge,
  momName,
  onBook,
  className = '',
}: NewMomSupportCardProps): JSX.Element {
  const isNewborn = babyAge <= 3;
  const isInfant = babyAge <= 12;

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5 dark:border-sky-900 dark:from-sky-950 dark:to-blue-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-sky-800 dark:text-sky-200">
          {isNewborn ? 'أهلاً بالأم الجديدة' : 'عودة الأم'}
        </h4>
        <p className="text-[10px] text-sky-500 dark:text-sky-400">
          {momName ? `${momName} — ` : ''}خدمات تناسبكِ مع طفلكِ الصغير
        </p>
      </div>

      {/* Baby age */}
      <div className="mt-3 rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-sky-700 dark:text-sky-300">
          عمر الطفل: {babyAge < 1 ? 'أقل من شهر' : `${babyAge} ${babyAge === 1 ? 'شهر' : 'أشهر'}`}
        </p>
      </div>

      {/* What we offer */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200"> خدمات مناسبة لكِ</p>
        <div className="mt-1.5 space-y-1 text-[10px] text-text-secondary dark:text-gray-300">
          <p>• خدمات سريعة (30-45 دقيقة)</p>
          <p>• ركن أطفال مع مراقبة</p>
          {isNewborn && <p>• إمكانية إرضاع الطفل أثناء الجلسة</p>}
          {isInfant && <p>• كرسي أطفال بجانبكِ</p>}
          <p>• مواعيد مرنة تناسب جدول نوم الطفل</p>
          <p>• خصم 15% للأمهات الجدد</p>
        </div>
      </div>

      {/* Encouragement */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-sky-700 dark:text-sky-300">
          {' '}
          {isNewborn
            ? 'أنتِ تقومين بعمل رائع — دللي نفسكِ'
            : 'عودي إلى روتين جمالكِ — أنتِ تستحقين'}
        </p>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700 active:scale-[0.98] transition-all"
      >
        احجزي وقتكِ
      </button>

      <p className="mt-2 text-center text-[9px] text-sky-500 dark:text-sky-400">
        الأم السعيدة تربي طفلاً سعيداً
      </p>
    </div>
  );
}
