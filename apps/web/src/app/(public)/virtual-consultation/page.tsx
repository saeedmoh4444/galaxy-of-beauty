import { Card } from '@galaxy/ui';

const TOPICS = ['روتين عناية', 'مكياج', 'شعر', 'بشرة', 'أظافر', 'عطور'];

export default function VirtualConsultationPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-7xl">💻</span>
        <h1 className="mt-6 text-4xl font-extrabold">استشارة افتراضية</h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">استشيري خبيرات التجميل من منزلكِ — جلسة فيديو خاصة ومباشرة</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-12">
        <Card padding="lg" className="text-center">
          <span className="text-4xl">📹</span>
          <h3 className="mt-3 font-bold">فيديو مباشر</h3>
          <p className="mt-2 text-sm text-text-secondary">جلسة خاصة عبر الفيديو مع خبيرة تجميل</p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-4xl">⏱️</span>
          <h3 className="mt-3 font-bold">30-60 دقيقة</h3>
          <p className="mt-2 text-sm text-text-secondary">المدة حسب احتياجكِ — استشارة سريعة أو مفصلة</p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-4xl">💰</span>
          <h3 className="mt-3 font-bold">من 99 ر.س</h3>
          <p className="mt-2 text-sm text-text-secondary">أسعار مناسبة — ادفعي فقط عند الحجز</p>
        </Card>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">💬 موضوعات الاستشارة</h2>
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {TOPICS.map((t) => (<span key={t} className="rounded-full bg-rose-50 px-6 py-3 text-sm font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">{t}</span>))}
      </div>

      <div className="text-center">
        <button type="button" className="rounded-2xl bg-rose-600 px-10 py-4 text-lg font-bold text-white hover:bg-rose-700 transition-colors">📅 احجزي استشارة الآن</button>
      </div>
    </div>
  );
}
