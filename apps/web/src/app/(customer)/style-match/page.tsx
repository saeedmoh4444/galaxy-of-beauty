'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

const PALETTE_PRESETS = [
  { label: 'وردي', colors: ['#D4737C', '#F2A0B6', '#C4A38C'] },
  { label: 'ذهبي', colors: ['#D4A843', '#B76E79', '#E8D5B7'] },
  { label: 'بني', colors: ['#6B4423', '#CD853F', '#8B6914'] },
  { label: 'عنابي', colors: ['#722F37', '#673147', '#C41E3A'] },
  { label: 'مرجاني', colors: ['#E8735A', '#F4A460', '#DEB6AB'] },
  { label: 'طبيعي', colors: ['#DEB6AB', '#C4A38C', '#F2A0B6'] },
];

const CATEGORIES = [
  { key: '', nameAr: 'الكل', emoji: '' },
  { key: 'daily', nameAr: 'يومي', emoji: '️' },
  { key: 'evening', nameAr: 'سهرة', emoji: '' },
  { key: 'party', nameAr: 'حفلات', emoji: '' },
  { key: 'bridal', nameAr: 'عرايس', emoji: '' },
  { key: 'traditional', nameAr: 'تقليدي', emoji: '' },
];

export default function StyleMatchPage(): JSX.Element {
  const [customColors, setCustomColors] = useState<string[]>(['#D4737C']);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [searched, setSearched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const matchMut = api.styleMatch.match.useMutation();
  const [results, setResults] = useState<Array<Record<string, unknown>> | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setPhotoUrl(url);
    setSearched(false);
  };

  const addColor = () => {
    if (customColors.length < 5) setCustomColors([...customColors, '#C4A38C']);
  };
  const removeColor = (i: number) => {
    if (customColors.length > 1) setCustomColors(customColors.filter((_, idx) => idx !== i));
  };
  const updateColor = (i: number, hex: string) => {
    const c = [...customColors];
    c[i] = hex;
    setCustomColors(c);
  };
  const applyPreset = (colors: string[], label: string) => {
    setCustomColors(colors);
    setActivePreset(activePreset === label ? null : label);
  };

  const handleMatch = () => {
    setSearched(true);
    matchMut.mutate(
      { colors: customColors, category: category || undefined },
      { onSuccess: (data) => setResults(data as Array<Record<string, unknown>>) },
    );
  };

  const resultsList = results ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> Style Match</h1>
          <p className="mt-1 text-sm text-text-secondary">
            حمّلي صورة إطلالتكِ أو اختاري ألوانكِ المفضلة لاكتشاف إطلالات مشابهة
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — Photo Upload + Colors */}
          <div className="space-y-4">
            <Card padding="lg">
              <h3 className="font-bold mb-3"> حمّلي صورة</h3>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              {photoPreview && (
                <div className="mt-3 rounded-xl overflow-hidden h-40 bg-surface-muted dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL from URL.createObjectURL cannot be passed to next/image */}
                  <img src={photoPreview} alt="معاينة" className="h-full w-full object-cover" />
                </div>
              )}
            </Card>

            <Card padding="lg">
              <h3 className="font-bold mb-2"> الألوان ({customColors.length})</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {PALETTE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.colors, p.label)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${activePreset === p.label ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800 hover:bg-gray-200'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {p.colors.map((c) => (
                        <span
                          key={c}
                          className="inline-block h-3 w-3 rounded-full border border-white/30"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {customColors.map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => updateColor(i, e.target.value)}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0"
                    />
                    {customColors.length > 1 && (
                      <button
                        onClick={() => removeColor(i)}
                        className="text-text-tertiary hover:text-red-500 text-xs"
                      ></button>
                    )}
                  </div>
                ))}
                {customColors.length < 5 && (
                  <button
                    onClick={addColor}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-text-tertiary hover:border-brand-400 text-lg"
                  >
                    +
                  </button>
                )}
              </div>
            </Card>

            <div>
              <Button
                onClick={handleMatch}
                loading={matchMut.isPending}
                className="w-full"
                size="lg"
              >
                ابحثي عن إطلالات مشابهة
              </Button>
            </div>
          </div>

          {/* Right — Category filter */}
          <Card padding="lg">
            <h3 className="font-bold mb-3">️ نوع الإطلالة</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key === category ? '' : c.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${category === c.key ? 'bg-brand-600 text-white shadow-md' : category === '' && c.key === '' ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-muted dark:bg-gray-800 hover:bg-gray-200'}`}
                >
                  {c.emoji} {c.nameAr}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Results */}
        {matchMut.isPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : matchMut.isError ? (
          <ErrorAlert message="فشل البحث" onRetry={handleMatch} />
        ) : searched && resultsList.length === 0 ? (
          <EmptyState
            title="لا توجد إطلالات مطابقة"
            description="جربي تغيير الألوان أو نوع الإطلالة"
          />
        ) : resultsList.length > 0 ? (
          <div>
            <h3 className="font-bold text-lg mb-4"> إطلالات مشابهة</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resultsList.map((r: Record<string, unknown>) => (
                <Card
                  key={r.id as number}
                  padding="lg"
                  className="group hover:shadow-xl transition-all"
                >
                  <div className="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900 dark:to-purple-900 text-5xl">
                    {[
                      'daily',
                      'evening',
                      'party',
                      'bridal',
                      'summer',
                      'winter',
                      'traditional',
                    ].includes(r.category as string)
                      ? (
                          {
                            daily: '️',
                            evening: '',
                            party: '',
                            bridal: '',
                            summer: '',
                            winter: '️',
                            traditional: '',
                          } as Record<string, string>
                        )[r.category as string]
                      : ''}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-surface-muted dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium">
                        {r.style as string}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-green-600">
                          {r.matchPct as number}%
                        </span>
                        <span className="text-[10px] text-text-tertiary">تطابق</span>
                      </div>
                    </div>
                    <h3 className="mt-2 font-bold group-hover:text-brand-600 transition-colors">
                      {r.titleAr as string}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-text-secondary"> {r.rating as number}</span>
                      <div className="flex gap-0.5">
                        {(r.dominantColors as string[])?.map((c: string) => (
                          <span
                            key={c}
                            className="h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    {(r.products as string[])?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(r.products as string[]).map((p: string) => (
                          <span
                            key={p}
                            className="rounded bg-surface-muted dark:bg-gray-800 px-1.5 py-0.5 text-[10px] text-text-secondary"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    {(r.tutorialId as number) && (
                      <Link
                        href={`/tutorials/${r.tutorialId as number}`}
                        className="mt-3 inline-block"
                      >
                        <Button size="sm" variant="ghost">
                          شاهدي الدرس
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
