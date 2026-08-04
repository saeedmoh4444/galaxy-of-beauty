'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

const SKIN_TYPES = ['oily', 'dry', 'combination', 'sensitive', 'normal'] as const;
const HAIR_TYPES = ['straight', 'wavy', 'curly', 'coily'] as const;
const HAIR_LENGTHS = ['short', 'medium', 'long'] as const;
const SKIN_TONES = ['fair', 'medium', 'olive', 'tan', 'deep'] as const;
const MAKEUP_STYLES = ['natural', 'glam', 'soft', 'bold'] as const;
const CONCERN_OPTIONS = ['acne', 'aging', 'dark_spots', 'redness', 'dryness', 'large_pores', 'uneven_texture'];
const SCENT_OPTIONS = ['floral', 'citrus', 'woody', 'fresh', 'sweet', 'oriental'];

const LABELS: Record<string, string> = {
  oily: 'دهنية', dry: 'جافة', combination: 'مختلطة', sensitive: 'حساسة', normal: 'عادية',
  straight: 'مستقيم', wavy: 'مموج', curly: 'مجعد', coily: 'حلزوني',
  short: 'قصير', medium: 'متوسط', long: 'طويل',
  fair: 'فاتح', olive: 'زيتوني', tan: 'قمحي', deep: 'داكن',
  natural: 'طبيعي', glam: 'ساحر', soft: 'ناعم', bold: 'جريء',
};

export default function BeautyProfilePage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.beautyProfile.get.useQuery() as any;
  const upsertMut = api.beautyProfile.upsert.useMutation({ onSuccess: () => { refetch(); addToast('success', 'تم حفظ ملفكِ الجمالي'); } });

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
    set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = () => upsertMut.mutate({ skinType: (skinType || undefined) as any, hairType: (hairType || undefined) as any, hairLength: (hairLength || undefined) as any, skinTone: (skinTone || undefined) as any, makeupStyle: (makeupStyle || undefined) as any, concerns: concerns.length ? concerns : undefined, preferredScents: scents.length ? scents : undefined, notes: notes || undefined });

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">💄 ملفي الجمالي</h1>
        <p className="text-sm text-text-secondary">ساعدينا في تقديم توصيات مخصصة لكِ عن طريق إكمال ملفكِ الجمالي</p>

        {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل تحميل الملف" onRetry={() => refetch()} /> : (
          <div className="space-y-6">
            <Section title="نوع البشرة" options={[...SKIN_TYPES]} selected={skinType} setSelected={setSkinType} />
            <Section title="نوع الشعر" options={[...HAIR_TYPES]} selected={hairType} setSelected={setHairType} />
            <Section title="طول الشعر" options={[...HAIR_LENGTHS]} selected={hairLength} setSelected={setHairLength} />
            <Section title="لون البشرة" options={[...SKIN_TONES]} selected={skinTone} setSelected={setSkinTone} />
            <Section title="أسلوب المكياج المفضل" options={[...MAKEUP_STYLES]} selected={makeupStyle} setSelected={setMakeupStyle} />

            <Card padding="md">
              <h3 className="mb-3 font-semibold text-text-primary dark:text-gray-100">المشاكل الجلدية</h3>
              <div className="flex flex-wrap gap-2">
                {CONCERN_OPTIONS.map(o => <button key={o} onClick={() => toggle(concerns, setConcerns, o)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${concerns.includes(o) ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary dark:bg-gray-800'}`}>{LABELS[o] || o}</button>)}
              </div>
            </Card>

            <Card padding="md">
              <h3 className="mb-3 font-semibold text-text-primary dark:text-gray-100">العطور المفضلة</h3>
              <div className="flex flex-wrap gap-2">
                {SCENT_OPTIONS.map(o => <button key={o} onClick={() => toggle(scents, setScents, o)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${scents.includes(o) ? 'bg-accent-500 text-white' : 'bg-surface-muted text-text-secondary dark:bg-gray-800'}`}>{LABELS[o] || o}</button>)}
              </div>
            </Card>

            <Card padding="md">
              <h3 className="mb-2 font-semibold text-text-primary dark:text-gray-100">ملاحظات إضافية</h3>
              <textarea className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي حساسية، تفضيلات خاصة، أو ملاحظات للفنية..." />
            </Card>

            <Button onClick={handleSave} loading={upsertMut.isPending} className="w-full" size="lg">💾 حفظ الملف الجمالي</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Section({ title, options, selected, setSelected }: { title: string; options: readonly string[]; selected: string; setSelected: (v: string) => void }): JSX.Element {
  return (
    <Card padding="md">
      <h3 className="mb-3 font-semibold text-text-primary dark:text-gray-100">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map(o => <button key={o} onClick={() => setSelected(selected === o ? '' : o)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selected === o ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'}`}>{LABELS[o] || o}</button>)}
      </div>
    </Card>
  );
}
