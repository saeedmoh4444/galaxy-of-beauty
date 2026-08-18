'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function BeautyWishlistGiftsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: registries, isLoading } = api.giftRegistry.myRegistries.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const createMut = api.giftRegistry.create.useMutation();
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState('birthday');
  const [targetAmount, setTarget] = useState(500);
  const [showForm, setShowForm] = useState(false);
  const [created, setCreated] = useState(false);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('wishlistGifts.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('wishlistGifts.subtitle')}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? '' : t('wishlistGifts.addNew')}
          </Button>
        </div>

        {showForm && (
          <Card padding="lg">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('wishlistGifts.namePlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm mb-3 dark:border-gray-700 dark:bg-gray-800"
            />
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm mb-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="wedding">{t('wishlistGifts.occasion.wedding')}</option>
              <option value="birthday">{t('wishlistGifts.occasion.birthday')}</option>
              <option value="baby_shower">{t('wishlistGifts.occasion.babyShower')}</option>
              <option value="other">{t('wishlistGifts.occasion.other')}</option>
            </select>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTarget(Number(e.target.value))}
              placeholder={t('wishlistGifts.targetPlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm mb-3 dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() => {
                if (title.trim())
                  createMut.mutate(
                    {
                      title: title.trim(),
                      occasion: occasion as 'birthday',
                      targetAmount,
                      serviceIds: [],
                    },
                    {
                      onSuccess: () => {
                        setShowForm(false);
                        setCreated(true);
                        setTitle('');
                      },
                    },
                  );
              }}
              loading={createMut.isPending}
              className="w-full"
            >
              {t('wishlistGifts.create')}
            </Button>
          </Card>
        )}

        {created && (
          <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50">
            <p className="text-2xl"></p>
            <p className="font-bold text-green-700 mt-2">{t('wishlistGifts.created')}</p>
          </Card>
        )}

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : !(registries ?? []).length ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('wishlistGifts.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {(registries ?? []).map((r: Record<string, unknown>) => (
              <Card key={r.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{r.title as string}</p>
                    <p className="text-xs text-text-secondary">
                      {r.occasion as string} ·{' '}
                      {new Date(r.createdAt as string).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">
                      {formatCurrency(r.raisedAmount as number)} /{' '}
                      {formatCurrency(r.targetAmount as number)}
                    </p>
                    <div className="h-2 bg-surface-muted rounded-full mt-1 w-32">
                      <div
                        className="h-2 bg-brand-600 rounded-full"
                        style={{
                          width: `${Math.min(100, ((r.raisedAmount as number) / (r.targetAmount as number)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
