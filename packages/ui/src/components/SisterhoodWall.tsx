'use client';

import { useState } from 'react';

/**
 * Sisterhood Wall — women leaving anonymous compliments for each other.
 * From Phase W4: Celebrating Each Other.
 */

const SEED_COMPLIMENTS = [
  {
    emoji: '',
    text: {
      ar: 'أنتِ أقوى مما تتصورين. استمري!',
      en: 'You are stronger than you think. Keep going!',
    },
  },
  {
    emoji: '',
    text: { ar: 'ابتسامتكِ تضيء العالم من حولكِ', en: 'Your smile lights up the world around you' },
  },
  {
    emoji: '',
    text: { ar: 'جمالكِ الداخلي هو ما يجعلكِ مميزة', en: 'Your inner beauty makes you special' },
  },
  {
    emoji: '🫶',
    text: {
      ar: 'كوني فخورة بنفسكِ — أنتِ تقومين بعمل رائع',
      en: 'Be proud of yourself — you are doing great',
    },
  },
];

export function SisterhoodWall({
  className = '',
  locale = 'ar',
  title = '‍️ جدار الأختية',
  subtitle = 'اتركي رسالة إيجابية لأخت مجهولة',
  placeholder = 'اكتبي رسالة تشجيع...',
  sendButtonText = 'إرسال',
}: {
  className?: string;
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  placeholder?: string;
  sendButtonText?: string;
}): JSX.Element {
  const [compliments, setCompliments] = useState(SEED_COMPLIMENTS);
  const [input, setInput] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    setCompliments([
      { emoji: '', text: { ar: input.trim(), en: input.trim() } },
      ...compliments.slice(0, 9),
    ]);
    setInput('');
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900 ${className}`}
    >
      <h3 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h3>
      <p className="mt-1 text-xs text-pink-500 dark:text-pink-400">{subtitle}</p>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          maxLength={100}
          className="flex-1 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-xs dark:border-pink-800 dark:bg-pink-950 dark:text-pink-100 dark:placeholder:text-pink-600"
        />
        <button
          onClick={send}
          className="rounded-lg bg-pink-600 px-3 py-2 text-xs font-bold text-white hover:bg-pink-700"
        >
          {sent ? '' : sendButtonText}
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {compliments.slice(0, 4).map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg bg-pink-50 p-2 dark:bg-pink-950"
          >
            <span className="text-lg">{c.emoji}</span>
            <p className="text-xs text-pink-800 dark:text-pink-200">{c.text[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
