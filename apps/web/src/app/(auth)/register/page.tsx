'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Button, Input, Card, ErrorAlert } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLocale();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+9665',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'TECHNICIAN',
    city: '',
  });
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const mutation = api.auth.register.useMutation({
    onSuccess: async (data) => {
      // Tokens are now set as HttpOnly cookies by the server — no localStorage needed.
      const u = (data as unknown as Record<string, unknown>).user as unknown as Record<
        string,
        unknown
      >;
      await login(
        {
          accessToken: '', // Tokens are in HttpOnly cookies now
          refreshToken: '',
        },
        {
          id: u.id as number,
          email: u.email as string,
          name: u.name as string,
          role: u.role as 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN',
          preferredLanguage: 'ar',
        },
      );
      router.push('/dashboard');
    },
    onError: (err) => setError(err.message),
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError(t('auth.password-mismatch'));
      return;
    }
    if (!accepted) {
      setError(t('auth.terms-required'));
      return;
    }
    mutation.mutate({
      email: form.email,
      phone: form.phone,
      password: form.password,
      name: form.name,
      role: form.role,
      acceptedTerms: accepted,
      city: form.role === 'TECHNICIAN' ? form.city : undefined,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md" padding="lg">
        <h1 className="mb-6 text-center text-2xl font-bold">{t('auth.register')}</h1>
        {error && (
          <div className="mb-4">
            <ErrorAlert message={error} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.name')}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
          <Input
            label={t('auth.email')}
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label={t('auth.phone')}
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            dir="ltr"
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
          <Input
            label={t('auth.confirm-password')}
            type="password"
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
          />
          <div>
            <label
              htmlFor="rg-account-type"
              className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300"
            >
              {t('auth.account-type')}
            </label>
            <select
              id="rg-account-type"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            >
              <option value="CUSTOMER">{t('auth.role-customer')}</option>
              <option value="TECHNICIAN">{t('auth.role-technician')}</option>
            </select>
          </div>
          {form.role === 'TECHNICIAN' && (
            <Input
              label={t('auth.city')}
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            {t('auth.agree-terms')}{' '}
            <Link href="/terms" className="text-brand-600">
              {t('auth.terms')}
            </Link>
          </label>
          <Button type="submit" className="w-full" loading={mutation.isPending}>
            {t('auth.register')}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-brand-600 hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
