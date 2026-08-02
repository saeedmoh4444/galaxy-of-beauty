'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

interface ProductData {
  found: boolean;
  message?: string;
  product?: {
    nameAr: string; nameEn: string; brand: string; category: string;
    safetyScore: number; concerns: string[]; ingredients: string[];
    allergens: string[]; safetyDetails?: Array<{ concern: string; tip: string }>;
  };
  alternatives?: Array<{ id: number; nameAr: string; price: number; brand: string; emoji: string }>;
}

const SAFETY_COLOR = (score: number) =>
  score >= 90 ? 'text-green-600' : score >= 75 ? 'text-amber-600' : 'text-red-600';
const SAFETY_BG = (score: number) =>
  score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-amber-500' : 'bg-red-500';
const SAFETY_LABEL = (score: number) =>
  score >= 90 ? 'آمن جداً' : score >= 75 ? 'مقبول' : 'يحتوي على مواد مثيرة للحساسية';

export default function ProductScannerPage(): JSX.Element {
  const [barcode, setBarcode] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: result, isLoading, isError, refetch } = api.productScanner.lookup.useQuery(
    { barcode },
    { enabled: barcode.length >= 8 },
  ) as { data: ProductData | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  // Barcode camera scan
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraOn(true);
      }
    } catch {
      setCameraError('تعذر الوصول للكاميرا — تأكدي من الصلاحية');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Manual barcode submit
  const handleLookup = () => {
    if (barcode.length < 8) return;
    refetch();
  };

  const product = result?.product;
  const alternatives = result?.alternatives ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🔍 فحص المنتجات</h1>
          <p className="mt-1 text-sm text-gray-500">امسحي الباركود أو ادخلي الرمز لمعرفة مكونات المنتج ومدى أمانه</p>
        </div>

        {/* Input — Camera or Manual */}
        <Card padding="lg">
          <div className="flex gap-2 mb-4">
            <Button variant={!cameraOn ? 'ghost' : undefined} size="sm" onClick={() => { if (cameraOn) stopCamera(); else startCamera(); }}>
              {cameraOn ? '📷 إيقاف' : '📷 مسح بالكاميرا'}
            </Button>
            <span className="text-xs text-gray-400 self-center">أو أدخلي الرمز يدوياً:</span>
          </div>

          {cameraOn && (
            <div className="relative mb-4 overflow-hidden rounded-xl bg-black">
              {cameraError ? (
                <div className="flex h-48 items-center justify-center text-white/60"><p>{cameraError}</p></div>
              ) : (
                <>
                  <video ref={videoRef} playsInline muted className="h-48 w-full object-cover" />
                  <div className="absolute inset-0 border-2 border-brand-400/60 m-8 rounded-lg" />
                  <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/70">وجّهي الباركود داخل الإطار</p>
                </>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.replace(/\D/g, '').slice(0, 20))}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="أدخلي الباركود (أرقام فقط)..."
              className="flex-1 rounded-lg border px-3 py-2.5 text-sm tracking-widest dark:border-gray-700 dark:bg-gray-800"
              dir="ltr"
            />
            <Button onClick={handleLookup} loading={isLoading} disabled={barcode.length < 8}>فحص 🔍</Button>
          </div>
        </Card>

        {/* Result */}
        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل البحث عن المنتج" onRetry={() => refetch()} />
        ) : result && !result.found ? (
          <EmptyState title="المنتج غير موجود" description={result.message ?? 'لم نجد هذا المنتج في قاعدة البيانات'} />
        ) : product ? (
          <>
            {/* Product Card */}
            <Card padding="lg" className="border-2 border-brand-200 dark:border-brand-800">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-purple-100 text-3xl dark:from-brand-900 dark:to-purple-900">
                  {product.category === 'skincare' ? '🧴' : product.category === 'makeup' ? '💄' : '💆‍♀️'}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{product.nameAr}</h2>
                  <p className="text-sm text-gray-500">{product.brand} · {product.nameEn}</p>
                  {/* Safety Score */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>مؤشر الأمان</span>
                        <span className={`font-bold ${SAFETY_COLOR(product.safetyScore)}`}>{product.safetyScore}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div className={`h-full rounded-full ${SAFETY_BG(product.safetyScore)}`} style={{ width: `${product.safetyScore}%` }} />
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${SAFETY_COLOR(product.safetyScore)} bg-${SAFETY_BG(product.safetyScore).replace('bg-', 'bg-')}/10`}>
                      {SAFETY_LABEL(product.safetyScore)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Concerns / Warnings */}
              {product.safetyDetails && product.safetyDetails.length > 0 && (
                <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950 p-4">
                  <h4 className="text-sm font-bold text-red-700 dark:text-red-300 mb-2">⚠️ تنبيهات</h4>
                  <div className="space-y-2">
                    {product.safetyDetails.map((d, i) => (
                      <div key={i} className="text-sm text-red-600 dark:text-red-400">{d.concern}: {d.tip}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div className="mt-4">
                <h4 className="text-sm font-bold mb-2">🧪 المكونات</h4>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((ing) => {
                    const isAllergen = product.allergens.includes(ing);
                    return (
                      <span key={ing} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isAllergen ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {ing} {isAllergen && '⚠️'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <Card padding="lg">
                <h3 className="font-bold text-lg mb-4">🔄 بدائل آمنة مقترحة</h3>
                <div className="space-y-3">
                  {alternatives.map((alt) => (
                    <div key={alt.id} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{alt.emoji}</span>
                        <div>
                          <p className="font-bold text-sm">{alt.nameAr}</p>
                          <p className="text-xs text-gray-500">{alt.brand}</p>
                        </div>
                      </div>
                      <Link href="/marketplace">
                        <Button size="sm" variant="ghost">{formatCurrency(alt.price)} ر.س →</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : null}

        {/* Quick Tips */}
        <Card padding="lg" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-none">
          <h3 className="font-bold mb-3">💡 نصائح لاختيار المنتجات</h3>
          <div className="grid gap-2 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
            <p>✅ اختاري منتجات خالية من البارابين والعطور</p>
            <p>✅ تأكدي من وجود واقي شمس في روتينك اليومي</p>
            <p>✅ ابحثي عن منتجات تحتوي على مكونات طبيعية</p>
            <p>✅ تجنبي المنتجات التي تحتوي على الكحول للبشرة الجافة</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
