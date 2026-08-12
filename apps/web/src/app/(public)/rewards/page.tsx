/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerCaller } from '@/lib/server-trpc';
import { Card } from '@galaxy/ui';

const TIER_LABELS: Record<string, { name: string; emoji: string; color: string }> = {
  SILVER: { name: 'الفضية', emoji: '', color: 'from-gray-300 to-gray-400' },
  GOLD: { name: 'الذهبية', emoji: '', color: 'from-yellow-400 to-amber-500' },
  PLATINUM: { name: 'البلاتينية', emoji: '', color: 'from-purple-400 to-indigo-500' },
};

export default async function RewardsPage(): Promise<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rewards: any[] = [];
  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rewards = (await caller.loyalty.rewards()) as any[];
  } catch {
    /* empty */
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">
           برنامج المكافآت
        </h1>
        <p className="mt-2 text-text-secondary">اكسبي نقاط مع كل حجز واستبدليها بمكافآت حصرية</p>
      </div>

      {/* Tiers */}
      <div className="grid gap-6 sm:grid-cols-3 mb-12">
        {Object.entries(TIER_LABELS).map(([key, t]) => (
          <Card
            key={key}
            padding="lg"
            className={`bg-gradient-to-br ${t.color} text-white text-center`}
          >
            <span className="text-4xl">{t.emoji}</span>
            <h3 className="mt-2 text-xl font-bold">{t.name}</h3>
            <p className="text-sm opacity-80">
              {key === 'SILVER'
                ? 'تبدأ من ٠ نقطة'
                : key === 'GOLD'
                  ? 'من ٥٠٠ نقطة'
                  : 'من ٢٠٠٠ نقطة'}
            </p>
          </Card>
        ))}
      </div>

      {/* Rewards */}
      <h2 className="text-xl font-bold mb-6 text-text-primary dark:text-gray-100">
        المكافآت المتاحة
      </h2>
      {rewards.length === 0 ? (
        <p className="text-center text-text-tertiary">لا توجد مكافآت متاحة حالياً</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r: Record<string, any>) => {
            const name = (r.nameJson as Record<string, string>)?.ar || '';
            const desc = (r.descriptionJson as Record<string, string>)?.ar || '';
            return (
              <Card key={r.id} padding="lg" className="relative">
                <div className="absolute top-3 left-3 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                  {r.pointsCost} نقطة
                </div>
                <div className="text-center pt-4">
                  <span className="text-4xl">
                    {r.rewardType === 'discount_percent'
                      ? '️'
                      : r.rewardType === 'free_service'
                        ? ''
                        : ''}
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{desc}</p>
                  <div className="mt-4">
                    <span className="text-2xl font-extrabold text-brand-600">
                      {r.rewardType === 'discount_percent'
                        ? `${Number(r.rewardValue)}%`
                        : `${Number(r.rewardValue)} ر.س`}
                    </span>
                  </div>
                  {r.minTier && r.minTier !== 'SILVER' && (
                    <p className="mt-2 text-xs text-amber-600">
                      للعضوية {TIER_LABELS[r.minTier]?.name} فأعلى
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
