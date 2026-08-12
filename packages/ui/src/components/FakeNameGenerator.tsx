'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Fake Name Generator — "Book as Sara" for privacy-conscious women.
 * From Phase W9: Safety Micro-Features.
 *
 * Usage:
 *   <FakeNameGenerator onSelect={(name) => console.log(name)} />
 */

const SAUDI_NAMES = [
  'سارة',
  'نورة',
  'مها',
  'ريم',
  'لطيفة',
  'هند',
  'الجوهرة',
  'دلال',
  'غادة',
  'عهود',
  'بسمة',
  'أثير',
  'لمى',
  'رغد',
  'سلمى',
  'مياسة',
  'تالة',
  'نجود',
  'ريناد',
  'وسن',
];

interface FakeNameGeneratorProps {
  onSelect?: (name: string) => void;
  className?: string;
}

export function FakeNameGenerator({
  onSelect,
  className = '',
}: FakeNameGeneratorProps): JSX.Element {
  const [generated, setGenerated] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const generate = () => {
    const available = SAUDI_NAMES.filter((n) => n !== selected);
    const name = available[Math.floor(Math.random() * available.length)] ?? 'سارة';
    setGenerated(name);
  };

  const select = (name: string) => {
    setSelected(name);
    setGenerated(null);
    onSelect?.(name);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          🎭
        </span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">
            احجزي باسم مستعار
          </h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">
            خصوصيتكِ تهمنا — لا حاجة لاستخدام اسمكِ الحقيقي
          </p>
        </div>
      </div>

      {/* Current selection */}
      {selected && (
        <div className="mt-3 rounded-xl bg-fuchsia-50 p-3 dark:bg-fuchsia-950">
          <p className="text-center text-[10px] text-fuchsia-600 dark:text-fuchsia-400">
            اسم الحجز
          </p>
          <p className="text-center text-lg font-bold text-fuchsia-800 dark:text-fuchsia-200">
            {selected}
          </p>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mt-1 block w-full text-center text-[10px] text-fuchsia-500 underline hover:text-fuchsia-700 dark:text-fuchsia-400"
          >
            تغيير الاسم
          </button>
        </div>
      )}

      {/* Generator */}
      {!selected && (
        <>
          <button
            type="button"
            onClick={generate}
            className="mt-3 w-full rounded-xl bg-fuchsia-600 py-2.5 text-xs font-bold text-white hover:bg-fuchsia-700 active:scale-[0.98] transition-all"
          >
            🎲 ولّدي اسماً عشوائياً
          </button>

          {/* Generated name */}
          {generated && (
            <div className="mt-3 rounded-xl bg-fuchsia-50 p-3 text-center dark:bg-fuchsia-950">
              <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">نقترح عليكِ</p>
              <p className="mt-1 text-xl font-bold text-fuchsia-700 dark:text-fuchsia-300">
                {generated}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => select(generated)}
                  className="flex-1 rounded-lg bg-fuchsia-600 py-1.5 text-[10px] font-bold text-white hover:bg-fuchsia-700"
                >
                  ✅ استخدام
                </button>
                <button
                  type="button"
                  onClick={generate}
                  className="flex-1 rounded-lg bg-fuchsia-100 py-1.5 text-[10px] font-bold text-fuchsia-700 hover:bg-fuchsia-200 dark:bg-fuchsia-900 dark:text-fuchsia-300"
                >
                  🔄 جربِي آخر
                </button>
              </div>
            </div>
          )}

          {/* Name grid */}
          <div className="mt-3">
            <p className="text-[10px] font-bold text-text-tertiary dark:text-gray-400 mb-2">
              أو اختاري من القائمة
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SAUDI_NAMES.slice(0, 12).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => select(name)}
                  className="rounded-full bg-fuchsia-50 px-3 py-1 text-[10px] font-medium text-fuchsia-700 hover:bg-fuchsia-100 dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:hover:bg-fuchsia-900 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Privacy note */}
      <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
        <span className="text-xs shrink-0" aria-hidden="true">
          🔒
        </span>
        <p className="text-[9px] text-text-tertiary dark:text-gray-500">
          اسمكِ الحقيقي يبقى محمياً. الاسم المستعار يُستخدم فقط للتواصل مع الخبيرة أثناء الموعد.
        </p>
      </div>
    </div>
  );
}
