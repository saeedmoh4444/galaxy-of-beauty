'use client';

/**
 * Empowerment Quote — rotating inspirational quotes from Saudi and Arab women.
 * From Phase W10: Saudi Women Leadership.
 */

const QUOTES = [
  {
    text: {
      ar: 'المرأة السعودية قادرة على تحقيق أي شيء تضع نصب عينيها.',
      en: 'Saudi women can achieve anything they set their minds to.',
    },
    author: { ar: 'الأميرة ريما بنت بندر', en: 'Princess Reema bint Bandar' },
  },
  {
    text: {
      ar: 'الجمال الحقيقي ينبع من الثقة بالنفس والإيمان بالقدرات.',
      en: 'True beauty comes from self-confidence and belief in your abilities.',
    },
    author: { ar: 'مشاعل', en: 'Mashael' },
  },
  {
    text: {
      ar: 'كل امرأة تستحق أن تشعر بالتميز — ليس لأنها جميلة، بل لأنها هي.',
      en: 'Every woman deserves to feel special — not because she is beautiful, but because she is herself.',
    },
    author: { ar: 'فريق جالكسي بيوتي', en: 'Galaxy Beauty team' },
  },
  {
    text: {
      ar: 'العناية بنفسكِ ليست أنانية — إنها استثمار في سعادتكِ وإنتاجيتكِ.',
      en: 'Taking care of yourself is not selfish — it is an investment in your happiness and productivity.',
    },
    author: { ar: 'د. ليلى', en: 'Dr. Layla' },
  },
  {
    text: {
      ar: 'وراء كل امرأة ناجحة، امرأة أخرى دعمتها.',
      en: 'Behind every successful woman is another woman who supported her.',
    },
    author: { ar: 'نورة', en: 'Noura' },
  },
  {
    text: {
      ar: 'أنتِ لا تحتاجين إلى إذن أحد لتكوني رائعة.',
      en: "You do not need anyone's permission to be amazing.",
    },
    author: { ar: 'سارة', en: 'Sara' },
  },
];

export function EmpowermentQuote({
  className = '',
  locale = 'ar',
}: {
  className?: string;
  /** Display language for built-in quotes */
  locale?: 'ar' | 'en';
}): JSX.Element {
  const today = new Date().getDate();
  const quote = QUOTES[today % QUOTES.length]!;

  return (
    <div
      className={`rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-5 text-center dark:border-purple-900 dark:from-purple-950 dark:to-pink-950 ${className}`}
    >
      <p className="text-lg leading-relaxed text-purple-800 dark:text-purple-200">
        &quot;{quote.text[locale]}&quot;
      </p>
      <p className="mt-3 text-xs font-semibold text-purple-500 dark:text-purple-400">
        — {quote.author[locale]}
      </p>
    </div>
  );
}
