'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, Input } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function TwoFactorPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.auth.me.useQuery();
  const { t } = useLocale();

  const setupMut = api.auth.setup2FA.useMutation({
    onSuccess: () => refetch(),
  });
  const verifyMut = api.auth.verify2FA.useMutation({
    onSuccess: () => refetch(),
  });
  const disableMut = api.auth.disable2FA.useMutation({
    onSuccess: () => refetch(),
  });

  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const me = data as { twoFactorEnabled?: boolean } | undefined;
  const twoFactorEnabled = me?.twoFactorEnabled ?? false;

  // Setup result data (secret, otpauthUrl)
  const setupData = setupMut.data;

  const handleVerify = () => {
    if (verifyCode.length !== 6) {
      setVerifyError(t('auth.otp6-error'));
      return;
    }
    setVerifyError('');
    verifyMut.mutate({ token: verifyCode });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" padding="lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('auth.2fa-title')}
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">{t('auth.2fa-subtitle')}</p>

        {/* Loading */}
        {isLoading && <CardSkeleton />}

        {/* Error */}
        {isError && <ErrorAlert message={t('auth.2fa-load-error')} onRetry={() => refetch()} />}

        {/* Data */}
        {!isLoading && !isError && (
          <>
            {twoFactorEnabled ? (
              /* ── Already enabled ── */
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900"></div>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {t('auth.2fa-enabled')}
                </p>
                <p className="text-sm text-text-secondary">{t('auth.2fa-enabled-desc')}</p>

                {disableMut.isError && <ErrorAlert message={disableMut.error.message} />}
                {disableMut.isSuccess && (
                  <p className="text-sm text-green-600">{t('auth.2fa-disabled')}</p>
                )}

                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => disableMut.mutate({})}
                  loading={disableMut.isPending}
                >
                  {t('auth.2fa-disable')}
                </Button>
              </div>
            ) : /* ── Not set up ── */

            /* Step 1: Show setup button until clicked */
            !setupMut.isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl dark:bg-brand-900"></div>
                <p className="text-lg font-semibold">{t('auth.2fa-setup-title')}</p>
                <p className="text-sm text-text-secondary">{t('auth.2fa-setup-desc')}</p>

                {setupMut.isError && <ErrorAlert message={setupMut.error.message} />}

                <Button
                  className="w-full"
                  onClick={() => setupMut.mutate({})}
                  loading={setupMut.isPending}
                >
                  {t('auth.2fa-start-setup')}
                </Button>
              </div>
            ) : (
              /* Step 2: Show QR code placeholder + secret + verify input */
              <div className="space-y-4">
                <div className="rounded-lg bg-surface-muted p-4 text-center dark:bg-gray-800">
                  <p className="mb-2 text-sm font-medium text-text-primary dark:text-gray-300">
                    {t('auth.2fa-scan-qr')}
                  </p>
                  {/* QR Code placeholder */}
                  <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900">
                    <span className="text-xs text-text-tertiary">QR Code</span>
                  </div>
                </div>

                <div className="rounded-lg bg-surface-muted p-3 dark:bg-gray-800">
                  <p className="mb-1 text-xs font-medium text-text-secondary">
                    {t('auth.2fa-secret')}
                  </p>
                  <p
                    className="select-all font-mono text-sm text-gray-800 dark:text-gray-200"
                    dir="ltr"
                  >
                    {setupData?.secret as string}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">{t('auth.2fa-manual-entry')}</p>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <p className="mb-3 text-sm font-medium">{t('auth.2fa-verify-prompt')}</p>

                  {verifyMut.isError && (
                    <div className="mb-3">
                      <ErrorAlert message={verifyMut.error.message} />
                    </div>
                  )}
                  {verifyError && <p className="mb-2 text-sm text-red-600">{verifyError}</p>}
                  {verifyMut.isSuccess && (
                    <p className="mb-2 text-sm text-green-600">{t('auth.2fa-verify-success')}</p>
                  )}

                  <Input
                    label={t('auth.2fa-code-label')}
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) => {
                      setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setVerifyError('');
                    }}
                    maxLength={6}
                    disabled={verifyMut.isSuccess}
                  />
                  <Button
                    className="mt-3 w-full"
                    onClick={handleVerify}
                    loading={verifyMut.isPending}
                    disabled={verifyCode.length !== 6 || verifyMut.isSuccess}
                  >
                    {t('auth.2fa-confirm-enable')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
