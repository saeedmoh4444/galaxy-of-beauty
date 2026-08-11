'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty History Timeline — history of beauty through the ages.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyHistoryTimeline />
 */

interface HistoryEra {
  era: string;
  emoji: string;
  year: string;
  fact: string;
}

const ERAS: HistoryEra[] = [
  {
    era: 'مصر القديمة',
    emoji: '👁️',
    year: '3000 ق.م',
    fact: 'كليوباترا استخدمت الحليب والعسل للاستحمام — وزيت الخروع للكحل',
  },
  {
    era: 'اليونان القديمة',
    emoji: '🏛️',
    year: '500 ق.م',
    fact: 'استخدموا زيت الزيتون للترطيب والرصاص الأبيض لتفتيح البشرة',
  },
  {
    era: 'الجزيرة العربية',
    emoji: '🤚',
    year: '2000 ق.م',
    fact: 'الحناء استخدمت للتزيين والتبريد — ونقشاتها تروي قصص القبائل',
  },
  {
    era: 'العصر العباسي',
    emoji: '🌙',
    year: '800 م',
    fact: 'زرياب الأندلسي أدخل روتين العناية بالشعر والبشرة للنساء',
  },
  {
    era: 'أوروبا الفيكتورية',
    emoji: '👑',
    year: '1850 م',
    fact: 'البشرة البيضاء رمز الثراء — والنساء تجنبن الشمس تماماً',
  },
  {
    era: 'العصر الذهبي',
    emoji: '🎬',
    year: '1950 م',
    fact: 'مارلين مونرو جعلت الشامة والشعر الأشقر موضة عالمية',
  },
  {
    era: 'الثمانينات',
    emoji: '💄',
    year: '1980 م',
    fact: 'الألوان الجريئة والمكياج الثقيل — عصر الإفراط في كل شيء',
  },
  {
    era: 'اليوم',
    emoji: '🌿',
    year: '2026 م',
    fact: 'الجمال الطبيعي والعناية بالبشرة — والأهم: الجمال للجميع',
  },
];

interface BeautyHistoryTimelineProps {
  className?: string;
}

export function BeautyHistoryTimeline({ className = '' }: BeautyHistoryTimelineProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl bg-white p-5 dark:bg-gray-900', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          📜
        </span>
        <h4 className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">تاريخ الجمال</h4>
        <p className="text-[10px] text-amber-500 dark:text-amber-400">رحلة الجمال عبر العصور</p>
      </div>

      <div className="mt-4">
        {ERAS.map((era, i) => (
          <div key={era.era} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-sm dark:border-amber-800 dark:bg-amber-950">
                {era.emoji}
              </div>
              {i < ERAS.length - 1 && (
                <div className="h-full min-h-[16px] w-0.5 bg-amber-200 dark:bg-amber-800" />
              )}
            </div>
            <div className="pb-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  {era.era}
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {era.year}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] leading-relaxed text-text-secondary dark:text-gray-300">
                {era.fact}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
        📜 &ldquo;الجمال قصة قديمة — وما زلنا نكتب فصولها&rdquo;
      </p>
    </div>
  );
}
