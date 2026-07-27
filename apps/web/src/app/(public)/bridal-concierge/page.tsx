import Link from 'next/link';
import { Button, Card } from '@galaxy/shared';

export default function BridalConciergePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <span className="text-7xl">👰</span>
        <h1 className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-gray-100">خدمة تخطيط زفافكِ</h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          يوم زفافكِ يستحق الأفضل. صممنا لكِ خدمة شاملة لتخطيط إطلالتكِ من الألف إلى الياء — تجارب مكياج، عناية بالبشرة، تسريحة الشعر، والمزيد.
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {[
          { icon: '📋', title: 'خططي ليومكِ', desc: 'اختاري الخدمات اللي تحتاجينها وحددي مواعيد التجارب' },
          { icon: '💄', title: 'جربي إطلالتكِ', desc: 'جلسات تجربة مكياج وشعر قبل اليوم الكبير' },
          { icon: '✨', title: 'تألقي يوم زفافكِ', desc: 'فريق متكامل من أفضل الفنيات في يومكِ الخاص' },
        ].map((s, i) => <Card key={i} padding="lg" className="text-center"><div className="text-4xl">{s.icon}</div><h3 className="mt-3 text-lg font-bold">{s.title}</h3><p className="mt-2 text-sm text-gray-500">{s.desc}</p></Card>)}
      </div>
      <div className="mt-12 text-center">
        <Link href="/customer/beauty-profile"><Button size="lg">ابدئي التخطيط الآن</Button></Link>
      </div>
    </div>
  );
}
