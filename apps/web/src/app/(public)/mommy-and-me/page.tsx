import Link from 'next/link';
import { Card, Button } from '@galaxy/shared';

const PACKAGES = [
  { emoji: '💅', title: 'مانيكير الأم وابنتها', desc: 'جلسة مانيكير للأم مع ابنتها في وقت واحد', price: 150, services: ['مانيكير', 'طلاء أظافر'] },
  { emoji: '💇‍♀️', title: 'تسريحة الأم وابنتها', desc: 'تسريحتين متناسقتين لمناسبتكِ الخاصة', price: 200, services: ['تسريحة شعر'] },
  { emoji: '✨', title: 'عناية بالبشرة للأم وابنتها', desc: 'جلسة تنظيف وترطيب للبشرة معاً', price: 250, services: ['تنظيف بشرة', 'ماسك وجه'] },
  { emoji: '👰', title: 'إطلالة الزفاف للأم والعروس', desc: 'مكياج وتسريحة للأم وبنتها يوم الزفاف', price: 500, services: ['مكياج', 'تسريحة شعر', 'مانيكير'] },
  { emoji: '🎂', title: 'حفلة أعياد الميلاد', desc: 'باقة تجميل لحفلة عيد ميلاد الأم أو البنت', price: 300, services: ['مكياج', 'تسريحة شعر', 'مانيكير'] },
  { emoji: '🧖‍♀️', title: 'يوم منتجع صحي للأم وابنتها', desc: 'يوم كامل من الاسترخاء والعناية معاً', price: 600, services: ['مساج', 'حمام مغربي', 'عناية بالبشرة', 'مانيكير', 'باديكير'] },
];

export default function MommyAndMePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-7xl">👩‍👧</span>
        <h1 className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-gray-100">Mommy & Me</h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          لحظات جميلة تشاركينها مع ابنتكِ. باقات تجميل مصممة خصيصاً للأمهات وبناتهن — لأن الجمال يصبح أجمل عندما نتشاركه
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map((pkg, i) => (
          <Card key={i} padding="lg" hover>
            <div className="text-center">
              <span className="text-5xl">{pkg.emoji}</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-gray-100">{pkg.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{pkg.desc}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                {pkg.services.map(s => <span key={s} className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-600 dark:bg-pink-950">{s}</span>)}
              </div>
              <p className="mt-4 text-2xl font-extrabold text-brand-600">{pkg.price} ر.س</p>
              <p className="text-xs text-gray-400">للشخصين</p>
              <Link href="/bookings/create" className="mt-4 inline-block">
                <Button size="sm">احجزي لشخصين</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-12 dark:from-pink-950 dark:to-purple-950">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">💝 هدية مثالية</h2>
        <p className="mt-3 text-gray-500 max-w-md mx-auto">اشتري بطاقة هدية Mommy & Me واهدِ أمكِ أو ابنتكِ يوماً لا يُنسى من العناية والجمال</p>
        <Link href="/gift-cards" className="mt-6 inline-block"><Button size="lg">🎁 اشتري بطاقة هدية</Button></Link>
      </div>
    </div>
  );
}
