'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Button, Input, Card, ErrorAlert } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [error, setError] = useState('');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const mutation = api.auth.login.useMutation({
    onSuccess: async (data) => {
      const u = data.user as unknown as Record<string, unknown>;
      localStorage.setItem('gob_access', data.accessToken);
      localStorage.setItem('gob_refresh', data.refreshToken);
      await login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        { id: u.id as number, email: u.email as string, name: u.name as string, role: (u.role as string) as 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN', preferredLanguage: 'ar' },
      );
      const role = u.role as string;
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'TECHNICIAN') router.push('/tech/dashboard');
      else router.push('/dashboard');
    },
    onError: (err) => {
      // Check if the server is requesting 2FA
      if (err.data?.code === 'PRECONDITION_FAILED' && err.message === '2FA_REQUIRED') {
        setTwoFactorRequired(true);
        setError('');
      } else {
        setError(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (twoFactorRequired) {
      // Re-submit with TOTP token included
      if (totpToken.length !== 6) {
        setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
        return;
      }
      mutation.mutate({ email, password, totpToken });
    } else {
      mutation.mutate({ email, password });
    }
  };

  // Allow going back to password entry
  const handleCancel2FA = () => {
    setTwoFactorRequired(false);
    setTotpToken('');
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" padding="lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          تسجيل الدخول
        </h1>

        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email & Password — hidden when 2FA required */}
          {!twoFactorRequired && (
            <>
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
              <Input
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </>
          )}

          {/* 2FA TOTP input — shown when 2FA required */}
          {twoFactorRequired && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950">
              <p className="mb-3 text-sm font-medium text-brand-800 dark:text-brand-200">
                تم تفعيل المصادقة الثنائية. أدخل رمز التحقق من تطبيق المصادقة:
              </p>
              <Input
                label="رمز التحقق (6 أرقام)"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoFocus
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleCancel2FA}
                className="mt-3 text-sm text-brand-600 hover:underline dark:text-brand-400"
              >
                ← العودة لتسجيل الدخول
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" loading={mutation.isPending}>
            {twoFactorRequired ? 'تحقق' : 'دخول'}
          </Button>
        </form>

        {!twoFactorRequired && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <Link href="/forgot-password" className="text-brand-600 hover:underline">
              نسيت كلمة المرور؟
            </Link>
            <span className="mx-2">|</span>
            <Link href="/register" className="text-brand-600 hover:underline">
              إنشاء حساب
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
