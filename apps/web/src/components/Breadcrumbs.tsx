'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }): JSX.Element {
  const { t } = useLocale();
  return (
    <nav
      aria-label={t('common.breadcrumb-nav')}
      className="mb-4 flex items-center gap-1.5 text-sm text-gray-400"
    >
      <Link href="/" className="hover:text-brand-600 transition-colors">
        {t('nav.home')}
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <span className="text-gray-300 dark:text-gray-600">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
