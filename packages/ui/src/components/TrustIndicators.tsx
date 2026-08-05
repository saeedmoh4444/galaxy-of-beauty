'use client';

/**
 * Trust Indicators — shown during booking to reassure women.
 * Three badges: Female Only, Verified, Privacy Protected.
 * From Phase W1: Safety & Privacy Architecture.
 */

export function TrustIndicators({ className = '' }: { className?: string }): JSX.Element {
  const items = [
    { emoji: '👩‍🎨', label: 'فنيات فقط', desc: 'جميع الفنيات نساء' },
    { emoji: '✅', label: 'موثقات', desc: 'تم التحقق من هوياتهن' },
    { emoji: '🔒', label: 'خصوصية تامة', desc: 'بياناتكِ محمية بالكامل' },
  ];

  return (
    <div className={`flex justify-center gap-3 ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950">
          <span className="text-lg">{item.emoji}</span>
          <div>
            <p className="text-xs font-bold text-green-800 dark:text-green-200">{item.label}</p>
            <p className="text-[10px] text-green-600 dark:text-green-400">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
