'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Button, Card, ErrorAlert, Input } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function ForgotPasswordPage(): JSX.Element {
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const mutation = api.auth.forgotPassword.useMutation({
    onError: () => {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate({ email });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" padding="lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('auth.forgot-title')}
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">{t('auth.forgot-desc')}</p>

        {mutation.isError && (
          <div className="mb-4">
            <ErrorAlert message={mutation.error.message} />
          </div>
        )}

        {mutation.isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <p className="text-green-700 dark:text-green-300 font-medium">
              {t('auth.forgot-sent')}
            </p>
            <p className="text-sm text-text-secondary">{t('auth.forgot-sent-desc')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={mutation.isPending}
            />
            <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!email}>
              {t('auth.forgot-submit')}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-text-secondary">
          <Link href="/login" className="text-brand-600 hover:underline">
            {t('auth.back-to-login')}
          </Link>
        </div>
      </Card>
    </div>
  );
}
