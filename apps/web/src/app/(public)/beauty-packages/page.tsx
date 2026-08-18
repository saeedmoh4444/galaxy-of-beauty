import Link from 'next/link';
import Image from 'next/image';
import { t, localize } from '@galaxy/shared';
import { getServerCaller } from '@/lib/server-trpc';
import { getServerLocale } from '@/lib/i18n';

interface BeautyPackageItem {
  id: number;
  nameJson: Record<string, string>;
  descriptionJson: Record<string, string> | null;
  imageUrl: string | null;
  discountPercent: number;
  isActive: boolean;
  services: Array<{ id: number; serviceId: number }>;
}

export default async function BeautyPackagesPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  let packages: BeautyPackageItem[] = [];
  try {
    const caller = await getServerCaller();
    packages = (await caller.beautyPackages.list()) as BeautyPackageItem[];
  } catch {
    /* empty */
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('marketing.beauty-packages.title', locale)}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {t('marketing.beauty-packages.subtitle', locale)}
        </p>
      </div>
      {packages.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <span className="text-5xl"></span>
          <p className="mt-4">{t('marketing.beauty-packages.no-packages', locale)}</p>
          <Link href="/services" className="mt-4 inline-block text-brand-600 hover:underline">
            {t('marketing.beauty-packages.browse-services', locale)}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const name = localize(pkg.nameJson, locale);
            const desc = localize(pkg.descriptionJson, locale);
            const services = pkg.services;
            return (
              <div
                key={pkg.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-brand-200 to-accent-200 text-5xl dark:from-brand-900 dark:to-accent-900">
                  {pkg.imageUrl ? (
                    <Image src={pkg.imageUrl} alt={name} fill className="object-cover" />
                  ) : (
                    <span></span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{name}</h2>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                      -{pkg.discountPercent}%
                    </span>
                  </div>
                  {desc && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{desc}</p>}
                  <div className="mt-3 space-y-1">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span></span>
                        {/* serviceId is the foreign key — service title not joined */}
                        <span>
                          {t('marketing.beauty-packages.service-id', locale, { id: s.serviceId })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/bookings/create"
                    className="mt-4 block w-full rounded-lg bg-brand-600 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                  >
                    {t('marketing.beauty-packages.book-package', locale)}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
