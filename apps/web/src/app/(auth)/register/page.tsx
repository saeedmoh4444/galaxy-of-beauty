'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Button, Input, Card, ErrorAlert } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '+9665', password: '', confirmPassword: '', role: 'CUSTOMER' as 'CUSTOMER' | 'TECHNICIAN', city: '' });
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const mutation = api.auth.register.useMutation({
    onSuccess: async (data) => {
      const u = (data as Record<string, unknown>).user as Record<string, unknown>;
      localStorage.setItem('gob_access', (data as Record<string, unknown>).accessToken as string);
      localStorage.setItem('gob_refresh', (data as Record<string, unknown>).refreshToken as string);
      await login(
        { accessToken: (data as Record<string, unknown>).accessToken as string, refreshToken: (data as Record<string, unknown>).refreshToken as string },
        { id: u.id as number, email: u.email as string, name: u.name as string, role: u.role as 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN', preferredLanguage: 'ar' },
      );
      router.push('/dashboard');
    },
    onError: (err) => setError(err.message),
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('كلمات المرور غير متطابقة'); return; }
    if (!accepted) { setError('يجب الموافقة على الشروط والأحكام'); return; }
    mutation.mutate({ email: form.email, phone: form.phone, password: form.password, name: form.name, role: form.role, acceptedTerms: accepted, city: form.role === 'TECHNICIAN' ? form.city : undefined });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md" padding="lg">
        <h1 className="mb-6 text-center text-2xl font-bold">إنشاء حساب</h1>
        {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="الاسم" value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Input label="رقم الجوال" value={form.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" />
          <Input label="كلمة المرور" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} />
          <Input label="تأكيد كلمة المرور" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">نوع الحساب</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
              <option value="CUSTOMER">عميلة</option>
              <option value="TECHNICIAN">فنية</option>
            </select>
          </div>
          {form.role === 'TECHNICIAN' && <Input label="المدينة" value={form.city} onChange={(e) => set('city', e.target.value)} />}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            أوافق على <Link href="/terms" className="text-brand-600">الشروط والأحكام</Link>
          </label>
          <Button type="submit" className="w-full" loading={mutation.isPending}>إنشاء حساب</Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          لديك حساب؟ <Link href="/login" className="text-brand-600 hover:underline">تسجيل الدخول</Link>
        </p>
      </Card>
    </div>
  );
}
