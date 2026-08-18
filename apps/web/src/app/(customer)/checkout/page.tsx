'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function CheckoutPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: cart, isLoading } = api.marketplace.cart.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: wallet } = api.wallet.getBalance.useQuery() as {
    data: Record<string, unknown> | undefined;
  };
  const [method, setMethod] = useState<'wallet' | 'online'>('online');
  const [placed, setPlaced] = useState(false);
  const cartItems = cart ?? [];
  const subtotal = cartItems.reduce(
    (s: number, i: Record<string, unknown>) =>
      s + Number((i.product as Record<string, unknown>)?.price ?? 0) * (i.quantity as number),
    0,
  );
  const fee = subtotal > 0 ? 11 : 0;
  const total = subtotal + fee;
  const walletBalance = Number(wallet?.balance ?? 0);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('wallet.checkout')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('wallet.checkout-subtitle')}</p>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : cartItems.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2"></p>
            <p className="text-text-secondary">{t('wallet.empty-cart')}</p>
          </Card>
        ) : placed ? (
          <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50">
            <p className="text-3xl"></p>
            <p className="font-bold text-green-700 mt-2">{t('wallet.order-placed')}</p>
            <p className="text-sm text-text-secondary mt-1">{t('wallet.order-confirm-message')}</p>
          </Card>
        ) : (
          <>
            <Card padding="lg">
              <h3 className="font-bold mb-3">{t('wallet.order-summary')}</h3>
              <div className="space-y-2">
                {cartItems.map((item: Record<string, unknown>) => {
                  const p = item.product as Record<string, unknown>;
                  return (
                    <div key={item.id as number} className="flex justify-between text-sm">
                      <span>
                        {localize(p?.nameJson, locale)} ×{item.quantity as number}
                      </span>
                      <span>
                        {formatCurrency(Number(p?.price ?? 0) * (item.quantity as number))}
                      </span>
                    </div>
                  );
                })}
              </div>
              <hr className="my-3" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('wallet.subtotal')}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>{t('wallet.platform-fee')}</span>
                  <span>{formatCurrency(fee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('wallet.total')}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <h3 className="font-bold mb-3">{t('wallet.payment-method')}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setMethod('online')}
                  className={`w-full rounded-xl border-2 p-3 text-right ${method === 'online' ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}
                >
                  <span className="font-bold">{t('wallet.online-payment')}</span>
                  <p className="text-xs text-text-secondary">{t('wallet.card-brands')}</p>
                </button>
                <button
                  onClick={() => setMethod('wallet')}
                  className={`w-full rounded-xl border-2 p-3 text-right ${method === 'wallet' ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}
                  disabled={walletBalance < total}
                >
                  <span className="font-bold">{t('wallet.title')}</span>
                  <p className="text-xs text-text-secondary">
                    {t('wallet.your-balance', { balance: formatCurrency(walletBalance) })}{' '}
                    {walletBalance < total ? t('wallet.insufficient-balance') : ''}
                  </p>
                </button>
              </div>
            </Card>

            <Button onClick={() => setPlaced(true)} className="w-full" size="lg">
              {t('wallet.pay-now', { amount: formatCurrency(total) })}
            </Button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
