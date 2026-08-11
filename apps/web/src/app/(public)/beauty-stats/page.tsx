import { getServerCaller } from '@/lib/server-trpc';
import { Card } from '@galaxy/ui';

export default async function BeautyStatsPage(): Promise<JSX.Element> {
  let stats = {
    totalBookings: 0,
    totalServices: 0,
    totalTechnicians: 0,
    totalReviews: 0,
    avgRating: 0,
    citiesCount: 16,
    happyCustomers: 0,
  };
  try {
    const caller = await getServerCaller();
    stats = (await caller.beautyStats.platform()) as typeof stats;
  } catch {
    /* use defaults */
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-16">
        <span className="text-7xl">🏆</span>
        <h1 className="mt-6 text-4xl font-extrabold">جالكسي بيوتي في أرقام</h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
          المنصة الأولى لحجز خدمات التجميل في المملكة — نفتخر بثقة عملائنا
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg" className="text-center">
          <span className="text-4xl">📅</span>
          <p className="text-3xl font-extrabold mt-3">
            {stats.totalBookings.toLocaleString('ar-SA')}+
          </p>
          <p className="text-sm text-text-secondary mt-1">حجز مكتمل</p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-4xl">👩‍🎨</span>
          <p className="text-3xl font-extrabold mt-3">
            {stats.totalTechnicians.toLocaleString('ar-SA')}+
          </p>
          <p className="text-sm text-text-secondary mt-1">فنية معتمدة</p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-4xl">💄</span>
          <p className="text-3xl font-extrabold mt-3">
            {stats.totalServices.toLocaleString('ar-SA')}+
          </p>
          <p className="text-sm text-text-secondary mt-1">خدمة تجميل</p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-4xl">😊</span>
          <p className="text-3xl font-extrabold mt-3">
            {stats.happyCustomers.toLocaleString('ar-SA')}+
          </p>
          <p className="text-sm text-text-secondary mt-1">عميلة سعيدة</p>
        </Card>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <Card padding="lg" className="text-center">
          <span className="text-3xl">⭐</span>
          <p className="text-2xl font-extrabold mt-2">{stats.avgRating}</p>
          <p className="text-sm text-text-secondary">متوسط التقييمات</p>
          <p className="text-xs text-text-tertiary mt-1">
            من {stats.totalReviews.toLocaleString('ar-SA')}+ تقييم
          </p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-3xl">📍</span>
          <p className="text-2xl font-extrabold mt-2">{stats.citiesCount}+</p>
          <p className="text-sm text-text-secondary">مدينة سعودية</p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-3xl">🚀</span>
          <p className="text-2xl font-extrabold mt-2">٢٤/٧</p>
          <p className="text-sm text-text-secondary">حجز على مدار الساعة</p>
        </Card>
      </div>
    </div>
  );
}
