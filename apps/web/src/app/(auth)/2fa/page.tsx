'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, Input } from '@galaxy/shared';

export default function TwoFactorPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.auth.me.useQuery({} as never);

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

  const me = data as unknown as Record<string, unknown>;
  const twoFactorEnabled = (me?.twoFactorEnabled as boolean) ?? false;

  // Setup result data (secret, otpauthUrl)
  const setupData = setupMut.data as unknown as Record<string, unknown> | undefined;

  const handleVerify = () => {
    if (verifyCode.length !== 6) {
      setVerifyError('يرجى إدخال رمز مكون من 6 أرقام');
      return;
    }
    setVerifyError('');
    verifyMut.mutate({ token: verifyCode });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" padding="lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          المصادقة الثنائية
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          أضف طبقة أمان إضافية لحسابك
        </p>

        {/* Loading */}
        {isLoading && <CardSkeleton />}

        {/* Error */}
        {isError && (
          <ErrorAlert message="فشل تحميل معلومات المستخدم" onRetry={() => refetch()} />
        )}

        {/* Data */}
        {!isLoading && !isError && (
          <>
            {twoFactorEnabled ? (
              /* ── Already enabled ── */
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900">
                  ✅
                </div>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  المصادقة الثنائية مفعلة
                </p>
                <p className="text-sm text-gray-500">
                  حسابك محمي بالمصادقة الثنائية. سيُطلب منك رمز التحقق عند تسجيل الدخول.
                </p>

                {disableMut.isError && (
                  <ErrorAlert message={disableMut.error.message} />
                )}
                {disableMut.isSuccess && (
                  <p className="text-sm text-green-600">تم تعطيل المصادقة الثنائية</p>
                )}

                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => disableMut.mutate({} as never)}
                  loading={disableMut.isPending}
                >
                  تعطيل المصادقة الثنائية
                </Button>
              </div>
            ) : (
              /* ── Not set up ── */

              /* Step 1: Show setup button until clicked */
              !setupMut.isSuccess ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl dark:bg-brand-900">
                    🔐
                  </div>
                  <p className="text-lg font-semibold">إعداد المصادقة الثنائية</p>
                  <p className="text-sm text-gray-500">
                    المصادقة الثنائية تضيف طبقة حماية إضافية لحسابك. عند تفعيلها، ستحتاج إلى إدخال رمز
                    تحقق من تطبيق المصادقة بالإضافة إلى كلمة المرور.
                  </p>

                  {setupMut.isError && (
                    <ErrorAlert message={setupMut.error.message} />
                  )}

                  <Button
                    className="w-full"
                    onClick={() => setupMut.mutate({} as never)}
                    loading={setupMut.isPending}
                  >
                    بدء الإعداد
                  </Button>
                </div>
              ) : (
                /* Step 2: Show QR code placeholder + secret + verify input */
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      امسح رمز QR باستخدام تطبيق المصادقة
                    </p>
                    {/* QR Code placeholder */}
                    <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900">
                      <span className="text-xs text-gray-400">QR Code</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="mb-1 text-xs font-medium text-gray-500">الرمز السري (Secret):</p>
                    <p
                      className="select-all font-mono text-sm text-gray-800 dark:text-gray-200"
                      dir="ltr"
                    >
                      {setupData?.secret as string}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      أو أدخل الرمز السري يدوياً في التطبيق
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <p className="mb-3 text-sm font-medium">
                      أدخل رمز التحقق من التطبيق لتأكيد الإعداد:
                    </p>

                    {verifyMut.isError && (
                      <div className="mb-3">
                        <ErrorAlert message={verifyMut.error.message} />
                      </div>
                    )}
                    {verifyError && (
                      <p className="mb-2 text-sm text-red-600">{verifyError}</p>
                    )}
                    {verifyMut.isSuccess && (
                      <p className="mb-2 text-sm text-green-600">تم تفعيل المصادقة الثنائية بنجاح</p>
                    )}

                    <Input
                      label="رمز التحقق"
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
                      تأكيد وتفعيل
                    </Button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </Card>
    </div>
  );
}
