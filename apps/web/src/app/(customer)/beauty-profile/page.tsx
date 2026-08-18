'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Card, FormSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const SKIN_TYPES = ['oily', 'dry', 'combination', 'sensitive', 'normal'] as const;
const HAIR_TYPES = ['straight', 'wavy', 'curly', 'coily'] as const;
const HAIR_LENGTHS = ['short', 'medium', 'long'] as const;
const SKIN_TONES = ['fair', 'medium', 'olive', 'tan', 'deep'] as const;
const MAKEUP_STYLES = ['natural', 'glam', 'soft', 'bold'] as const;
const CONCERN_OPTIONS = [
  'acne',
  'aging',
  'dark_spots',
  'redness',
  'dryness',
  'large_pores',
  'uneven_texture',
];
const SCENT_OPTIONS = ['floral', 'citrus', 'woody', 'fresh', 'sweet', 'oriental'];

const LABELS: Record<string, TranslationKey> = {
  oily: 'beautyProfile.opt.oily',
  dry: 'beautyProfile.opt.dry',
  combination: 'beautyProfile.opt.combination',
  sensitive: 'beautyProfile.opt.sensitive',
  normal: 'beautyProfile.opt.normal',
  straight: 'beautyProfile.opt.straight',
  wavy: 'beautyProfile.opt.wavy',
  curly: 'beautyProfile.opt.curly',
  coily: 'beautyProfile.opt.coily',
  short: 'beautyProfile.opt.short',
  medium: 'beautyProfile.opt.medium',
  long: 'beautyProfile.opt.long',
  fair: 'beautyProfile.opt.fair',
  olive: 'beautyProfile.opt.olive',
  tan: 'beautyProfile.opt.tan',
  deep: 'beautyProfile.opt.deep',
  natural: 'beautyProfile.opt.natural',
  glam: 'beautyProfile.opt.glam',
  soft: 'beautyProfile.opt.soft',
  bold: 'beautyProfile.opt.bold',
};

export default function BeautyProfilePage(): JSX.Element {
  const { t } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.beautyProfile.get.useQuery();
  const upsertMut = api.beautyProfile.upsert.useMutation({
    onSuccess: () => {
      refetch();
      addToast('success', t('beautyProfile.savedToast'));
    },
  });

  const [skinType, setSkinType] = useState('');
  const [hairType, setHairType] = useState('');
  const [hairLength, setHairLength] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [makeupStyle, setMakeupStyle] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [scents, setScents] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (data) {
      setSkinType(data.skinType || '');
      setHairType(data.hairType || '');
      setHairLength(data.hairLength || '');
      setSkinTone(data.skinTone || '');
      setMakeupStyle(data.makeupStyle || '');
      setConcerns(data.concerns || []);
      setScents(data.preferredScents || []);
      setNotes(data.notes || '');
    }
  }, [data]);

  const toggle = (arr: string[], set: (a: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSave = () =>
    upsertMut.mutate({
      skinType: (skinType || undefined) as (typeof SKIN_TYPES)[number] | undefined,
      hairType: (hairType || undefined) as (typeof HAIR_TYPES)[number] | undefined,
      hairLength: (hairLength || undefined) as (typeof HAIR_LENGTHS)[number] | undefined,
      skinTone: (skinTone || undefined) as (typeof SKIN_TONES)[number] | undefined,
      makeupStyle: (makeupStyle || undefined) as (typeof MAKEUP_STYLES)[number] | undefined,
      concerns: concerns.length ? concerns : undefined,
      preferredScents: scents.length ? scents : undefined,
      notes: notes || undefined,
    });

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('beautyProfile.title')}
        </h1>
        <p className="text-sm text-text-secondary">{t('beautyProfile.subtitle')}</p>

        {isLoading ? (
          <FormSkeleton fields={5} />
        ) : isError ? (
          <ErrorAlert message={t('beautyProfile.loadError')} onRetry={() => refetch()} />
        ) : (
          <div className="space-y-6">
            <Section
              title={t('beautyProfile.sectionSkinType')}
              options={[...SKIN_TYPES]}
              selected={skinType}
              setSelected={setSkinType}
            />
            <Section
              title={t('beautyProfile.sectionHairType')}
              options={[...HAIR_TYPES]}
              selected={hairType}
              setSelected={setHairType}
            />
            <Section
              title={t('beautyProfile.sectionHairLength')}
              options={[...HAIR_LENGTHS]}
              selected={hairLength}
              setSelected={setHairLength}
            />
            <Section
              title={t('beautyProfile.sectionSkinTone')}
              options={[...SKIN_TONES]}
              selected={skinTone}
              setSelected={setSkinTone}
            />
            <Section
              title={t('beautyProfile.sectionMakeupStyle')}
              options={[...MAKEUP_STYLES]}
              selected={makeupStyle}
              setSelected={setMakeupStyle}
            />

            <Card padding="md">
              <h3 className="mb-3 font-semibold text-text-primary dark:text-gray-100">
                {t('beautyProfile.concernsTitle')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {CONCERN_OPTIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => toggle(concerns, setConcerns, o)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${concerns.includes(o) ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary dark:bg-gray-800'}`}
                  >
                    {LABELS[o] ? t(LABELS[o]) : o}
                  </button>
                ))}
              </div>
            </Card>

            <Card padding="md">
              <h3 className="mb-3 font-semibold text-text-primary dark:text-gray-100">
                {t('beautyProfile.scentsTitle')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {SCENT_OPTIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => toggle(scents, setScents, o)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${scents.includes(o) ? 'bg-accent-500 text-white' : 'bg-surface-muted text-text-secondary dark:bg-gray-800'}`}
                  >
                    {LABELS[o] ? t(LABELS[o]) : o}
                  </button>
                ))}
              </div>
            </Card>

            <Card padding="md">
              <h3 className="mb-2 font-semibold text-text-primary dark:text-gray-100">
                {t('beautyProfile.notesTitle')}
              </h3>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('beautyProfile.notesPlaceholder')}
              />
            </Card>

            <Button onClick={handleSave} loading={upsertMut.isPending} className="w-full" size="lg">
              {t('beautyProfile.saveButton')}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Section({
  title,
  options,
  selected,
  setSelected,
}: {
  title: string;
  options: readonly string[];
  selected: string;
  setSelected: (v: string) => void;
}): JSX.Element {
  const { t } = useLocale();
  return (
    <Card padding="md">
      <h3 className="mb-3 font-semibold text-text-primary dark:text-gray-100">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => setSelected(selected === o ? '' : o)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selected === o ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
          >
            {LABELS[o] ? t(LABELS[o]) : o}
          </button>
        ))}
      </div>
    </Card>
  );
}
