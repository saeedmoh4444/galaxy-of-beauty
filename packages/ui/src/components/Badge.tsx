'use client';

/**
 * Badge — for status indicators, categories, tags.
 *
 * Usage:
 *   <Badge variant="success">مكتمل</Badge>
 *   <Badge variant="warning">قيد الانتظار</Badge>
 */

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps): JSX.Element {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
