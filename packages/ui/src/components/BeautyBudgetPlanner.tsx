'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Budget Planner — monthly beauty budget calculator.
 * From Phase W5: Financial Empowerment — Beauty Savings Account.
 *
 * Usage:
 *   <BeautyBudgetPlanner monthlyIncome={8000} />
 */

interface BudgetCategory {
  name: { ar: string; en: string };
  emoji: string;
  percentage: number;
  color: string;
}

const CATEGORIES: BudgetCategory[] = [
  {
    name: { ar: 'عناية بالبشرة', en: 'Skincare' },
    emoji: '',
    percentage: 25,
    color: 'from-pink-400 to-rose-400',
  },
  {
    name: { ar: 'شعر', en: 'Hair' },
    emoji: '',
    percentage: 20,
    color: 'from-purple-400 to-violet-400',
  },
  {
    name: { ar: 'أظافر', en: 'Nails' },
    emoji: '',
    percentage: 15,
    color: 'from-amber-400 to-orange-400',
  },
  {
    name: { ar: 'مساج واسترخاء', en: 'Massage & Relaxation' },
    emoji: '',
    percentage: 15,
    color: 'from-teal-400 to-emerald-400',
  },
  {
    name: { ar: 'مكياج', en: 'Makeup' },
    emoji: '',
    percentage: 15,
    color: 'from-rose-400 to-pink-400',
  },
  {
    name: { ar: 'ادخار', en: 'Savings' },
    emoji: '',
    percentage: 10,
    color: 'from-green-400 to-teal-400',
  },
];

interface BeautyBudgetPlannerProps {
  monthlyIncome: number;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Slider label */
  sliderLabel?: string;
  /** Label for the monthly income stat */
  monthlyIncomeLabel?: string;
  /** Label for the beauty budget stat */
  beautyBudgetLabel?: string;
  /** Currency suffix for amounts */
  currencySuffix?: string;
  /** Category breakdown heading */
  breakdownTitle?: string;
  /** Tip text before the percentage */
  tipPrefix?: string;
  /** Tip text after the percentage */
  tipSuffix?: string;
  /** Display locale for category names */
  locale?: 'ar' | 'en';
}

export function BeautyBudgetPlanner({
  monthlyIncome,
  className = '',
  title = 'ميزانية الجمال',
  subtitle = 'خططي لإنفاقكِ الجمالي بذكاء',
  sliderLabel = 'نسبة من الدخل للجمال',
  monthlyIncomeLabel = 'الدخل الشهري',
  beautyBudgetLabel = 'ميزانية الجمال',
  currencySuffix = 'ر.س',
  breakdownTitle = 'توزيع الميزانية',
  tipPrefix = 'خصصي ',
  tipSuffix = '% من دخلكِ لجمالكِ — واستمتعي بدون تأنيب ضمير',
  locale = 'ar',
}: BeautyBudgetPlannerProps): JSX.Element {
  const [beautyPercent, setBeautyPercent] = useState(10);
  const beautyBudget = Math.round(monthlyIncome * (beautyPercent / 100));

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Budget slider */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300">{sliderLabel}</span>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
            {beautyPercent}%
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={25}
          value={beautyPercent}
          onChange={(e) => setBeautyPercent(Number(e.target.value))}
          className="mt-1 w-full h-1.5 rounded-full appearance-none bg-emerald-200 dark:bg-emerald-800 accent-emerald-600"
        />
        <div className="mt-1 flex justify-between text-[9px] text-text-tertiary dark:text-gray-500">
          <span>5%</span>
          <span>25%</span>
        </div>
      </div>

      {/* Monthly budget display */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-800">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{monthlyIncomeLabel}</p>
          <p className="text-sm font-bold text-text-primary dark:text-gray-100">
            {monthlyIncome.toLocaleString('ar-SA')} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-950">
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{beautyBudgetLabel}</p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {beautyBudget.toLocaleString('ar-SA')} {currencySuffix}
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mt-3 space-y-1.5">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          {breakdownTitle}
        </p>
        {CATEGORIES.map((cat) => {
          const amount = Math.round(beautyBudget * (cat.percentage / 100));
          return (
            <div key={cat.name.ar} className="flex items-center gap-2">
              <span className="text-xs w-5 text-center" aria-hidden="true">
                {cat.emoji}
              </span>
              <span className="text-[10px] text-text-secondary dark:text-gray-300 w-24 truncate">
                {cat.name[locale]}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r', cat.color)}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-text-primary dark:text-gray-100 w-16 text-right">
                {amount} {currencySuffix}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <p className="mt-3 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {tipPrefix}
        {beautyPercent}
        {tipSuffix}
      </p>
    </div>
  );
}
