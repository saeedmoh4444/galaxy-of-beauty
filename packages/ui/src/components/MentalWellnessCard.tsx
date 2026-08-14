'use client';

import { cn } from '@galaxy/shared';

/**
 * Mental Wellness Card — beauty as therapy for emotional wellbeing.
 * From Phase W3: Health & Wellness — Mental Wellness & Beauty.
 *
 * Usage:
 *   <MentalWellnessCard
 *     mood="stressed"
 *     onBookTherapy={() => {}}
 *   />
 */

type WellnessMood =
  | 'stressed'
  | 'anxious'
  | 'tired'
  | 'low_confidence'
  | 'grieving'
  | 'new_beginning'
  | 'celebrating';

interface MoodDef {
  emoji: string;
  title: string;
  description: string;
  recommendations: string[];
  packageName: string;
  price: number;
  color: string;
}

const MOODS: Record<WellnessMood, MoodDef> = {
  stressed: {
    emoji: '‍',
    title: 'متوترة',
    description: 'الضغوط اليومية تؤثر على بشرتكِ وجمالكِ',
    recommendations: ['مساج استرخاء', 'جلسة تأمل موجهة', 'حمام عطري'],
    packageName: 'استرخاء وهدوء',
    price: 250,
    color: 'from-indigo-100 to-blue-100 dark:from-indigo-950 dark:to-blue-950',
  },
  anxious: {
    emoji: '',
    title: 'قلقة',
    description: 'القلق يسرق نضارتكِ — استعيدي هدوءكِ',
    recommendations: ['علاج بالروائح', 'مساج لطيف', 'موسيقى هادئة'],
    packageName: 'طمأنينة',
    price: 280,
    color: 'from-sky-100 to-teal-100 dark:from-sky-950 dark:to-teal-950',
  },
  tired: {
    emoji: '',
    title: 'مرهقة',
    description: 'الإرهاق يظهر على وجهكِ — دلّلي نفسكِ',
    recommendations: ['عناية بالبشرة منعشة', 'مساج طاقة', 'قناع مغذٍ'],
    packageName: 'انتعاشة الطاقة',
    price: 220,
    color: 'from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950',
  },
  low_confidence: {
    emoji: '',
    title: 'ثقة منخفضة',
    description: 'كل امرأة تستحق أن تشعر بالثقة',
    recommendations: ['مكياج تعليمي', 'استشارة إطلالة', 'جلسة تصوير'],
    packageName: 'ثقة وإشراق',
    price: 350,
    color: 'from-rose-100 to-pink-100 dark:from-rose-950 dark:to-pink-950',
  },
  grieving: {
    emoji: '',
    title: 'حزينة',
    description: 'العناية بنفسكِ جزء من رحلة التعافي',
    recommendations: ['مساج لطيف', 'حمام دافئ', 'جلسة صامتة'],
    packageName: 'عناية لطيفة',
    price: 200,
    color: 'from-purple-100 to-violet-100 dark:from-purple-950 dark:to-violet-950',
  },
  new_beginning: {
    emoji: '',
    title: 'بداية جديدة',
    description: 'انطلاقة جديدة تستحقين فيها أفضل عناية',
    recommendations: ['تسريحة جديدة', 'مكياج احترافي', 'استشارة ألوان'],
    packageName: 'بداية جديدة',
    price: 400,
    color: 'from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950',
  },
  celebrating: {
    emoji: '',
    title: 'احتفال',
    description: 'لحظات الفرح تستحق إطلالة استثنائية',
    recommendations: ['مكياج مناسبات', 'تسريحة شعر', 'مانيكير وباديكير'],
    packageName: 'إشراقة الفرح',
    price: 380,
    color: 'from-yellow-100 to-amber-100 dark:from-yellow-950 dark:to-amber-950',
  },
};

interface MentalWellnessCardProps {
  mood: WellnessMood;
  onBookTherapy?: () => void;
  onJournalPrompt?: () => void;
  className?: string;
}

export function MentalWellnessCard({
  mood,
  onBookTherapy,
  onJournalPrompt,
  className = '',
}: MentalWellnessCardProps): JSX.Element {
  const m = MOODS[mood];

  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {/* Mood indicator */}
      <div className={cn('rounded-xl bg-gradient-to-br p-4', m.color)}>
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {m.emoji}
          </span>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">{m.title}</h4>
            <p className="text-[10px] text-text-secondary dark:text-gray-300">{m.description}</p>
          </div>
        </div>
      </div>

      {/* Package */}
      <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
           {m.packageName}
        </p>
        <div className="mt-1.5 space-y-0.5">
          {m.recommendations.map((r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-tertiary" aria-hidden="true">
                
              </span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300">{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">السعر</p>
          <p className="text-lg font-bold text-text-primary dark:text-gray-100">{m.price} ر.س</p>
        </div>
        <button
          type="button"
          onClick={onBookTherapy}
          className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2.5 text-xs font-bold text-white hover:from-purple-600 hover:to-violet-600 active:scale-[0.98] transition-all shadow-sm"
        >
          احجزي جلستكِ ‍️
        </button>
      </div>

      {/* Journal prompt */}
      <button
        type="button"
        onClick={onJournalPrompt}
        className="mt-2 w-full rounded-lg border border-purple-100 bg-purple-50 py-2 text-[10px] font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300 transition-colors"
      >
         اكتبي مشاعركِ في يومياتكِ الجمالية
      </button>

      {/* Wellness tip */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         &quot;الجمال يبدأ من الداخل&quot; — عنايتكِ بنفسكِ عبادة
      </p>
    </div>
  );
}
