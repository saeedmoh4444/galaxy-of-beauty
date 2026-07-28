import Link from 'next/link';
import { Card, Button } from '@galaxy/shared';

const OCCASIONS = [
  { id: 'birthday', emoji: '🎂', name: 'عيد ميلاد', desc: 'أفضل هدايا التجميل لعيد الميلاد', gifts: [
    { title: 'باقة عناية بالبشرة', price: '٢٥٠ ر.س', desc: 'جلسة تنظيف وترطيب مع ماسك', emoji: '✨', link: '/services' },
    { title: 'بطاقة هدية', price: 'من ١٠٠ ر.س', desc: 'لأي خدمة تجميل تختارها', emoji: '🎁', link: '/customer/gift-cards' },
    { title: 'مانيكير وباديكير', price: '١٥٠ ر.س', desc: 'طلاء أظافر مع مساج', emoji: '💅', link: '/services' },
  ]},
  { id: 'wedding', emoji: '👰', name: 'زفاف', desc: 'هدايا للعروس وصديقاتها', gifts: [
    { title: 'باقة العروس', price: '٥٠٠ ر.س', desc: 'مكياج + شعر + أظافر', emoji: '👰', link: '/bridal-concierge' },
    { title: 'جلسة تصوير', price: '٣٠٠ ر.س', desc: 'مكياج احترافي للتصوير', emoji: '📸', link: '/services' },
    { title: 'بطاقة هدية للعروس', price: 'من ٢٠٠ ر.س', desc: 'لتختار ما يناسبها', emoji: '🎁', link: '/customer/gift-cards' },
  ]},
  { id: 'mom', emoji: '👩‍👧', name: 'عيد الأم', desc: 'دللي أمكِ بأجمل الهدايا', gifts: [
    { title: 'يوم عناية كامل', price: '٤٠٠ ر.س', desc: 'مساج + عناية + مكياج', emoji: '🧖‍♀️', link: '/mommy-and-me' },
    { title: 'باقة أم وابنتها', price: '٣٠٠ ر.س', desc: 'جلسة عناية مشتركة', emoji: '👩‍👧', link: '/mommy-and-me' },
    { title: 'سجل هدايا', price: 'حسب اختيارك', desc: 'لتدلعي أمك باختيارها', emoji: '🎁', link: '/customer/gift-registry' },
  ]},
  { id: 'eid', emoji: '🌙', name: 'العيد', desc: 'هدايا العيد لأحبابك', gifts: [
    { title: 'بطاقة هدية العيد', price: 'من ١٠٠ ر.س', desc: 'هدية مثالية للعيد', emoji: '🎁', link: '/customer/gift-cards' },
    { title: 'حناء العيد', price: '١٠٠ ر.س', desc: 'نقوش حناء عصرية', emoji: '🌿', link: '/services' },
    { title: 'مكياج العيد', price: '٢٠٠ ر.س', desc: 'إطلالة متألقة للعيد', emoji: '💄', link: '/services' },
  ]},
];

export default function GiftGuidePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-6xl">🎁</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">دليل الهدايا</h1>
        <p className="mt-2 text-gray-500">اختاري الهدية المثالية لكل مناسبة</p>
      </div>

      {OCCASIONS.map(occ => (
        <div key={occ.id} className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">{occ.emoji}</span>
            <div><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{occ.name}</h2><p className="text-sm text-gray-500">{occ.desc}</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {occ.gifts.map((g, i) => (
              <Link key={i} href={g.link}>
                <Card hover padding="lg" className="h-full text-center">
                  <span className="text-4xl">{g.emoji}</span>
                  <h3 className="mt-3 font-bold text-gray-900 dark:text-gray-100">{g.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{g.desc}</p>
                  <p className="mt-3 text-lg font-extrabold text-brand-600">{g.price}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center mt-12 p-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl dark:from-pink-950 dark:to-purple-950">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">💝 لم تجدي ما تبحثين عنه؟</h2>
        <p className="mt-2 text-gray-500">أنشئي بطاقة هدية بالمبلغ اللي تختارينه</p>
        <Link href="/customer/gift-cards" className="mt-4 inline-block"><Button size="lg">🎁 إنشاء بطاقة هدية</Button></Link>
      </div>
    </div>
  );
}
