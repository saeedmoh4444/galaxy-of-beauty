'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import {
  Card,
  CardListSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Input,
  formatCurrency,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function GiftCardsPage(): JSX.Element {
  const { t } = useLocale();
  const { addToast } = useToast();
  const [tab, setTab] = useState<'my' | 'buy' | 'check'>('my');
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [checkCode, setCheckCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');

  const myCardsQ = api.giftCards.myCards.useQuery();
  const buyMut = api.giftCards.purchase.useMutation({
    onSuccess: () => {
      addToast('success', t('giftCards.purchaseSuccess'));
      myCardsQ.refetch();
      setAmount('');
      setRecipientEmail('');
      setRecipientName('');
      setGiftMessage('');
    },
  });
  const redeemMut = api.giftCards.redeem.useMutation({
    onSuccess: () => {
      addToast('success', t('giftCards.redeemSuccess'));
      myCardsQ.refetch();
      setRedeemCode('');
      setRedeemAmount('');
    },
  });

  const [checkResult, setCheckResult] = useState<RouterOutputs['giftCards']['checkBalance'] | null>(
    null,
  );
  const [checkError, setCheckError] = useState('');

  const handleCheckBalance = async () => {
    setCheckError('');
    setCheckResult(null);
    if (!checkCode) {
      setCheckError(t('giftCards.enterCodeError'));
      return;
    }
    try {
      const utils = api.useUtils();
      const r = await utils.giftCards.checkBalance.fetch({ code: checkCode });
      setCheckResult(r);
    } catch (e: unknown) {
      setCheckError(e instanceof Error ? e.message : t('giftCards.invalidCard'));
    }
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('giftCards.title')}
        </h1>

        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'my', label: t('giftCards.tabMy') },
            { key: 'buy', label: t('giftCards.tabBuy') },
            { key: 'check', label: t('giftCards.tabCheck') },
          ].map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key as typeof tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === tabItem.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'my' &&
          (myCardsQ.isLoading ? (
            <CardListSkeleton count={4} />
          ) : myCardsQ.isError ? (
            <ErrorAlert message={t('giftCards.loadError')} onRetry={() => myCardsQ.refetch()} />
          ) : !myCardsQ.data || myCardsQ.data.length === 0 ? (
            <EmptyState title={t('giftCards.emptyTitle')} description={t('giftCards.emptyDesc')} />
          ) : (
            <div className="space-y-3">
              {myCardsQ.data.map((card) => (
                <Card key={card.id} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-brand-600">{card.code}</p>
                      <p className="text-sm text-text-secondary">
                        {t('giftCards.balanceLabel')} {formatCurrency(Number(card.balance))} /{' '}
                        {formatCurrency(Number(card.amount))}
                      </p>
                      {card.recipientName && (
                        <p className="text-xs text-text-tertiary">
                          {t('giftCards.forRecipient')} {card.recipientName}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${card.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-surface-muted text-text-secondary'}`}
                    >
                      {card.status === 'ACTIVE' ? t('giftCards.active') : t('giftCards.used')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ))}

        {tab === 'buy' && (
          <Card padding="lg">
            <h3 className="mb-4 text-lg font-semibold">{t('giftCards.buyTitle')}</h3>
            <div className="space-y-4">
              <Input
                label={t('giftCards.amountLabel')}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                hint={t('giftCards.amountHint')}
              />
              <Input
                label={t('giftCards.recipientEmailLabel')}
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
              />
              <Input
                label={t('giftCards.recipientNameLabel')}
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder={t('giftCards.recipientNamePlaceholder')}
              />
              <div>
                <label
                  htmlFor="gc-message"
                  className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
                >
                  {t('giftCards.giftMessageLabel')}
                </label>
                <textarea
                  id="gc-message"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  rows={3}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder={t('giftCards.giftMessagePlaceholder')}
                />
              </div>
              <Button
                onClick={() => {
                  const a = Number(amount);
                  if (a < 50) {
                    addToast('warning', t('giftCards.minAmount'));
                    return;
                  }
                  buyMut.mutate({
                    amount: a,
                    recipientEmail: recipientEmail || undefined,
                    recipientName: recipientName || undefined,
                    message: giftMessage || undefined,
                  });
                }}
                loading={buyMut.isPending}
                className="w-full"
              >
                {t('giftCards.buyTitle')}
              </Button>
            </div>
          </Card>
        )}

        {tab === 'check' && (
          <Card padding="lg">
            <h3 className="mb-4 text-lg font-semibold">{t('giftCards.checkTitle')}</h3>
            <div className="space-y-4">
              <Input
                label={t('giftCards.cardCodeLabel')}
                value={checkCode}
                onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                placeholder="GIFT-XXXX-XXXX"
              />
              <Button onClick={handleCheckBalance} className="w-full">
                {t('giftCards.check')}
              </Button>
              {checkError && <p className="text-sm text-red-600">{checkError}</p>}
              {checkResult && (
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                  <p className="font-mono font-bold text-green-800 dark:text-green-200">
                    {checkResult.code}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {t('giftCards.remainingBalance')} {formatCurrency(Number(checkResult.balance))}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {t('giftCards.originalValue')}{' '}
                    {formatCurrency(Number(checkResult.originalAmount))}
                  </p>
                  {checkResult.recipientName && (
                    <p className="text-xs text-green-600">
                      {t('giftCards.forRecipient')} {checkResult.recipientName}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Redeem */}
        <Card padding="md">
          <h3 className="mb-3 text-sm font-semibold">{t('giftCards.redeemTitle')}</h3>
          <div className="flex gap-3">
            <Input
              placeholder="GIFT-XXXX-XXXX"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder={t('giftCards.amountPlaceholder')}
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              className="w-28"
            />
            <Button
              onClick={() => {
                const a = Number(redeemAmount);
                if (!redeemCode || !a) {
                  addToast('warning', t('giftCards.enterCodeAndAmount'));
                  return;
                }
                redeemMut.mutate({ code: redeemCode, amount: a });
              }}
              loading={redeemMut.isPending}
            >
              {t('giftCards.redeem')}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
