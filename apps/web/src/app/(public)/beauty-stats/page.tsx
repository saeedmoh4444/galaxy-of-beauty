import { getServerCaller } from '@/lib/server-trpc';
import { Card } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

export default async function BeautyStatsPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
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
        <span className="text-7xl"></span>
        <h1 className="mt-6 text-4xl font-extrabold">
          {t('marketing.beauty-stats.title', locale)}
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
          {t('marketing.beauty-stats.subtitle', locale)}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg" className="text-center">
          <span className="text-4xl"></span>
          <p className="text-3xl font-extrabold mt-3">
            {stats.totalBookings.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}+
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {t('marketing.beauty-stats.stat-bookings', locale)}
          </p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-4xl">‍</span>
          <p className="text-3xl font-extrabold mt-3">
            {stats.totalTechnicians.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}+
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {t('marketing.beauty-stats.stat-technicians', locale)}
          </p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-4xl"></span>
          <p className="text-3xl font-extrabold mt-3">
            {stats.totalServices.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}+
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {t('marketing.beauty-stats.stat-services', locale)}
          </p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-4xl"></span>
          <p className="text-3xl font-extrabold mt-3">
            {stats.happyCustomers.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}+
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {t('marketing.beauty-stats.stat-happy-customers', locale)}
          </p>
        </Card>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <Card padding="lg" className="text-center">
          <span className="text-3xl"></span>
          <p className="text-2xl font-extrabold mt-2">{stats.avgRating}</p>
          <p className="text-sm text-text-secondary">
            {t('marketing.beauty-stats.stat-avg-rating', locale)}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {t('marketing.beauty-stats.stat-reviews', locale, {
              count: stats.totalReviews.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB'),
            })}
          </p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-3xl"></span>
          <p className="text-2xl font-extrabold mt-2">{stats.citiesCount}+</p>
          <p className="text-sm text-text-secondary">
            {t('marketing.beauty-stats.stat-cities', locale)}
          </p>
        </Card>
        <Card padding="lg" className="text-center">
          <span className="text-3xl"></span>
          <p className="text-2xl font-extrabold mt-2">
            {t('marketing.beauty-stats.stat-247', locale)}
          </p>
          <p className="text-sm text-text-secondary">
            {t('marketing.beauty-stats.stat-24-7-desc', locale)}
          </p>
        </Card>
      </div>
    </div>
  );
}
