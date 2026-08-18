'use client';
import { useState } from 'react';
import {
  Card,
  Button,
  formatCurrency,
  BeautyBreakoutSOSCard,
  BeautySunburnReliefCard,
  BeautyPuffyEyesCard,
  BeautyChappedLipsCard,
  BeautyRednessReliefCard,
  BeautyAfterBotoxCard,
  BeautyAfterFillerCard,
  BeautyAfterLaserCard,
  BeautyAfterPeelCard,
  BeautyAfterWaxCard,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const EMERGENCIES: {
  key: string;
  emoji: string;
  name: TranslationKey;
  desc: TranslationKey;
  price: number;
  time: TranslationKey;
  tips: TranslationKey[];
}[] = [
  {
    key: 'pimple',
    emoji: '',
    name: 'rescue.emergency.pimple',
    desc: 'rescue.desc.pimple',
    price: 50,
    time: 'rescue.time.pimple',
    tips: ['rescue.tip.pimple1', 'rescue.tip.pimple2', 'rescue.tip.pimple3'],
  },
  {
    key: 'smudge',
    emoji: '',
    name: 'rescue.emergency.smudge',
    desc: 'rescue.desc.smudge',
    price: 40,
    time: 'rescue.time.smudge',
    tips: ['rescue.tip.smudge1', 'rescue.tip.smudge2', 'rescue.tip.smudge3'],
  },
  {
    key: 'hair',
    emoji: '‍️',
    name: 'rescue.emergency.hair',
    desc: 'rescue.desc.hair',
    price: 60,
    time: 'rescue.time.hair',
    tips: ['rescue.tip.hair1', 'rescue.tip.hair2', 'rescue.tip.hair3'],
  },
  {
    key: 'nail',
    emoji: '',
    name: 'rescue.emergency.nail',
    desc: 'rescue.desc.nail',
    price: 35,
    time: 'rescue.time.nail',
    tips: ['rescue.tip.nail1', 'rescue.tip.nail2', 'rescue.tip.nail3'],
  },
  {
    key: 'dry',
    emoji: '️',
    name: 'rescue.emergency.dry',
    desc: 'rescue.desc.dry',
    price: 45,
    time: 'rescue.time.dry',
    tips: ['rescue.tip.dry1', 'rescue.tip.dry2', 'rescue.tip.dry3'],
  },
  {
    key: 'redness',
    emoji: '',
    name: 'rescue.emergency.redness',
    desc: 'rescue.desc.redness',
    price: 55,
    time: 'rescue.time.redness',
    tips: ['rescue.tip.redness1', 'rescue.tip.redness2', 'rescue.tip.redness3'],
  },
];

export default function BeautyRescuePage(): JSX.Element {
  const { t } = useLocale();
  const [selected, setSelected] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const emergency = EMERGENCIES.find((e) => e.key === selected);
  const surcharge = 1.5;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('rescue.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('rescue.subtitle')}</p>
        </div>

        {booked && emergency ? (
          <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50">
            <p className="text-5xl"></p>
            <p className="font-bold text-green-700 text-xl mt-3">{t('rescue.bookedTitle')}</p>
            <p className="text-sm text-text-secondary mt-1">
              {t('rescue.onTheWay', { time: t(emergency.time) })}
            </p>
            <p className="text-2xl font-extrabold text-green-600 mt-3">
              {formatCurrency(emergency.price * surcharge)}
            </p>
            <p className="text-xs text-text-secondary">{t('rescue.includesEmergencyFee')}</p>
            <Button
              onClick={() => {
                setBooked(false);
                setSelected(null);
              }}
              className="mt-4"
            >
              {t('rescue.done')}
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {EMERGENCIES.map((e) => {
                const isSel = selected === e.key;
                return (
                  <button
                    key={e.key}
                    onClick={() => setSelected(isSel ? null : e.key)}
                    className={`rounded-xl border-2 p-4 text-right transition-all ${isSel ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <span className="text-3xl">{e.emoji}</span>
                    <h3 className="font-bold mt-2">{t(e.name)}</h3>
                    <p className="text-xs text-text-secondary">{t(e.desc)}</p>
                    <p className="text-sm font-bold text-brand-600 mt-1">
                      {formatCurrency(e.price)} · ️ {t(e.time)}
                    </p>
                  </button>
                );
              })}
            </div>

            {emergency && (
              <Card padding="lg">
                <h3 className="font-bold mb-3">
                  {emergency.emoji} {t(emergency.name)}
                </h3>
                <div className="space-y-2 mb-4">
                  {emergency.tips.map((tip, i) => (
                    <p key={i} className="text-sm text-text-secondary">
                      {t(tip)}
                    </p>
                  ))}
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span>{t('rescue.servicePrice')}</span>
                  <span>{formatCurrency(emergency.price)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>{t('rescue.emergencyFee')}</span>
                  <span>+{formatCurrency(emergency.price * 0.5)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('rescue.total')}</span>
                  <span>{formatCurrency(emergency.price * surcharge)}</span>
                </div>
                <Button onClick={() => setBooked(true)} className="w-full mt-4">
                  {t('rescue.requestRescue')}
                </Button>
              </Card>
            )}
          </>
        )}
      </div>

      {/* DIY SOS Tips */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        <BeautyBreakoutSOSCard />
        <BeautySunburnReliefCard />
        <BeautyPuffyEyesCard />
        <BeautyChappedLipsCard />
        <BeautyRednessReliefCard />
      </div>

      {/* Post-Procedure Care */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        <BeautyAfterBotoxCard />
        <BeautyAfterFillerCard />
        <BeautyAfterLaserCard />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <BeautyAfterPeelCard />
        <BeautyAfterWaxCard />
      </div>
    </DashboardLayout>
  );
}
