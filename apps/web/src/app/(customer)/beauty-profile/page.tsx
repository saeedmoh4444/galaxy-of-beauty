'use client';

import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, FormSkeleton, ErrorAlert, Button, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import {
  BEAUTY_PROFILE_OPTIONS,
  buildBeautyProfileInput,
  type TranslationKey,
} from '@galaxy/shared';
import { MeasurementHistory } from '@/components/wellness/MeasurementHistory';
import { BeautyDnaMatches } from '@/components/wellness/BeautyDnaMatches';

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
  cool: 'beautyProfile.opt.cool',
  warm: 'beautyProfile.opt.warm',
  neutral: 'beautyProfile.opt.neutral',
  oval: 'beautyProfile.opt.oval',
  round: 'beautyProfile.opt.round',
  square: 'beautyProfile.opt.square',
  heart: 'beautyProfile.opt.heart',
  diamond: 'beautyProfile.opt.diamond',
  natural: 'beautyProfile.opt.natural',
  glam: 'beautyProfile.opt.glam',
  soft: 'beautyProfile.opt.soft',
  bold: 'beautyProfile.opt.bold',
};

// Face-shape options share codes with hair lengths ('long') — separate map.
const FACE_SHAPE_LABELS: Record<string, TranslationKey> = {
  oval: 'beautyProfile.opt.oval',
  round: 'beautyProfile.opt.round',
  square: 'beautyProfile.opt.square',
  heart: 'beautyProfile.opt.heart',
  diamond: 'beautyProfile.opt.diamond',
  long: 'beautyProfile.opt.faceLong',
};

export default function BeautyProfilePage(): JSX.Element {
  const { t } = useLocale();
  const { addToast } = useToast();
  const { data, isLoading, isError, refetch } = api.beautyProfile.get.useQuery();
  const utils = api.useUtils();
  const upsertMut = api.beautyProfile.upsert.useMutation({
    onSuccess: () => {
      refetch();
      // 3.1 — matches read the profile; refresh them after every save.
      void utils.beautyDna.skinMatch.invalidate();
      void utils.beautyDna.hairMatch.invalidate();
      void utils.beautyDna.fragranceMatch.invalidate();
      addToast('success', t('beautyProfile.savedToast'));
    },
  });

  const [skinType, setSkinType] = useState('');
  const [hairType, setHairType] = useState('');
  const [hairLength, setHairLength] = useState('');
  const [skinTone, setSkinTone] = useState('');
  // 3.1 — Skin/Hair Match inputs (also set by the skin-analysis bridge).
  const [undertone, setUndertone] = useState('');
  const [faceShape, setFaceShape] = useState('');
  const [makeupStyle, setMakeupStyle] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [scents, setScents] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  // E3 — fitness measurements + goals.
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (data) {
      setSkinType(data.skinType || '');
      setHairType(data.hairType || '');
      setHairLength(data.hairLength || '');
      setSkinTone(data.skinTone || '');
      setUndertone(data.undertone || '');
      setFaceShape(data.faceShape || '');
      setMakeupStyle(data.makeupStyle || '');
      setConcerns(data.concerns || []);
      setScents(data.preferredScents || []);
      setNotes(data.notes || '');
      const m = (data.measurements ?? {}) as Record<string, number>;
      setHeightCm(m.heightCm ? String(m.heightCm) : '');
      setWeightKg(m.weightKg ? String(m.weightKg) : '');
      setWaistCm(m.waistCm ? String(m.waistCm) : '');
      setFitnessGoals(data.fitnessGoals || []);
    }
  }, [data]);

  const toggle = (arr: string[], set: (a: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSave = () =>
    upsertMut.mutate(
      buildBeautyProfileInput({
        skinType,
        hairType,
        hairLength,
        skinTone,
        undertone,
        faceShape,
        makeupStyle,
        concerns,
        scents,
        notes,
        heightCm,
        weightKg,
        waistCm,
        fitnessGoals,
      }),
    );

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('beautyProfile.title')}</h1>
        <p className="text-sm text-text-secondary">{t('beautyProfile.subtitle')}</p>

        {isLoading ? (
          <FormSkeleton fields={5} />
        ) : isError ? (
          <ErrorAlert message={t('beautyProfile.loadError')} onRetry={() => refetch()} />
        ) : (
          <div className="space-y-6">
            <Section
              title={t('beautyProfile.sectionSkinType')}
              options={BEAUTY_PROFILE_OPTIONS.skinTypes}
              selected={skinType}
              setSelected={setSkinType}
            />
            <Section
              title={t('beautyProfile.sectionHairType')}
              options={BEAUTY_PROFILE_OPTIONS.hairTypes}
              selected={hairType}
              setSelected={setHairType}
            />
            <Section
              title={t('beautyProfile.sectionHairLength')}
              options={BEAUTY_PROFILE_OPTIONS.hairLengths}
              selected={hairLength}
              setSelected={setHairLength}
            />
            <Section
              title={t('beautyProfile.sectionSkinTone')}
              options={BEAUTY_PROFILE_OPTIONS.skinTones}
              selected={skinTone}
              setSelected={setSkinTone}
            />
            {/* 3.1 — undertone + face shape feed Skin/Hair Match */}
            <Section
              title={t('beautyProfile.sectionUndertone')}
              options={BEAUTY_PROFILE_OPTIONS.undertones}
              selected={undertone}
              setSelected={setUndertone}
            />
            <Section
              title={t('beautyProfile.sectionFaceShape')}
              options={BEAUTY_PROFILE_OPTIONS.faceShapes}
              selected={faceShape}
              setSelected={setFaceShape}
              labelMap={FACE_SHAPE_LABELS}
            />
            <Section
              title={t('beautyProfile.sectionMakeupStyle')}
              options={BEAUTY_PROFILE_OPTIONS.makeupStyles}
              selected={makeupStyle}
              setSelected={setMakeupStyle}
            />

            <Card padding="md">
              <h3 className="mb-3 font-semibold text-text-primary">
                {t('beautyProfile.concernsTitle')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {BEAUTY_PROFILE_OPTIONS.concerns.map((o) => (
                  <button
                    key={o}
                    onClick={() => toggle(concerns, setConcerns, o)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${concerns.includes(o) ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary'}`}
                  >
                    {LABELS[o] ? t(LABELS[o]) : o}
                  </button>
                ))}
              </div>
            </Card>

            <Card padding="md">
              <h3 className="mb-3 font-semibold text-text-primary">
                {t('beautyProfile.scentsTitle')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {BEAUTY_PROFILE_OPTIONS.scents.map((o) => (
                  <button
                    key={o}
                    onClick={() => toggle(scents, setScents, o)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${scents.includes(o) ? 'bg-accent-500 text-white' : 'bg-surface-muted text-text-secondary'}`}
                  >
                    {LABELS[o] ? t(LABELS[o]) : o}
                  </button>
                ))}
              </div>
            </Card>

            <Card padding="md">
              <h3 className="mb-2 font-semibold text-text-primary">
                {t('beautyProfile.notesTitle')}
              </h3>
              <textarea
                className="w-full rounded-lg border border-edge p-3 text-sm bg-surface-elevated"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('beautyProfile.notesPlaceholder')}
              />
            </Card>

            {/* E3 — fitness measurements + goals */}
            <Card padding="md">
              <h3 className="mb-3 font-semibold text-text-primary">
                {t('profile.measurements.title')}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label={t('profile.measurements.height')}
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
                <Input
                  label={t('profile.measurements.weight')}
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
                <Input
                  label={t('profile.measurements.waist')}
                  type="number"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                />
              </div>
              <p className="mb-2 mt-4 text-sm font-semibold">{t('profile.measurements.goals')}</p>
              <div className="flex flex-wrap gap-2">
                {fitnessGoals.map((g) => (
                  <button
                    key={g}
                    onClick={() => setFitnessGoals(fitnessGoals.filter((x) => x !== g))}
                    className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {g} ✕
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder={t('profile.measurements.goals-hint')}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (goalInput.trim() && !fitnessGoals.includes(goalInput.trim())) {
                      setFitnessGoals([...fitnessGoals, goalInput.trim()]);
                      setGoalInput('');
                    }
                  }}
                >
                  +
                </Button>
              </div>
            </Card>

            {/* E4b — measurement history (logs + progress) */}
            <MeasurementHistory />

            {/* 3.1 Beauty DNA — Skin/Hair/Fragrance matches */}
            <BeautyDnaMatches />

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
  labelMap = LABELS,
}: {
  title: string;
  options: readonly string[];
  selected: string;
  setSelected: (v: string) => void;
  labelMap?: Record<string, TranslationKey>;
}): JSX.Element {
  const { t } = useLocale();
  return (
    <Card padding="md">
      <h3 className="mb-3 font-semibold text-text-primary">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => setSelected(selected === o ? '' : o)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selected === o ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary hover:bg-surface-muted dark:hover:bg-gray-700'}`}
          >
            {labelMap[o] ? t(labelMap[o]) : o}
          </button>
        ))}
      </div>
    </Card>
  );
}
