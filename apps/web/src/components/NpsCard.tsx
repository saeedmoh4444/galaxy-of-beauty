'use client';
import { useState } from 'react';
import type { JSX } from 'react';

import { api } from '@/lib/trpc';
import { Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

/**
 * NPS post-booking survey card (quick win #6) — shown on COMPLETED
 * bookings. One response per booking (the API enforces it); the card
 * switches between rate / thanks / already-rated states.
 */
export function NpsCard({ bookingId }: { bookingId: number }): JSX.Element {
  const { t } = useLocale();
  const utils = api.useUtils();
  const mineQ = api.nps.mine.useQuery();
  const mine = (mineQ.data as { bookingId?: number; score?: number }[] | undefined) ?? [];
  const existing = mine.find((r) => r.bookingId === bookingId);

  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  const submitMut = api.nps.submit.useMutation({
    onSuccess: () => {
      setDone(true);
      void utils.nps.mine.invalidate();
    },
  });

  if (existing) {
    return (
      <Card padding="md" className="border-brand-200">
        <p className="text-center text-sm font-semibold text-green-600">
          {t('nps.already', { score: existing.score ?? 0 })}
        </p>
      </Card>
    );
  }
  if (done) {
    return (
      <Card padding="md" className="border-brand-200">
        <p className="text-center text-sm font-semibold text-green-600">{t('nps.thanks')}</p>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h3 className="mb-1 text-base font-bold text-brand-600">{t('nps.title')}</h3>
      <p className="mb-3 text-sm text-text-secondary">{t('nps.question')}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {Array.from({ length: 11 }, (_, i) => i).map((s) => (
          <button
            key={s}
            onClick={() => setScore(s)}
            className={`h-9 w-9 rounded-full border text-sm font-bold transition-colors ${
              score === s
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-edge text-text-secondary hover:bg-surface-muted'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('nps.comment-placeholder')}
        className="mb-3 w-full rounded-lg border border-edge bg-surface-elevated p-3 text-sm"
      />
      <button
        disabled={score === null || submitMut.isPending}
        onClick={() =>
          submitMut.mutate({ bookingId, score: score as number, comment: comment || undefined })
        }
        className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
      >
        {t('nps.submit')}
      </button>
    </Card>
  );
}
