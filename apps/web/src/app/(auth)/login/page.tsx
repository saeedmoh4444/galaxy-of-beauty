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
  const [error, setError] = useState('');
  const mutation = api.auth.login.useMutation({
    onSuccess: async (data) => {
      const u = data.user as Record<string, unknown>;
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
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md" padding="lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">تسجيل الدخول</h1>
        {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
          <Input label="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button type="submit" className="w-full" loading={mutation.isPending}>دخول</Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          <Link href="/forgot-password" className="text-brand-600 hover:underline">نسيت كلمة المرور؟</Link>
          <span className="mx-2">|</span>
          <Link href="/register" className="text-brand-600 hover:underline">إنشاء حساب</Link>
        </div>
      </Card>
    </div>
  );
}
