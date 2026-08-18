import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared';
import { getServerLocale } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: `404 - ${t('error.page-not-found', locale)} | ${t('common.brandName', locale)}`,
  };
}

export default async function NotFound(): Promise<JSX.Element> {
  const locale = await getServerLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-gray-950">
      <Image
        src="/logo.png"
        alt={t('common.brandName', locale)}
        width={80}
        height={80}
        className="mb-8 h-20 w-20 rounded-2xl object-cover shadow-lg opacity-60"
      />
      <div className="mb-4 text-7xl"></div>
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
        {t('error.not-found-code', locale)}
      </h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
        {t('error.not-found-title', locale)}
      </p>
      <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
        {t('error.not-found-hint', locale)}
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t('common.back-home', locale)}
        </Link>
        <Link
          href="/services"
          className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {t('common.browse-services', locale)}
        </Link>
      </div>
    </div>
  );
}
