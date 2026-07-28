import Link from 'next/link';
import { Card, Button, formatCurrency, ar } from '@galaxy/shared';

export default function FlashDealsPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">⚡</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">عروض فلاش</h1>
        <p className="mt-2 text-gray-500">عروض لفترة محدودة — الحقّي العرض قبل ما ينتهي!</p>
      </div>

      {[
        { title: 'خصم ٤٠٪ على المانيكير', originalPrice: 120, dealPrice: 72, discount: 40, endsIn: '٣ ساعات', redeemed: 15, max: 20, emoji: '💅', link: '/services' },
        { title: 'خصم ٣٠٪ على تنظيف البشرة', originalPrice: 200, dealPrice: 140, discount: 30, endsIn: '٥ ساعات', redeemed: 8, max: 15, emoji: '✨', link: '/services' },
        { title: 'خصم ٥٠٪ على المكياج', originalPrice: 300, dealPrice: 150, discount: 50, endsIn: 'ساعتين', redeemed: 20, max: 20, emoji: '💄', link: '/services' },
      ].map((d, i) => {
        const pct = (d.redeemed / d.max) * 100;
        const soldOut = d.redeemed >= d.max;
        return (
          <Card key={i} padding="lg" className={`mb-6 relative overflow-hidden ${soldOut ? 'opacity-60' : ''}`}>
            <div className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white animate-pulse">{soldOut ? 'نفذ' : '⚡ فلاش'}</div>
            <div className="flex items-center gap-6">
              <span className="text-6xl">{d.emoji}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{d.title}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-red-600">{formatCurrency(d.dealPrice)}</span>
                  <span className="text-lg text-gray-400 line-through">{formatCurrency(d.originalPrice)}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">-{d.discount}%</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>⏰ ينتهي خلال {d.endsIn}</span>
                  <span>🔥 {d.redeemed}/{d.max} تم الاستفادة</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-2 rounded-full bg-red-500" style={{ width: `${pct}%` }} /></div>
                {!soldOut && <Link href={d.link} className="mt-3 inline-block"><Button size="sm">⚡ احجزي الآن</Button></Link>}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
