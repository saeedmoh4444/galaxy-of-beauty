import { Card, Button } from '@galaxy/shared';
import Link from 'next/link';

const CHALLENGES = [
  { id: '7day_skincare', emoji: '✨', name: 'تحدي ٧ أيام للعناية بالبشرة', desc: 'أكملي روتين العناية لمدة ٧ أيام', target: '٧ أيام', reward: 'خصم ١٥٪', color: 'from-rose-400 to-pink-500' },
  { id: '5bookings', emoji: '💇‍♀️', name: 'تحدي ٥ حجوزات', desc: 'احجزي ٥ خدمات في ٣٠ يوم', target: '٥ حجوزات', reward: 'جلسة مجانية', color: 'from-amber-400 to-orange-500' },
  { id: 'first_review', emoji: '⭐', name: 'تحدي المراجعة الأولى', desc: 'اكتبي مراجعتكِ الأولى', target: 'مراجعة', reward: '٥٠ نقطة', color: 'from-blue-400 to-cyan-500' },
  { id: 'streak_4weeks', emoji: '🔥', name: 'تحدي ٤ أسابيع', desc: 'حجز أسبوعي لمدة ٤ أسابيع', target: '٤ أسابيع', reward: 'خصم ٢٥٪', color: 'from-purple-400 to-violet-500' },
  { id: 'refer_3friends', emoji: '👯‍♀️', name: 'تحدي دعوة الصديقات', desc: 'دعي ٣ صديقات يسجلن ويحجزن', target: '٣ صديقات', reward: '١٠٠ ر.س', color: 'from-emerald-400 to-green-500' },
];

export default function ChallengesPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">🏆 تحديات الجمال</h1>
        <p className="mt-2 text-gray-500">أكملي التحديات واكسبي مكافآت حصرية</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CHALLENGES.map(c => (
          <Card key={c.id} padding="lg" className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${c.color}`} />
            <div className="text-center pt-4">
              <span className="text-5xl">{c.emoji}</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-gray-100">{c.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{c.desc}</p>
              <div className="mt-4 flex justify-around text-sm">
                <div><p className="text-gray-400">الهدف</p><p className="font-bold">{c.target}</p></div>
                <div><p className="text-gray-400">المكافأة</p><p className="font-bold text-brand-600">{c.reward}</p></div>
              </div>
              <Link href="/register" className="mt-4 inline-block"><Button size="sm">ابدئي التحدي</Button></Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
