import Link from 'next/link';
import { Card, Button, formatCurrency } from '@galaxy/shared';

const LOOKS = [
  { id: 'bridal', emoji: '👰', name: 'إطلالة العروس', desc: 'إطلالة متكاملة ليوم زفافكِ', color: 'from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950', services: [
    { name: 'مكياج عرايس', price: 500, duration: 90, emoji: '💄' },
    { name: 'تسريحة شعر', price: 300, duration: 60, emoji: '💇‍♀️' },
    { name: 'مانيكير وباديكير', price: 150, duration: 60, emoji: '💅' },
    { name: 'عناية بالبشرة', price: 200, duration: 45, emoji: '✨' },
  ]},
  { id: 'party', emoji: '✨', name: 'إطلالة السهرة', desc: 'تألقي في مناسباتكِ المسائية', color: 'from-purple-100 to-violet-100 dark:from-purple-950 dark:to-violet-950', services: [
    { name: 'مكياج سهرة', price: 300, duration: 60, emoji: '💄' },
    { name: 'تسريحة شعر', price: 200, duration: 45, emoji: '💇‍♀️' },
    { name: 'تركيب رموش', price: 80, duration: 30, emoji: '👁️' },
  ]},
  { id: 'spa', emoji: '🧖‍♀️', name: 'يوم سبا', desc: 'يوم كامل من الاسترخاء والعناية', color: 'from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950', services: [
    { name: 'مساج كامل', price: 300, duration: 60, emoji: '💆‍♀️' },
    { name: 'حمام مغربي', price: 250, duration: 45, emoji: '🧖‍♀️' },
    { name: 'عناية بالبشرة', price: 200, duration: 45, emoji: '✨' },
    { name: 'مانيكير', price: 80, duration: 30, emoji: '💅' },
  ]},
  { id: 'casual', emoji: '☀️', name: 'إطلالة يومية', desc: 'جمال طبيعي ليومكِ العادي', color: 'from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950', services: [
    { name: 'مكياج طبيعي', price: 150, duration: 30, emoji: '💄' },
    { name: 'تصفيف شعر', price: 100, duration: 30, emoji: '💇‍♀️' },
  ]},
  { id: 'interview', emoji: '💼', name: 'إطلالة العمل', desc: 'إطلالة مهنية واثقة', color: 'from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950', services: [
    { name: 'مكياج احترافي', price: 200, duration: 45, emoji: '💄' },
    { name: 'تسريحة عمل', price: 120, duration: 30, emoji: '💇‍♀️' },
    { name: 'تحديد حواجب', price: 60, duration: 20, emoji: '✨' },
  ]},
  { id: 'photoshoot', emoji: '📸', name: 'إطلالة التصوير', desc: 'مكياج يدوم طوال جلسة التصوير', color: 'from-fuchsia-100 to-pink-100 dark:from-fuchsia-950 dark:to-pink-950', services: [
    { name: 'مكياج تصوير', price: 400, duration: 90, emoji: '💄' },
    { name: 'تسريحة شعر', price: 250, duration: 45, emoji: '💇‍♀️' },
    { name: 'مانيكير', price: 100, duration: 30, emoji: '💅' },
  ]},
];

export default function ShopTheLookPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-6xl">🛍️</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">تسوقي الإطلالة</h1>
        <p className="mt-2 text-text-secondary">اختاري إطلالتكِ الكاملة واحجزي جميع الخدمات بنقرة واحدة</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {LOOKS.map(look => {
          const total = look.services.reduce((sum, s) => sum + s.price, 0);
          const totalDuration = look.services.reduce((sum, s) => sum + s.duration, 0);
          return (
            <Card key={look.id} padding="lg" className={`bg-gradient-to-br ${look.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{look.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">{look.name}</h2>
                  <p className="text-sm text-text-secondary dark:text-gray-400">{look.desc}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {look.services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white/60 dark:bg-gray-800/60 p-3">
                    <div className="flex items-center gap-2">
                      <span>{s.emoji}</span>
                      <span className="text-sm font-medium text-text-primary dark:text-gray-100">{s.name}</span>
                      <span className="text-xs text-text-secondary">({s.duration} د)</span>
                    </div>
                    <span className="text-sm font-bold text-brand-600">{formatCurrency(s.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-edge/50 dark:border-gray-700/50 pt-4">
                <div>
                  <p className="text-lg font-extrabold text-text-primary dark:text-gray-100">{formatCurrency(total)}</p>
                  <p className="text-xs text-text-secondary">{totalDuration} دقيقة · {look.services.length} خدمات</p>
                </div>
                <Link href="/bookings/create"><Button>احجزي الإطلالة</Button></Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
