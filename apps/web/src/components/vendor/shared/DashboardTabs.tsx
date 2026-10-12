'use client';
import type { JSX } from 'react';

export interface DashboardTab {
  key: string;
  label: string;
}

/**
 * A3 — tab bar for the vendor dashboards (WAI-ARIA tablist semantics;
 * axe gate checks aria-selected/aria-controls wiring).
 */
export function DashboardTabs({
  tabs,
  active,
  onSelect,
  label,
}: {
  tabs: DashboardTab[];
  active: string;
  onSelect: (key: string) => void;
  label: string;
}): JSX.Element {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 overflow-x-auto border-b border-edge"
    >
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`vendor-tab-${tab.key}`}
            data-testid={`vendor-tab-${tab.key}`}
            aria-selected={selected}
            aria-controls={`vendor-panel-${tab.key}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(tab.key)}
            className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              selected
                ? 'border-b-2 border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
