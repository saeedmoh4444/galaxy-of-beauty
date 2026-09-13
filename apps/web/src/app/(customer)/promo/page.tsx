'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, ErrorAlert, Button, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function PromoPage(): JSX.Element {
  const { t } = useLocale();
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const utils = api.useUtils();

  const handleValidate = async () => {
    setError('');
    setResult(null);
    if (!code || !amount) {
      setError(t('promo.err.required'));
      return;
    }
    try {
      const r = await utils.promo.validate.fetch({
        code: code.toUpperCase(),
        orderAmount: Number(amount),
      });
      setResult(r as Record<string, unknown>);
    } catch {
      setError(t('promo.err.invalid'));
    }
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('promo.title')}
        </h1>

        <Card padding="md">
          <div className="space-y-4">
            <Input
              label={t('promo.codeLabel')}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('promo.codePlaceholder')}
            />
            <Input
              label={t('promo.amountLabel')}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="200"
            />
            <Button onClick={handleValidate} className="w-full">
              {t('promo.check')}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </Card>

        {result && result.valid ? (
          <Card
            padding="md"
            className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('promo.field.code')}</span>
                <span className="font-bold">{result.code as string}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('promo.field.type')}</span>
                <span>
                  {result.discountType === 'percent'
                    ? t('promo.discountPercent')
                    : t('promo.discountFixed')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('promo.field.value')}</span>
                <span className="font-bold text-green-700">
                  {result.discountValue as number}
                  {result.discountType === 'percent' ? '%' : ` ${t('promo.currency')}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('promo.field.discount')}</span>
                <span className="font-bold text-green-700">
                  -{Number(result.discountAmount).toFixed(2)} {t('promo.currency')}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">{t('promo.field.total')}</span>
                <span className="text-lg font-bold text-green-700">
                  {Number(result.finalAmount).toFixed(2)} {t('promo.currency')}
                </span>
              </div>
            </div>
          </Card>
        ) : result && !result.valid ? (
          <ErrorAlert message={t('promo.err.invalid')} />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
