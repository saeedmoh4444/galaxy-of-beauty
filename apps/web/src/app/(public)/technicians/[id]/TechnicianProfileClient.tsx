'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { RouterOutputs } from '@galaxy/api';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Card, EmptyState, Button, formatCurrency } from '@galaxy/ui';

export type TechnicianProfileItem = RouterOutputs['technicians']['getById'] & {
  galleryImages?: Array<{ imageUrl?: string; captionJson?: { ar?: string } }>;
};
export type TechnicianServiceItem = RouterOutputs['technicians']['getServices'][number];

export interface TechnicianProfileData {
  technician: TechnicianProfileItem | null;
  services: TechnicianServiceItem[];
}

export function TechnicianProfileClient({ data }: { data: TechnicianProfileData }): JSX.Element {
  const { t, locale } = useLocale();
  const tech = data.technician;
  const services = data.services;

  if (!tech) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <EmptyState
          title={t('marketing.technician-profile.not-found')}
          description={t('marketing.technician-profile.not-found-desc')}
        />
        <Link href="/technicians" className="mt-4 inline-block text-brand-600 hover:underline">
          {t('marketing.technician-profile.back-to-technicians')}
        </Link>
      </div>
    );
  }

  const user = tech.user ?? ({} as typeof tech.user);
  const name = user.name ?? '';
  const rating = Number(tech.ratingAvg ?? 0);
  const completed = tech.completedBookings ?? 0;
  const city = tech.city ?? '';
  const area = tech.area ?? '';
  const bio = tech.bioJson ? localize(tech.bioJson, locale) : '';
  const isEco = tech.isEcoFriendly ?? false;
  const galleryImages = tech.galleryImages ?? [];
  const kycStatus = tech.kycStatus ?? 'PENDING';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/technicians" className="text-sm text-brand-600 hover:underline">
        {t('marketing.technician-profile.back-to-technicians-arrow')}
      </Link>

      <Card padding="lg" className="mt-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-accent-100 text-5xl dark:from-brand-900 dark:to-accent-900">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={name} fill className="rounded-full object-cover" />
            ) : (
              <span>‍</span>
            )}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{name}</h1>
              {kycStatus === 'VERIFIED' && (
                <span
                  className="text-green-500"
                  title={t('marketing.technician-profile.verified')}
                ></span>
              )}
              {isEco && (
                <span
                  className="text-green-500"
                  title={t('marketing.technician-profile.eco-friendly')}
                ></span>
              )}
            </div>
            <p className="text-gray-500">
              {city}
              {area ? `${locale === 'ar' ? '، ' : ', '}${area}` : ''}
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 sm:justify-start">
              <span className="text-amber-500"> {rating.toFixed(1)}</span>
              <span className="text-gray-400">
                {t('marketing.technician-profile.completed-bookings', { count: completed })}
              </span>
            </div>
            {bio && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{bio}</p>}
          </div>
        </div>
      </Card>

      {/* Services */}
      <h2 className="mt-8 mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        {t('marketing.technician-profile.services')}
      </h2>
      {services.length === 0 ? (
        <EmptyState
          title={t('marketing.technician-profile.no-services')}
          description={t('marketing.technician-profile.no-services-desc')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const svc = s.service ?? ({} as typeof s.service);
            return (
              <Card key={s.id} padding="md">
                <h3 className="font-semibold">{localize(svc.titleJson, locale)}</h3>
                <p className="text-sm text-gray-500">
                  {t('marketing.technician-profile.duration-min', { min: svc.durationMin })}
                </p>
                <p className="mt-1 font-bold text-brand-600">
                  {formatCurrency(Number(s.customPrice || svc.basePrice || 0))}
                </p>
                <Link href={`/bookings/create?serviceId=${svc.id}`} className="mt-3 block w-full">
                  <Button size="sm" className="w-full">
                    {t('marketing.technician-profile.book-now')}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <>
          <h2 className="mt-8 mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
            {t('marketing.technician-profile.gallery-title')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.slice(0, 8).map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden dark:bg-gray-800"
              >
                {img.imageUrl ? (
                  <Image
                    src={img.imageUrl}
                    alt={localize(img.captionJson, locale)}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl">️</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
