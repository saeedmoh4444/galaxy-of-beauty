'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency, ErrorAlert, useToast, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';
import type { TranslationKey } from '@galaxy/shared';

const SPECIALTY_KEYS: Record<string, TranslationKey> = {
  yoga: 'trainers.specialty.yoga',
  pilates: 'trainers.specialty.pilates',
  strength: 'trainers.specialty.strength',
  aerobics: 'trainers.specialty.aerobics',
  zumba: 'trainers.specialty.zumba',
  general: 'trainers.specialty.general',
};

export interface TrainerDetailData {
  id: number;
  storeName: string;
  storeSlug: string;
  trainerSpecialty: string | null;
  trainerCity: string | null;
  trainerAddress: string | null;
  trainerBio: { ar?: string; en?: string } | null;
  trainerSessionPrice: number | string | null;
  descriptionJson: { ar?: string; en?: string } | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  ratingAvg: number | string | null;
  totalReviews: number;
  womenOnlyStaff?: boolean;
  privateSuite?: boolean;
}

export function TrainerClient({
  trainer,
  fetchError,
}: {
  trainer: TrainerDetailData | null;
  fetchError?: string;
}): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [isHomeVisit, setIsHomeVisit] = useState(false);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const myQ = api.trainers.mySessions.useQuery(undefined, { enabled: isAuthenticated });

  const bookMut = api.trainers.bookSession.useMutation({
    onSuccess: () => {
      addToast('success', t('trainers.book.booked'));
      setScheduledAt('');
      setNotes('');
      void myQ.refetch();
    },
  });
  const cancelMut = api.trainers.cancelSession.useMutation({
    onSuccess: () => {
      addToast('success', t('trainers.my.cancelled'));
      void myQ.refetch();
    },
  });

  if (fetchError) return <ErrorAlert message={fetchError} />;
  if (!trainer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ErrorAlert message={t('trainers.not-found')} />
      </div>
    );
  }

  const price = Number(trainer.trainerSessionPrice ?? 0);
  const specialtyKey =
    SPECIALTY_KEYS[trainer.trainerSpecialty ?? 'general'] ?? SPECIALTY_KEYS.general;
  const bio = trainer.trainerBio ? (localize(trainer.trainerBio, locale) ?? '') : '';
  const mySessions = (myQ.data as Array<{ id: number; scheduledAt: string; status: string }>) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card padding="lg">
        <h1 className="text-2xl font-bold text-text-primary">{trainer.storeName}</h1>
        <p className="mt-2 text-text-secondary">
          {t(specialtyKey)} · {trainer.trainerCity ?? '—'} · {t('misc.rating')}{' '}
          {Number(trainer.ratingAvg ?? 0).toFixed(1)} ({trainer.totalReviews})
        </p>
        {bio ? <p className="mt-4 whitespace-pre-line text-text-primary">{bio}</p> : null}
        {trainer.trainerAddress ? (
          <p className="mt-2 text-sm text-text-secondary">📍 {trainer.trainerAddress}</p>
        ) : null}
        <p className="mt-4 text-lg font-bold text-brand-600">
          {price > 0
            ? `${t('trainers.book.price')}: ${formatCurrency(price)}`
            : t('trainers.book.contact-pricing')}
        </p>

        {price > 0 ? (
          <div className="mt-6 space-y-3 border-t border-edge pt-6">
            <h2 className="text-lg font-bold">{t('trainers.book.title')}</h2>
            <label className="block text-sm font-medium text-text-secondary">
              {t('trainers.book.scheduledAt')}
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-edge bg-surface-muted px-3 py-2 text-text-primary"
              />
            </label>
            <label className="block text-sm font-medium text-text-secondary">
              {t('trainers.book.duration')}
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-edge bg-surface-muted px-3 py-2 text-text-primary"
              >
                {[30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>
                    {t('trainers.book.minutes', { count: m })}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={isHomeVisit}
                onChange={(e) => setIsHomeVisit(e.target.checked)}
              />
              {t('trainers.book.homeVisit')}
            </label>
            {isHomeVisit ? (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('trainers.book.address')}
                className="w-full rounded-lg border border-edge bg-surface-muted px-3 py-2 text-text-primary"
              />
            ) : null}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('trainers.book.notes')}
              className="w-full rounded-lg border border-edge bg-surface-muted px-3 py-2 text-text-primary"
              rows={2}
            />
            <Button
              disabled={!isAuthenticated || !scheduledAt || bookMut.isPending}
              onClick={() =>
                bookMut.mutate({
                  trainerId: trainer.id,
                  scheduledAt,
                  durationMin,
                  isHomeVisit,
                  address,
                  notes,
                })
              }
            >
              {isAuthenticated ? t('trainers.book.submit') : t('auth.login')}
            </Button>
          </div>
        ) : null}

        {isAuthenticated && mySessions.length > 0 ? (
          <div className="mt-8 border-t border-edge pt-6">
            <h2 className="text-lg font-bold">{t('trainers.my.title')}</h2>
            <div className="mt-3 space-y-2">
              {mySessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
                >
                  <span className="text-sm text-text-primary">
                    {new Date(s.scheduledAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')} ·{' '}
                    {s.status}
                  </span>
                  {(s.status === 'REQUESTED' || s.status === 'CONFIRMED') && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => cancelMut.mutate({ sessionId: s.id })}
                    >
                      {t('trainers.my.cancel')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
