'use client';

/**
 * Trust Bar — horizontal stats showing platform credibility.
 * For landing page hero section.
 */

interface TrustItem {
  icon: string;
  label: string;
  value: string;
}

interface TrustBarProps {
  items?: TrustItem[];
  className?: string;
}

const DEFAULT_ITEMS: TrustItem[] = [
  { icon: '', label: 'خدمة تجميل', value: '٤٥+' },
  { icon: '‍', label: 'فنية موثقة', value: '٩+' },
  { icon: '', label: 'حجز مكتمل', value: '٥٠٠+' },
  { icon: '', label: 'تقييم', value: '٤.٨' },
  { icon: '️', label: 'مدينة', value: '١٢+' },
];

export function TrustBar({ items = DEFAULT_ITEMS, className = '' }: TrustBarProps): JSX.Element {
  return (
    <div className={`flex flex-wrap justify-center gap-6 md:gap-10 ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-center">
          <span className="text-xl">{item.icon}</span>
          <div className="text-right">
            <div className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
              {item.value}
            </div>
            <div className="text-xs text-text-secondary dark:text-gray-400">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
