import { Card } from '@galaxy/ui';

const FEATURES = [
  { emoji:'📅', title:'حجز سريع', desc:'احجزي موعدكِ عبر واتساب في ثواني' },
  { emoji:'🔔', title:'تذكير تلقائي', desc:'تذكير بموعدكِ قبل 24 ساعة وساعة' },
  { emoji:'💬', title:'استشارة فورية', desc:'اسألي عن الخدمات والأسعار' },
  { emoji:'⭐', title:'تقييم سهل', desc:'قيّمي الخدمة بعد الجلسة مباشرة' },
  { emoji:'🎁', title:'عروض حصرية', desc:'عروض وكوبونات عبر الواتساب فقط' },
  { emoji:'📍', title:'أقرب صالون', desc:'اعرفي أقرب صالون متاح' },
];

export default function WhatsAppBotPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-7xl">💬</span>
        <h1 className="mt-6 text-4xl font-extrabold">بوت الواتساب</h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">احجزي، استفسري، وتابعي حجوزاتكِ — كل شيء عبر واتساب</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {FEATURES.map((f) => (
          <Card key={f.title} padding="lg" className="text-center">
            <span className="text-4xl">{f.emoji}</span>
            <h3 className="mt-3 font-bold">{f.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
          </Card>
        ))}
      </div>

      <div className="rounded-3xl bg-emerald-50 p-8 text-center dark:bg-emerald-950">
        <span className="text-5xl">📱</span>
        <h2 className="mt-4 text-2xl font-extrabold">ابدئي الآن</h2>
        <p className="mt-2 text-text-secondary">أرسلي "مرحباً" إلى رقم الواتساب</p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-bold text-white">
          <span>+966 50 000 0000</span>
        </div>
      </div>
    </div>
  );
}
