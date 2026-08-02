'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, Spinner } from '@galaxy/shared';

export default function VerifyEmailPage(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [msg, setMsg] = useState('');
  const verifyMut = api.auth.verifyEmail.useMutation({
    onSuccess: () => { setStatus('success'); setMsg('تم تأكيد البريد الإلكتروني بنجاح!'); setTimeout(() => router.push('/login'), 3000); },
    onError: (e) => { setStatus('error'); setMsg(e.message || 'فشل التحقق من البريد الإلكتروني'); },
  });

  useEffect(() => {
    if (token) verifyMut.mutate({ token });
    else { setStatus('error'); setMsg('رمز التحقق غير موجود'); }
  }, [token, verifyMut]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card padding="lg" className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">تأكيد البريد الإلكتروني</h1>
        {status === 'loading' && <div className="py-8"><Spinner size="lg" label="جاري التحقق..." /></div>}
        {status === 'success' && <div className="py-8"><span className="text-5xl">✅</span><p className="mt-4 text-lg text-green-600">{msg}</p><p className="mt-2 text-sm text-gray-400">جاري تحويلك لصفحة تسجيل الدخول...</p></div>}
        {status === 'error' && <div className="py-8"><span className="text-5xl">❌</span><p className="mt-4 text-lg text-red-600">{msg}</p><Link href="/login" className="mt-4 inline-block text-brand-600 hover:underline">العودة لتسجيل الدخول</Link></div>}
      </Card>
    </div>
  );
}
