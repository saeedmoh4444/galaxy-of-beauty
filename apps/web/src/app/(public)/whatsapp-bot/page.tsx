import { Card } from '@galaxy/ui';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

const FEATURES = [
  {
    emoji: '',
    title: 'marketing.whatsapp-bot.feature-quick-booking',
    desc: 'marketing.whatsapp-bot.feature-quick-booking-desc',
  },
  {
    emoji: '',
    title: 'marketing.whatsapp-bot.feature-auto-reminder',
    desc: 'marketing.whatsapp-bot.feature-auto-reminder-desc',
  },
  {
    emoji: '',
    title: 'marketing.whatsapp-bot.feature-instant-consult',
    desc: 'marketing.whatsapp-bot.feature-instant-consult-desc',
  },
  {
    emoji: '',
    title: 'marketing.whatsapp-bot.feature-easy-rating',
    desc: 'marketing.whatsapp-bot.feature-easy-rating-desc',
  },
  {
    emoji: '',
    title: 'marketing.whatsapp-bot.feature-exclusive-offers',
    desc: 'marketing.whatsapp-bot.feature-exclusive-offers-desc',
  },
  {
    emoji: '',
    title: 'marketing.whatsapp-bot.feature-nearest-salon',
    desc: 'marketing.whatsapp-bot.feature-nearest-salon-desc',
  },
] as const;

export default async function WhatsAppBotPage(): Promise<JSX.Element> {
  const locale = await getServerLocale();
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-7xl"></span>
        <h1 className="mt-6 text-4xl font-extrabold">
          {t('marketing.whatsapp-bot.title', locale)}
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
          {t('marketing.whatsapp-bot.subtitle', locale)}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {FEATURES.map((f) => (
          <Card key={f.title} padding="lg" className="text-center">
            <span className="text-4xl">{f.emoji}</span>
            <h3 className="mt-3 font-bold">{t(f.title, locale)}</h3>
            <p className="mt-2 text-sm text-text-secondary">{t(f.desc, locale)}</p>
          </Card>
        ))}
      </div>

      <div className="rounded-3xl bg-emerald-50 p-8 text-center dark:bg-emerald-950">
        <span className="text-5xl"></span>
        <h2 className="mt-4 text-2xl font-extrabold">
          {t('marketing.whatsapp-bot.start-now', locale)}
        </h2>
        <p className="mt-2 text-text-secondary">{t('marketing.whatsapp-bot.send-hello', locale)}</p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-bold text-white">
          <span>+966 50 000 0000</span>
        </div>
      </div>
    </div>
  );
}
