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
      className="mb-4 flex items-center gap-1.5 text-sm text-text-tertiary"
    >
      <Link href="/" className="hover:text-brand-600 transition-colors">
        {t('nav.home')}
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <span className="text-text-tertiary">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-text-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
