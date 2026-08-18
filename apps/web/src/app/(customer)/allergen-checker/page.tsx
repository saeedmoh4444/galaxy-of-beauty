'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const COMMON_ALLERGENS: {
  key: string;
  emoji: string;
  name: TranslationKey;
  risk: string;
  desc: TranslationKey;
}[] = [
  {
    key: 'fragrance',
    emoji: '',
    name: 'allergenChecker.allergen.fragrance',
    risk: 'medium',
    desc: 'allergenChecker.desc.fragrance',
  },
  {
    key: 'alcohol',
    emoji: '',
    name: 'allergenChecker.allergen.alcohol',
    risk: 'high',
    desc: 'allergenChecker.desc.alcohol',
  },
  {
    key: 'parabens',
    emoji: '',
    name: 'allergenChecker.allergen.parabens',
    risk: 'medium',
    desc: 'allergenChecker.desc.parabens',
  },
  {
    key: 'sulfates',
    emoji: '',
    name: 'allergenChecker.allergen.sulfates',
    risk: 'high',
    desc: 'allergenChecker.desc.sulfates',
  },
  {
    key: 'silicones',
    emoji: '',
    name: 'allergenChecker.allergen.silicones',
    risk: 'low',
    desc: 'allergenChecker.desc.silicones',
  },
  {
    key: 'essential_oils',
    emoji: '',
    name: 'allergenChecker.allergen.essentialOils',
    risk: 'medium',
    desc: 'allergenChecker.desc.essentialOils',
  },
  {
    key: 'lanolin',
    emoji: '',
    name: 'allergenChecker.allergen.lanolin',
    risk: 'medium',
    desc: 'allergenChecker.desc.lanolin',
  },
  {
    key: 'formaldehyde',
    emoji: '️',
    name: 'allergenChecker.allergen.formaldehyde',
    risk: 'high',
    desc: 'allergenChecker.desc.formaldehyde',
  },
];

export default function AllergenCheckerPage(): JSX.Element {
  const { t } = useLocale();
  const { data: profile } = api.allergenChecker.getProfile.useQuery() as {
    data: Record<string, unknown> | undefined;
  };
  const saveMut = api.allergenChecker.saveProfile.useMutation();
  const [checked, setChecked] = useState<string[]>(
    (profile?.allergens as string[]) ?? ['alcohol', 'sulfates'],
  );
  const toggle = (key: string) => {
    if (checked.includes(key)) setChecked(checked.filter((x) => x !== key));
    else setChecked([...checked, key]);
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('allergenChecker.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('allergenChecker.subtitle')}</p>
        </div>
        <Card padding="lg">
          <h3 className="font-bold mb-4">{t('allergenChecker.myAllergens')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {COMMON_ALLERGENS.map((a) => {
              const isChecked = checked.includes(a.key);
              return (
                <button
                  key={a.key}
                  onClick={() => toggle(a.key)}
                  className={`rounded-xl border-2 p-3 text-right transition-all ${isChecked ? (a.risk === 'high' ? 'border-red-400 bg-red-50' : a.risk === 'medium' ? 'border-amber-400 bg-amber-50' : 'border-green-400 bg-green-50') : 'border-gray-200'}`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="font-bold ml-2">{t(a.name)}</span>
                  <span
                    className={`text-xs rounded-full px-2 py-0.5 ${a.risk === 'high' ? 'bg-red-100 text-red-700' : a.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}
                  >
                    {a.risk === 'high'
                      ? t('allergenChecker.risk.high')
                      : a.risk === 'medium'
                        ? t('allergenChecker.risk.medium')
                        : t('allergenChecker.risk.low')}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
        <Button
          onClick={() => saveMut.mutate({ allergens: checked })}
          loading={saveMut.isPending}
          className="w-full"
        >
          {t('allergenChecker.saveProfile')}
        </Button>
      </div>
    </DashboardLayout>
  );
}
