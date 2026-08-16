'use client';

import { api } from '@/lib/trpc';
import { useState } from 'react';
import { PageContainer, PageTitle, Card } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CorporateWellnessPage(): JSX.Element {
  const plans = (api as any).corporateWellness?.plans?.useQuery?.() as any;
  const enquiries = (api as any).corporateWellness?.myEnquiries?.useQuery?.() as any;
  const [planId, setPlanId] = useState('growth');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleEnquire = async () => {
    if (!companyName || !contactName || !email) return;
    try {
      await (api as any).corporateWellness.enquire.mutate({
        companyName,
        contactName,
        email,
        planId,
      });
      setSubmitted(true);
      setShowForm(false);
    } catch {
      /* noop */
    }
  };

  const items = (plans?.data ?? []) as any[];
  const enquiryItems = (enquiries?.data ?? []) as any[];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title=" عافية الشركات" subtitle="باقات تجميل وعناية لمنسوبات الشركات" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {submitted && (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center dark:bg-emerald-950">
                <span className="text-4xl"></span>
                <p className="mt-3 font-bold text-emerald-700 dark:text-emerald-300">
                  تم استلام طلبكِ وسنتواصل معكِ
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((p: any) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={`flex gap-4 rounded-2xl border-2 p-5 text-right transition-all ${planId === p.id ? 'border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
                >
                  <span className="text-4xl shrink-0">{p.emoji}</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
                      {p.nameAr}
                    </h4>
                    <p className="mt-1 text-lg font-extrabold text-rose-600 dark:text-rose-400">
                      {(p.price as number)?.toLocaleString()} ر.س{' '}
                      <span className="text-xs font-normal text-text-tertiary dark:text-gray-500">
                        / سنوياً
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary dark:text-gray-500">
                      حتى {p.employees} موظفة
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(p.services as string[])?.map((svc: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="w-full rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition-colors"
            >
              {showForm ? ' إغلاق' : ' تقديم طلب'}
            </button>

            {showForm && (
              <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="اسم الشركة"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-right dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="اسم المسؤولة"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-right dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-right dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={handleEnquire}
                  className="w-full rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition-colors"
                >
                  إرسال الطلب
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {enquiryItems.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-bold text-text-primary dark:text-gray-100">
                  طلباتي السابقة
                </h3>
                <div className="mt-3 space-y-2">
                  {enquiryItems.map((e: any, i: number) => (
                    <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <p className="text-sm font-semibold text-text-primary dark:text-gray-100">
                        {e.companyName}
                      </p>
                      <p className="text-xs text-text-tertiary dark:text-gray-500">
                        {e.planId} · {new Date(e.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
