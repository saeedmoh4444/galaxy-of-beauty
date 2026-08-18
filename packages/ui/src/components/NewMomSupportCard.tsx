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
  /** Heading for newborns */
  newbornTitle?: string;
  /** Heading when the mom returns */
  returnTitle?: string;
  /** Services description text */
  servicesText?: string;
  /** Prefix before the baby age */
  babyAgePrefix?: string;
  /** Text when the baby is under one month */
  underOneMonth?: string;
  /** Month singular */
  monthSingular?: string;
  /** Month plural */
  monthPlural?: string;
  /** "Services for you" heading */
  offersTitle?: string;
  /** Offer bullets */
  offer1?: string;
  offer2?: string;
  offer3?: string;
  offer4?: string;
  offer5?: string;
  offer6?: string;
  /** Encouragement for new moms */
  encouragementNewborn?: string;
  /** Encouragement for returning moms */
  encouragementReturn?: string;
  /** Book button label */
  bookButtonText?: string;
  /** Footer text */
  footerText?: string;
}

export function NewMomSupportCard({
  babyAge,
  momName,
  onBook,
  className = '',
  newbornTitle = 'أهلاً بالأم الجديدة',
  returnTitle = 'عودة الأم',
  servicesText = 'خدمات تناسبكِ مع طفلكِ الصغير',
  babyAgePrefix = 'عمر الطفل: ',
  underOneMonth = 'أقل من شهر',
  monthSingular = 'شهر',
  monthPlural = 'أشهر',
  offersTitle = ' خدمات مناسبة لكِ',
  offer1 = '• خدمات سريعة (30-45 دقيقة)',
  offer2 = '• ركن أطفال مع مراقبة',
  offer3 = '• إمكانية إرضاع الطفل أثناء الجلسة',
  offer4 = '• كرسي أطفال بجانبكِ',
  offer5 = '• مواعيد مرنة تناسب جدول نوم الطفل',
  offer6 = '• خصم 15% للأمهات الجدد',
  encouragementNewborn = 'أنتِ تقومين بعمل رائع — دللي نفسكِ',
  encouragementReturn = 'عودي إلى روتين جمالكِ — أنتِ تستحقين',
  bookButtonText = 'احجزي وقتكِ',
  footerText = 'الأم السعيدة تربي طفلاً سعيداً',
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
          {isNewborn ? newbornTitle : returnTitle}
        </h4>
        <p className="text-[10px] text-sky-500 dark:text-sky-400">
          {momName ? `${momName} — ` : ''}
          {servicesText}
        </p>
      </div>

      {/* Baby age */}
      <div className="mt-3 rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-sky-700 dark:text-sky-300">
          {babyAgePrefix}
          {babyAge < 1
            ? underOneMonth
            : `${babyAge} ${babyAge === 1 ? monthSingular : monthPlural}`}
        </p>
      </div>

      {/* What we offer */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200">{offersTitle}</p>
        <div className="mt-1.5 space-y-1 text-[10px] text-text-secondary dark:text-gray-300">
          <p>{offer1}</p>
          <p>{offer2}</p>
          {isNewborn && <p>{offer3}</p>}
          {isInfant && <p>{offer4}</p>}
          <p>{offer5}</p>
          <p>{offer6}</p>
        </div>
      </div>

      {/* Encouragement */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-sky-700 dark:text-sky-300">
          {' '}
          {isNewborn ? encouragementNewborn : encouragementReturn}
        </p>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700 active:scale-[0.98] transition-all"
      >
        {bookButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-sky-500 dark:text-sky-400">{footerText}</p>
    </div>
  );
}
