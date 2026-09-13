'use client';

import { useId, useRef, useState } from 'react';

/**
 * Tabs — horizontal tab navigation (WAI-ARIA tabs pattern).
 *
 * Phase 3 sprint 3: upgraded from a bare pill row to a proper tablist —
 * role=tablist/tab + aria-selected, roving tabindex, RTL-aware arrow-key
 * navigation, Home/End, focus-visible ring, reduced-motion aware.
 *
 * Usage:
 *   <Tabs tabs={['الكل', 'مكتمل']} active="الكل" onChange={(t) => setFilter(t)} />
 *
 * Panels: render the panel elements with id `${idPrefix}-panel-${index}`
 * (same idPrefix as the Tabs) and role="tabpanel" to complete the pattern.
 */

interface TabsProps {
  tabs: string[];
  active?: string;
  onChange: (tab: string) => void;
  className?: string;
  /** Accessible name for the tablist (defaults to "Tabs"). */
  tabListLabel?: string;
  /** Stable prefix for generated tab/panel ids. */
  idPrefix?: string;
}

export function Tabs({
  tabs,
  active,
  onChange,
  className = '',
  tabListLabel = 'Tabs',
  idPrefix,
}: TabsProps): JSX.Element {
  const [selected, setSelected] = useState(active ?? tabs[0]);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const prefix = idPrefix ?? `tabs-${uid}`;
  const current = active ?? selected;

  const activate = (index: number) => {
    const tab = tabs[index] ?? '';
    setSelected(tab);
    onChange(tab);
    // Roving tabindex — move focus to the newly activated tab.
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const isRtl = e.currentTarget.closest('[dir="rtl"]') !== null || document.dir === 'rtl';
    const forward = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = isRtl ? 'ArrowRight' : 'ArrowLeft';
    let next: number | null = null;
    if (e.key === forward) next = (index + 1) % tabs.length;
    else if (e.key === backward) next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next !== null) {
      e.preventDefault();
      activate(next);
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={tabListLabel}
      className={`flex gap-1 overflow-x-auto ${className}`}
    >
      {tabs.map((tab, i) => {
        const isActive = current === tab;
        return (
          <button
            key={tab}
            role="tab"
            id={`${prefix}-tab-${i}`}
            aria-selected={isActive}
            aria-controls={`${prefix}-panel-${i}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              setSelected(tab);
              onChange(tab);
            }}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-surface-muted text-text-secondary hover:bg-surface-muted dark:text-text-tertiary dark:hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
