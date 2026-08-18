'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, Spinner, VERIFY_REDIRECT_MS } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function VerifyEmailPage(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLocale();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [msg, setMsg] = useState('');
  const verifyMut = api.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus('success');
      setMsg(t('auth.verify-email-success'));
      setTimeout(() => router.push('/login'), VERIFY_REDIRECT_MS);
    },
    onError: (e) => {
      setStatus('error');
      setMsg(e.message || t('auth.verify-email-failed'));
    },
  });

  // Keep the latest translator without re-running the verification effect on locale change.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });

  useEffect(() => {
    if (token) verifyMut.mutate({ token });
    else {
      setStatus('error');
      setMsg(tRef.current('auth.verify-token-missing'));
    }
  }, [token, verifyMut]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card padding="lg" className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('auth.verify-email-title')}
        </h1>
        {status === 'loading' && (
          <div className="py-8">
            <Spinner size="lg" label={t('auth.verifying')} />
          </div>
        )}
        {status === 'success' && (
          <div className="py-8">
            <span className="text-5xl"></span>
            <p className="mt-4 text-lg text-green-600">{msg}</p>
            <p className="mt-2 text-sm text-text-tertiary">{t('auth.verify-redirecting')}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="py-8">
            <span className="text-5xl"></span>
            <p className="mt-4 text-lg text-red-600">{msg}</p>
            <Link href="/login" className="mt-4 inline-block text-brand-600 hover:underline">
              {t('auth.back-to-login-short')}
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
