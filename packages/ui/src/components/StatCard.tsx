'use client';

import type { ReactNode } from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: { direction: 'up' | 'down'; value: string };
  className?: string;
}

/**
 * Standardised stat/metric card for dashboards.
 * Replaces ad-hoc `Card className="text-center"` patterns across all dashboards.
 */
export function StatCard({ label, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <Card
      padding="md"
      className={`text-center ${className}`}
      aria-label={`${label}: ${typeof value === 'string' ? value : ''}`}
    >
      {icon && (
        <div className="mb-2 inline-flex rounded-full bg-brand-50 p-2 dark:bg-brand-950">
          <span className="text-xl" aria-hidden="true">{icon}</span>
        </div>
      )}
      <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {trend && (
        <p
          className={`mt-1 text-xs font-medium ${
            trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </Card>
  );
}
