'use client';

import { useState } from 'react';

/**
 * Tabs — horizontal tab navigation.
 *
 * Usage:
 *   <Tabs tabs={['الكل', 'مكتمل', 'ملغي']} active="الكل" onChange={(t) => setFilter(t)} />
 */

interface TabsProps {
  tabs: string[];
  active?: string;
  onChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = '' }: TabsProps): JSX.Element {
  const [selected, setSelected] = useState(active ?? tabs[0]);

  return (
    <div className={`flex gap-1 overflow-x-auto ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => { setSelected(tab); onChange(tab); }}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            (active ?? selected) === tab
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
