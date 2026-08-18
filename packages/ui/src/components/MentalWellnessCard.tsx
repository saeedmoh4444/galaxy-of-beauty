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
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  recommendations: { ar: string; en: string }[];
  packageName: { ar: string; en: string };
  price: number;
  color: string;
}

const MOODS: Record<WellnessMood, MoodDef> = {
  stressed: {
    emoji: '‍',
    title: { ar: 'متوترة', en: 'Stressed' },
    description: {
      ar: 'الضغوط اليومية تؤثر على بشرتكِ وجمالكِ',
      en: 'Daily pressures affect your skin and beauty',
    },
    recommendations: [
      { ar: 'مساج استرخاء', en: 'Relaxing massage' },
      { ar: 'جلسة تأمل موجهة', en: 'Guided meditation session' },
      { ar: 'حمام عطري', en: 'Aromatic bath' },
    ],
    packageName: { ar: 'استرخاء وهدوء', en: 'Relaxation and calm' },
    price: 250,
    color: 'from-indigo-100 to-blue-100 dark:from-indigo-950 dark:to-blue-950',
  },
  anxious: {
    emoji: '',
    title: { ar: 'قلقة', en: 'Anxious' },
    description: {
      ar: 'القلق يسرق نضارتكِ — استعيدي هدوءكِ',
      en: 'Anxiety steals your glow — reclaim your calm',
    },
    recommendations: [
      { ar: 'علاج بالروائح', en: 'Aromatherapy' },
      { ar: 'مساج لطيف', en: 'Gentle massage' },
      { ar: 'موسيقى هادئة', en: 'Soothing music' },
    ],
    packageName: { ar: 'طمأنينة', en: 'Reassurance' },
    price: 280,
    color: 'from-sky-100 to-teal-100 dark:from-sky-950 dark:to-teal-950',
  },
  tired: {
    emoji: '',
    title: { ar: 'مرهقة', en: 'Exhausted' },
    description: {
      ar: 'الإرهاق يظهر على وجهكِ — دلّلي نفسكِ',
      en: 'Fatigue shows on your face — pamper yourself',
    },
    recommendations: [
      { ar: 'عناية بالبشرة منعشة', en: 'Refreshing skincare' },
      { ar: 'مساج طاقة', en: 'Energy massage' },
      { ar: 'قناع مغذٍ', en: 'Nourishing mask' },
    ],
    packageName: { ar: 'انتعاشة الطاقة', en: 'Energy boost' },
    price: 220,
    color: 'from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950',
  },
  low_confidence: {
    emoji: '',
    title: { ar: 'ثقة منخفضة', en: 'Low confidence' },
    description: {
      ar: 'كل امرأة تستحق أن تشعر بالثقة',
      en: 'Every woman deserves to feel confident',
    },
    recommendations: [
      { ar: 'مكياج تعليمي', en: 'Makeup tutorial' },
      { ar: 'استشارة إطلالة', en: 'Look consultation' },
      { ar: 'جلسة تصوير', en: 'Photo session' },
    ],
    packageName: { ar: 'ثقة وإشراق', en: 'Confidence and glow' },
    price: 350,
    color: 'from-rose-100 to-pink-100 dark:from-rose-950 dark:to-pink-950',
  },
  grieving: {
    emoji: '',
    title: { ar: 'حزينة', en: 'Grieving' },
    description: {
      ar: 'العناية بنفسكِ جزء من رحلة التعافي',
      en: 'Caring for yourself is part of the healing journey',
    },
    recommendations: [
      { ar: 'مساج لطيف', en: 'Gentle massage' },
      { ar: 'حمام دافئ', en: 'Warm bath' },
      { ar: 'جلسة صامتة', en: 'Quiet session' },
    ],
    packageName: { ar: 'عناية لطيفة', en: 'Gentle care' },
    price: 200,
    color: 'from-purple-100 to-violet-100 dark:from-purple-950 dark:to-violet-950',
  },
  new_beginning: {
    emoji: '',
    title: { ar: 'بداية جديدة', en: 'New beginning' },
    description: {
      ar: 'انطلاقة جديدة تستحقين فيها أفضل عناية',
      en: 'A new start where you deserve the best care',
    },
    recommendations: [
      { ar: 'تسريحة جديدة', en: 'New hairstyle' },
      { ar: 'مكياج احترافي', en: 'Professional makeup' },
      { ar: 'استشارة ألوان', en: 'Color consultation' },
    ],
    packageName: { ar: 'بداية جديدة', en: 'New beginning' },
    price: 400,
    color: 'from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950',
  },
  celebrating: {
    emoji: '',
    title: { ar: 'احتفال', en: 'Celebrating' },
    description: {
      ar: 'لحظات الفرح تستحق إطلالة استثنائية',
      en: 'Moments of joy deserve an exceptional look',
    },
    recommendations: [
      { ar: 'مكياج مناسبات', en: 'Occasion makeup' },
      { ar: 'تسريحة شعر', en: 'Hair styling' },
      { ar: 'مانيكير وباديكير', en: 'Manicure and pedicure' },
    ],
    packageName: { ar: 'إشراقة الفرح', en: 'Joy glow' },
    price: 380,
    color: 'from-yellow-100 to-amber-100 dark:from-yellow-950 dark:to-amber-950',
  },
};

interface MentalWellnessCardProps {
  mood: WellnessMood;
  onBookTherapy?: () => void;
  onJournalPrompt?: () => void;
  className?: string;
  /** Label for the price section */
  priceLabel?: string;
  /** Currency suffix shown after the price */
  currencySuffix?: string;
  /** Therapy booking button label */
  bookLabel?: string;
  /** Journal prompt button label */
  journalPromptLabel?: string;
  /** Wellness tip footer text */
  wellnessTip?: string;
  /** Locale for internal mood data strings */
  locale?: 'ar' | 'en';
}

export function MentalWellnessCard({
  mood,
  onBookTherapy,
  onJournalPrompt,
  className = '',
  priceLabel = 'السعر',
  currencySuffix = 'ر.س',
  bookLabel = 'احجزي جلستكِ ‍️',
  journalPromptLabel = 'اكتبي مشاعركِ في يومياتكِ الجمالية',
  wellnessTip = '"الجمال يبدأ من الداخل" — عنايتكِ بنفسكِ عبادة',
  locale = 'ar',
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
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
              {m.title[locale]}
            </h4>
            <p className="text-[10px] text-text-secondary dark:text-gray-300">
              {m.description[locale]}
            </p>
          </div>
        </div>
      </div>

      {/* Package */}
      <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          {m.packageName[locale]}
        </p>
        <div className="mt-1.5 space-y-0.5">
          {m.recommendations.map((r) => (
            <div key={r.ar} className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-tertiary" aria-hidden="true"></span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300">
                {r[locale]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{priceLabel}</p>
          <p className="text-lg font-bold text-text-primary dark:text-gray-100">
            {m.price} {currencySuffix}
          </p>
        </div>
        <button
          type="button"
          onClick={onBookTherapy}
          className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2.5 text-xs font-bold text-white hover:from-purple-600 hover:to-violet-600 active:scale-[0.98] transition-all shadow-sm"
        >
          {bookLabel}
        </button>
      </div>

      {/* Journal prompt */}
      <button
        type="button"
        onClick={onJournalPrompt}
        className="mt-2 w-full rounded-lg border border-purple-100 bg-purple-50 py-2 text-[10px] font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300 transition-colors"
      >
        {journalPromptLabel}
      </button>

      {/* Wellness tip */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {wellnessTip}
      </p>
    </div>
  );
}
