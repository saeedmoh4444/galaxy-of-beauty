'use client';

import Link from 'next/link';
import { Card, EmptyState, Button, formatCurrency, ar } from '@galaxy/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export interface TechnicianProfileData {
  technician: AnyRecord | null;
  services: AnyRecord[];
}

export function TechnicianProfileClient({ data }: { data: TechnicianProfileData }): JSX.Element {
  const tech = data.technician;
  const services = data.services;

  if (!tech) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <EmptyState title="الفنية غير موجودة" description="لم يتم العثور على ملف الفنية المطلوب" />
        <Link href="/technicians" className="mt-4 inline-block text-brand-600 hover:underline">العودة للفنيات</Link>
      </div>
    );
  }

  const user = tech.user ?? {};
  const name = user.name ?? '';
  const rating = Number(tech.ratingAvg ?? 0);
  const completed = tech.completedBookings ?? 0;
  const city = tech.city ?? '';
  const area = tech.area ?? '';
  const bio = tech.bioJson ? ar(tech.bioJson) : '';
  const isEco = tech.isEcoFriendly ?? false;
  const galleryImages = tech.galleryImages ?? [];
  const kycStatus = tech.kycStatus ?? 'PENDING';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/technicians" className="text-sm text-brand-600 hover:underline">← العودة للفنيات</Link>

      <Card padding="lg" className="mt-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-accent-100 text-5xl dark:from-brand-900 dark:to-accent-900">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={name} className="h-full w-full rounded-full object-cover" /> : <span>👩‍🎨</span>}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{name}</h1>
              {kycStatus === 'VERIFIED' && <span className="text-green-500" title="موثقة">✅</span>}
              {isEco && <span className="text-green-500" title="منتجات صديقة للبيئة">🌿</span>}
            </div>
            <p className="text-gray-500">{city}{area ? `، ${area}` : ''}</p>
            <div className="mt-2 flex items-center justify-center gap-4 sm:justify-start">
              <span className="text-amber-500">⭐ {rating.toFixed(1)}</span>
              <span className="text-gray-400">{completed} حجز مكتمل</span>
            </div>
            {bio && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{bio}</p>}
          </div>
        </div>
      </Card>

      {/* Services */}
      <h2 className="mt-8 mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">الخدمات المقدمة</h2>
      {services.length === 0 ? (
        <EmptyState title="لا توجد خدمات" description="لم تقم الفنية بإضافة خدمات بعد" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s: AnyRecord) => {
            const svc = s.service ?? {};
            return (
              <Card key={s.id} padding="md">
                <h3 className="font-semibold">{ar(svc.titleJson)}</h3>
                <p className="text-sm text-gray-500">{svc.durationMin} دقيقة</p>
                <p className="mt-1 font-bold text-brand-600">{formatCurrency(Number(s.customPrice || svc.basePrice || 0))}</p>
                <Link href={`/bookings/create?serviceId=${svc.id}`} className="mt-3 block w-full">
                  <Button size="sm" className="w-full">احجزي</Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <>
          <h2 className="mt-8 mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">معرض الأعمال</h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galleryImages.slice(0, 8).map((img: AnyRecord, i: number) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden dark:bg-gray-800">
                {img.imageUrl ? (
                  <img src={img.imageUrl} alt={ar(img.captionJson)} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-2xl">🖼️</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
