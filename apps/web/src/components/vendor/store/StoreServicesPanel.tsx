'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { Button, Input, Card, formatCurrency } from '@galaxy/ui';
import { api } from '@/lib/trpc';
import { useLocale } from '@/components/LocaleProvider';

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'text-amber-600',
  ACCEPTED: 'text-blue-600',
  IN_PROGRESS: 'text-blue-600',
  COMPLETED: 'text-green-600',
  CANCELLED: 'text-text-secondary',
  REJECTED: 'text-red-600',
  NO_SHOW: 'text-red-600',
  PAYMENT_AUTHORIZED: 'text-purple-600',
};

/** C5 — a portal service row (toPortalService shape from the API). */
type ServiceRow = {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  basePrice: number;
  durationMin: number;
  imageUrl: string | null;
  active: boolean;
  categoryId: number;
};

/** C5 — hybrid store-services portal panel: the bookable services editor,
 *  the availability slot publisher, and the store's bookings list. */
export function StoreServicesPanel(): JSX.Element {
  const { t, locale } = useLocale();
  const servicesQ = api.vendorPortal.services.useQuery({});
  const slotsQ = api.vendorPortal.serviceSlots.useQuery({ days: 7 });
  const bookingsQ = api.vendorPortal.storeBookings.useQuery({});

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [durationMin, setDurationMin] = useState('60');
  const [imageUrl, setImageUrl] = useState('');
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitleAr('');
    setTitleEn('');
    setBasePrice('');
    setDurationMin('60');
    setImageUrl('');
  };

  const addMut = api.vendorPortal.addService.useMutation({
    onSuccess: () => {
      resetForm();
      void servicesQ.refetch();
    },
  });
  const updateMut = api.vendorPortal.updateService.useMutation({
    onSuccess: () => {
      resetForm();
      void servicesQ.refetch();
    },
  });
  const deactivateMut = api.vendorPortal.deactivateService.useMutation({
    onSuccess: () => void servicesQ.refetch(),
  });
  const slotMut = api.vendorPortal.addAvailabilitySlot.useMutation({
    onSuccess: () => {
      setSlotStart('');
      setSlotEnd('');
      void slotsQ.refetch();
    },
  });
  const bookingActionMut = api.vendorPortal.updateServiceBooking.useMutation({
    onSuccess: () => void bookingsQ.refetch(),
  });

  type BookingAction = 'accept' | 'reject' | 'cancel' | 'start' | 'complete' | 'no_show';
  const bookingAction = (id: number, action: BookingAction) => {
    bookingActionMut.mutate({ id, action });
  };

  const startEdit = (s: ServiceRow) => {
    setEditingId(s.id);
    setTitleAr(s.titleAr);
    setTitleEn(s.titleEn);
    setBasePrice(String(s.basePrice));
    setDurationMin(String(s.durationMin));
    setImageUrl(s.imageUrl ?? '');
    setShowForm(true);
  };

  const submit = () => {
    const price = Number(basePrice);
    const duration = Number(durationMin);
    if (
      titleAr.trim() === '' ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(duration)
    ) {
      return;
    }
    const payload = {
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim() || undefined,
      basePrice: price,
      durationMin: Math.round(duration),
      imageUrl: imageUrl.trim() || undefined,
    };
    if (editingId !== null) {
      updateMut.mutate({ id: editingId, ...payload });
    } else {
      addMut.mutate(payload);
    }
  };

  const slotValid =
    slotStart !== '' &&
    slotEnd !== '' &&
    new Date(slotEnd).getTime() > new Date(slotStart).getTime();

  const services = servicesQ.data?.items ?? [];
  const slots = slotsQ.data ?? [];
  const bookings = bookingsQ.data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* ── Services editor ─────────────────────────────────────────── */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('vendorPortal.services.title')}</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? '×' : `+ ${t('vendorPortal.services.add')}`}
          </Button>
        </div>

        {showForm ? (
          <div className="space-y-2 rounded-lg bg-surface-muted p-3">
            <Input
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={t('vendorPortal.services.nameAr')}
            />
            <Input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder={t('vendorPortal.services.nameEn')}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder={t('vendorPortal.services.price')}
                className="flex-1"
              />
              <Input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                placeholder={t('vendorPortal.services.duration')}
                className="flex-1"
              />
            </div>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t('vendorPortal.services.image')}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={submit} disabled={addMut.isPending || updateMut.isPending}>
                {t('button.save')}
              </Button>
              <Button size="sm" variant="ghost" onClick={resetForm}>
                {t('button.cancel')}
              </Button>
            </div>
          </div>
        ) : null}

        {services.length === 0 && !showForm ? (
          <p className="text-sm text-text-secondary">{t('vendorPortal.services.empty')}</p>
        ) : (
          <div className="space-y-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border-muted p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {locale === 'ar' ? s.titleAr : s.titleEn || s.titleAr}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatCurrency(s.basePrice)} · {s.durationMin}{' '}
                    {t('vendorPortal.services.minutes')}
                    {!s.active ? ` · ${t('vendorPortal.services.inactive')}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                    {t('vendorPortal.services.edit')}
                  </Button>
                  {s.active ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={deactivateMut.isPending}
                      onClick={() => deactivateMut.mutate({ id: s.id })}
                    >
                      {t('vendorPortal.services.deactivate')}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Availability slots ──────────────────────────────────────── */}
      <Card padding="md" className="space-y-3">
        <h2 className="text-lg font-bold">{t('vendorPortal.services.slots.title')}</h2>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            type="datetime-local"
            value={slotStart}
            onChange={(e) => setSlotStart(e.target.value)}
            aria-label={t('vendorPortal.services.slots.start')}
          />
          <Input
            type="datetime-local"
            value={slotEnd}
            onChange={(e) => setSlotEnd(e.target.value)}
            aria-label={t('vendorPortal.services.slots.end')}
          />
          <Button
            size="sm"
            disabled={!slotValid || slotMut.isPending}
            onClick={() =>
              slotMut.mutate({
                startAt: new Date(slotStart).toISOString(),
                endAt: new Date(slotEnd).toISOString(),
              })
            }
          >
            + {t('vendorPortal.services.slots.add')}
          </Button>
        </div>
        {slots.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('vendorPortal.services.slots.empty')}</p>
        ) : (
          <div className="space-y-1">
            {slots.map((sl) => (
              <div
                key={sl.id}
                className="flex items-center justify-between rounded-lg border border-border-muted px-3 py-2 text-sm"
              >
                <span>
                  {new Date(sl.startAt).toLocaleString(locale)} →{' '}
                  {new Date(sl.endAt).toLocaleString(locale)}
                </span>
                <span className={sl.isBooked ? 'text-amber-600' : 'text-green-600'}>
                  {sl.isBooked
                    ? t('vendorPortal.services.slots.booked')
                    : t('vendorPortal.services.slots.free')}
                  {sl.isBooked && sl.serviceTitleAr
                    ? ` · ${locale === 'ar' ? sl.serviceTitleAr : (sl.serviceTitleEn ?? sl.serviceTitleAr)}`
                    : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Bookings list ───────────────────────────────────────────── */}
      <Card padding="md" className="space-y-3">
        <h2 className="text-lg font-bold">{t('vendorPortal.services.bookings.title')}</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('vendorPortal.services.bookings.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-secondary">
                  <th className="pb-2 font-medium">{t('vendorPortal.services.bookings.code')}</th>
                  <th className="pb-2 font-medium">{t('vendorPortal.services.title')}</th>
                  <th className="pb-2 font-medium">
                    {t('vendorPortal.services.bookings.customer')}
                  </th>
                  <th className="pb-2 font-medium">{t('vendorPortal.services.bookings.status')}</th>
                  <th className="pb-2 font-medium">{t('vendorPortal.services.bookings.when')}</th>
                  <th className="pb-2 text-right font-medium">
                    {t('vendorPortal.services.price')}
                  </th>
                  <th className="pb-2 text-right font-medium">
                    {t('vendorPortal.services.bookings.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-border-muted">
                    <td className="py-2 font-mono text-xs">{b.bookingCode}</td>
                    <td className="py-2">
                      {locale === 'ar' ? b.serviceTitleAr : b.serviceTitleEn || b.serviceTitleAr}
                    </td>
                    <td className="py-2">{b.customerName}</td>
                    <td className={`py-2 font-semibold ${STATUS_COLORS[b.status] ?? ''}`}>
                      {b.status}
                    </td>
                    <td className="py-2">{new Date(b.startAt).toLocaleString(locale)}</td>
                    <td className="py-2 text-right">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-2">
                      <div className="flex justify-end gap-1">
                        {/* C5f — the SAME state machine as the engine. */}
                        {(b.status === 'REQUESTED' || b.status === 'ACCEPTED') && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={bookingActionMut.isPending}
                            onClick={() =>
                              bookingAction(b.id, b.status === 'REQUESTED' ? 'accept' : 'start')
                            }
                          >
                            {b.status === 'REQUESTED'
                              ? t('vendorPortal.services.bookings.accept')
                              : t('vendorPortal.services.bookings.start')}
                          </Button>
                        )}
                        {b.status === 'ACCEPTED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={bookingActionMut.isPending}
                            onClick={() => bookingAction(b.id, 'cancel')}
                          >
                            {t('vendorPortal.services.bookings.cancel')}
                          </Button>
                        )}
                        {b.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={bookingActionMut.isPending}
                            onClick={() => bookingAction(b.id, 'complete')}
                          >
                            {t('vendorPortal.services.bookings.complete')}
                          </Button>
                        )}
                        {b.status === 'REQUESTED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={bookingActionMut.isPending}
                            onClick={() => bookingAction(b.id, 'reject')}
                          >
                            {t('vendorPortal.services.bookings.reject')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
