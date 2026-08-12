'use client';

import { useState } from 'react';

/**
 * Sisterhood Wall — women leaving anonymous compliments for each other.
 * From Phase W4: Celebrating Each Other.
 */

const SEED_COMPLIMENTS = [
  { emoji: '💖', text: 'أنتِ أقوى مما تتصورين. استمري!' },
  { emoji: '🌸', text: 'ابتسامتكِ تضيء العالم من حولكِ' },
  { emoji: '✨', text: 'جمالكِ الداخلي هو ما يجعلكِ مميزة' },
  { emoji: '🫶', text: 'كوني فخورة بنفسكِ — أنتِ تقومين بعمل رائع' },
];

export function SisterhoodWall({ className = '' }: { className?: string }): JSX.Element {
  const [compliments, setCompliments] = useState(SEED_COMPLIMENTS);
  const [input, setInput] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    setCompliments([{ emoji: '💌', text: input.trim() }, ...compliments.slice(0, 9)]);
    setInput('');
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900 ${className}`}
    >
      <h3 className="text-sm font-bold text-pink-700 dark:text-pink-300">👯‍♀️ جدار الأختية</h3>
      <p className="mt-1 text-xs text-pink-500 dark:text-pink-400">
        اتركي رسالة إيجابية لأخت مجهولة
      </p>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتبي رسالة تشجيع..."
          maxLength={100}
          className="flex-1 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-xs dark:border-pink-800 dark:bg-pink-950 dark:text-pink-100 dark:placeholder:text-pink-600"
        />
        <button
          onClick={send}
          className="rounded-lg bg-pink-600 px-3 py-2 text-xs font-bold text-white hover:bg-pink-700"
        >
          {sent ? '✅' : 'إرسال'}
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {compliments.slice(0, 4).map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg bg-pink-50 p-2 dark:bg-pink-950"
          >
            <span className="text-lg">{c.emoji}</span>
            <p className="text-xs text-pink-800 dark:text-pink-200">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
