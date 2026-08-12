'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Button, Input, Card, ErrorAlert } from '@galaxy/ui';

export default function ResetPasswordPage(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const resetMut = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      setMsg('تم إعادة تعيين كلمة المرور بنجاح');
      setTimeout(() => router.push('/login'), 2000);
    },
    onError: (e) => setError(e.message || 'فشل إعادة التعيين'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card padding="lg" className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-text-primary dark:text-gray-100">
          إعادة تعيين كلمة المرور
        </h1>
        {msg && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{msg}</p>}
        {error && <ErrorAlert message={error} />}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password !== confirm) {
              setError('كلمتا المرور غير متطابقتين');
              return;
            }
            resetMut.mutate({ token, newPassword: password });
          }}
          className="space-y-4"
        >
          <Input
            type="password"
            label="كلمة المرور الجديدة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            type="password"
            label="تأكيد كلمة المرور"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" className="w-full" loading={resetMut.isPending}>
            إعادة تعيين
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-text-secondary">
          <Link href="/login" className="text-brand-600 hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </p>
      </Card>
    </div>
  );
}
