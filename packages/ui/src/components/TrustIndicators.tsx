'use client';

/**
 * Trust Indicators — shown during booking to reassure women.
 * Three badges: Female Only, Verified, Privacy Protected.
 * From Phase W1: Safety & Privacy Architecture.
 */

export function TrustIndicators({
  className = '',
  locale = 'ar',
}: {
  className?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  const items = [
    {
      emoji: '‍',
      label: { ar: 'فنيات فقط', en: 'Female Only' },
      desc: { ar: 'جميع الفنيات نساء', en: 'All technicians are women' },
    },
    {
      emoji: '',
      label: { ar: 'موثقات', en: 'Verified' },
      desc: { ar: 'تم التحقق من هوياتهن', en: 'Identities verified' },
    },
    {
      emoji: '',
      label: { ar: 'خصوصية تامة', en: 'Full Privacy' },
      desc: { ar: 'بياناتكِ محمية بالكامل', en: 'Your data is fully protected' },
    },
  ];

  return (
    <div className={`flex justify-center gap-3 ${className}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950"
        >
          <span className="text-lg">{item.emoji}</span>
          <div>
            <p className="text-xs font-bold text-green-800 dark:text-green-200">
              {item.label[locale]}
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-400">{item.desc[locale]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
