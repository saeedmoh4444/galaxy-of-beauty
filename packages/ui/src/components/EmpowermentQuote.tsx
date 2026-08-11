'use client';

/**
 * Empowerment Quote — rotating inspirational quotes from Saudi and Arab women.
 * From Phase W10: Saudi Women Leadership.
 */

const QUOTES = [
  {
    text: 'المرأة السعودية قادرة على تحقيق أي شيء تضع نصب عينيها.',
    author: 'الأميرة ريما بنت بندر',
  },
  { text: 'الجمال الحقيقي ينبع من الثقة بالنفس والإيمان بالقدرات.', author: 'مشاعل' },
  {
    text: 'كل امرأة تستحق أن تشعر بالتميز — ليس لأنها جميلة، بل لأنها هي.',
    author: 'فريق جالكسي بيوتي',
  },
  { text: 'العناية بنفسكِ ليست أنانية — إنها استثمار في سعادتكِ وإنتاجيتكِ.', author: 'د. ليلى' },
  { text: 'وراء كل امرأة ناجحة، امرأة أخرى دعمتها.', author: 'نورة' },
  { text: 'أنتِ لا تحتاجين إلى إذن أحد لتكوني رائعة.', author: 'سارة' },
];

export function EmpowermentQuote({ className = '' }: { className?: string }): JSX.Element {
  const today = new Date().getDate();
  const quote = QUOTES[today % QUOTES.length]!;

  return (
    <div
      className={`rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-5 text-center dark:border-purple-900 dark:from-purple-950 dark:to-pink-950 ${className}`}
    >
      <p className="text-lg leading-relaxed text-purple-800 dark:text-purple-200">"{quote.text}"</p>
      <p className="mt-3 text-xs font-semibold text-purple-500 dark:text-purple-400">
        — {quote.author}
      </p>
    </div>
  );
}
