'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import Image from 'next/image';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ColorItem {
  id: string;
  nameAr: string;
  nameEn: string;
  hex: string;
  category?: string;
}

interface ProductRec {
  id: number;
  nameAr: string;
  nameEn: string;
  price: number;
  imageUrl: string | null;
  brand: string | null;
}

type MakeupType = 'lips' | 'eyes' | 'blush' | 'nails';

const TYPE_LABELS: Record<MakeupType, { label: string; emoji: string }> = {
  lips: { label: 'أحمر شفاه', emoji: '' },
  eyes: { label: 'ظلال عيون', emoji: '️' },
  blush: { label: 'أحمر خدود', emoji: '' },
  nails: { label: 'أظافر', emoji: '' },
};

const TYPE_CATEGORIES: Record<MakeupType, 'lips' | 'eyes' | 'blush' | 'nails'> = {
  lips: 'lips',
  eyes: 'eyes',
  blush: 'blush',
  nails: 'nails',
};

// ---------------------------------------------------------------------------
// Camera + Canvas Hook
// ---------------------------------------------------------------------------
function useCamera(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  _canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment' = 'user') => {
      setCameraError('');
      setCameraReady(false);
      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          setFacing(mode);
        }
      } catch {
        setCameraError('تعذر الوصول للكاميرا — تأكدي من صلاحية الإذن');
      }
    },
    [videoRef],
  );

  const flipCamera = useCallback(() => {
    const next = facing === 'user' ? 'environment' : 'user';
    startCamera(next);
  }, [facing, startCamera]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    startCamera('user');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return { cameraReady, cameraError, facing, flipCamera, startCamera, stopCamera };
}

// ---------------------------------------------------------------------------
// Canvas drawing — applies color overlay on the face guide region
// ---------------------------------------------------------------------------
function drawOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  makeupType: MakeupType,
  colorHex: string,
  intensity: number,
) {
  ctx.clearRect(0, 0, width, height);
  if (intensity <= 0) return;

  const alpha = intensity / 100;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colorHex;

  // Face-guide based overlay regions (approximate positions)
  // These are relative to a centered face in the viewport
  const cx = width / 2;
  const cy = height / 2;
  const faceH = height * 0.38; // face height in the guide

  switch (makeupType) {
    case 'lips': {
      // Lips — lower center of face
      const lipY = cy + faceH * 0.38;
      const lipW = width * 0.16;
      const lipH = height * 0.032;
      ctx.beginPath();
      ctx.ellipse(cx, lipY, lipW, lipH, 0, 0, Math.PI * 2);
      ctx.fill();
      // Upper lip
      ctx.beginPath();
      ctx.ellipse(cx, lipY - lipH * 1.1, lipW * 0.86, lipH * 0.75, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'eyes': {
      // Eyes — upper face, left and right
      const eyeY = cy - faceH * 0.12;
      const eyeOffX = width * 0.1;
      const eyeW = width * 0.1;
      const eyeH = height * 0.038;
      // Left eye
      ctx.beginPath();
      ctx.ellipse(cx - eyeOffX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right eye
      ctx.beginPath();
      ctx.ellipse(cx + eyeOffX, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      // Crease shade
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.ellipse(cx - eyeOffX, eyeY - eyeH * 0.4, eyeW * 0.7, eyeH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + eyeOffX, eyeY - eyeH * 0.4, eyeW * 0.7, eyeH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'blush': {
      // Cheeks — mid face, left and right of nose
      const cheekY = cy + faceH * 0.08;
      const cheekOffX = width * 0.14;
      const cheekR = width * 0.1;
      ctx.globalAlpha = alpha * 0.6;
      // Left cheek
      ctx.beginPath();
      ctx.ellipse(cx - cheekOffX, cheekY, cheekR, cheekR * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right cheek
      ctx.beginPath();
      ctx.ellipse(cx + cheekOffX, cheekY, cheekR, cheekR * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'nails': {
      // Nails — shown at bottom of frame as hand guide
      const nailY = cy + faceH * 0.7;
      const nailW = width * 0.04;
      const nailH = height * 0.025;
      const nailsX = [cx - width * 0.1, cx - width * 0.05, cx, cx + width * 0.05, cx + width * 0.1];
      for (const nx of nailsX) {
        ctx.beginPath();
        ctx.ellipse(nx, nailY, nailW, nailH, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        // Nail bed
        ctx.fillStyle = '#F5E6D3';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.ellipse(nx, nailY - nailH * 0.1, nailW * 0.75, nailH * 0.6, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colorHex;
      }
      break;
    }
  }

  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Color Palette Component
// ---------------------------------------------------------------------------
function ColorPalette({
  colors,
  selectedId,
  onSelect,
}: {
  colors: ColorItem[];
  selectedId: string | null;
  onSelect: (c: ColorItem) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className={`group relative flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
            selectedId === c.id
              ? 'ring-2 ring-offset-1 ring-brand-500 scale-105 shadow-md'
              : 'hover:scale-105 hover:shadow-sm'
          }`}
          title={c.nameAr}
        >
          <div
            className="h-9 w-9 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110"
            style={{ backgroundColor: c.hex }}
          />
          <span className="text-[10px] text-text-secondary dark:text-gray-400 leading-tight text-center max-w-[48px] truncate">
            {c.nameAr}
          </span>
          {selectedId === c.id && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white"></span>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function VirtualTryOnPage(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { cameraReady, cameraError, facing, flipCamera, startCamera } = useCamera(
    videoRef,
    canvasRef,
  );
  const { data: palettes, isLoading: palettesLoading } = api.virtualTryOn.palettes.useQuery() as {
    data:
      { lips: ColorItem[]; eyes: ColorItem[]; blush: ColorItem[]; nails: ColorItem[] } | undefined;
    isLoading: boolean;
  };

  const [makeupType, setMakeupType] = useState<MakeupType>('lips');
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);
  const [intensity, setIntensity] = useState(70);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Product recommendations
  const recColor = selectedColor?.hex ?? '';
  const recCategory = TYPE_CATEGORIES[makeupType];
  const { data: products, isLoading: recsLoading } = api.virtualTryOn.recommendations.useQuery(
    { colorHex: recColor, category: recCategory },
    { enabled: !!selectedColor },
  ) as { data: ProductRec[] | undefined; isLoading: boolean };

  const saveSessionMut = api.virtualTryOn.saveSession.useMutation();

  // Canvas rendering loop
  useEffect(() => {
    if (!cameraReady || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const render = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Mirror for front camera
          if (facing === 'user') {
            ctx.save();
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, w, h);
            ctx.restore();
            // Draw overlay after mirror
            if (selectedColor) {
              const overlayCtx = canvas.getContext('2d');
              if (overlayCtx) {
                overlayCtx.save();
                overlayCtx.translate(w, 0);
                overlayCtx.scale(-1, 1);
                drawOverlay(overlayCtx, w, h, makeupType, selectedColor.hex, intensity);
                overlayCtx.restore();
              }
            }
          } else {
            ctx.drawImage(video, 0, 0, w, h);
            if (selectedColor) {
              drawOverlay(ctx, w, h, makeupType, selectedColor.hex, intensity);
            }
          }
        }
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [cameraReady, selectedColor, makeupType, intensity, facing]);

  // Color selection handler
  const handleColorSelect = useCallback((color: ColorItem) => {
    setSelectedColor((prev) => (prev?.id === color.id ? null : color));
  }, []);

  // Screenshot
  const takePhoto = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = w;
    snapCanvas.height = h;
    const ctx = snapCanvas.getContext('2d');
    if (!ctx) return;

    // Draw video
    if (facing === 'user') {
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current!, 0, 0, w, h);
      ctx.restore();
      if (selectedColor) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        drawOverlay(ctx, w, h, makeupType, selectedColor.hex, intensity);
        ctx.restore();
      }
    } else {
      ctx.drawImage(videoRef.current!, 0, 0, w, h);
      if (selectedColor) {
        drawOverlay(ctx, w, h, makeupType, selectedColor.hex, intensity);
      }
    }

    const url = snapCanvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(url);

    // Save session if logged in
    if (selectedColor) {
      saveSessionMut.mutate({
        makeupType,
        colorId: selectedColor.id,
        colorHex: selectedColor.hex,
        imageDataUrl: url,
      });
    }
  }, [facing, selectedColor, makeupType, intensity, saveSessionMut]);

  const typeKeys = Object.keys(TYPE_LABELS) as MakeupType[];
  const colors: ColorItem[] = palettes?.[makeupType] ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center sm:text-right">
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
            تجربة المكياج الافتراضية
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
            جربي ألوان المكياج مباشرة على وجهكِ قبل الشراء
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left sidebar — Controls */}
          <div className="space-y-4 lg:col-span-2">
            {/* Makeup Type Selector */}
            <Card padding="md">
              <h3 className="text-sm font-semibold text-text-primary dark:text-gray-300 mb-3">
                نوع المكياج
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {typeKeys.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setMakeupType(t);
                      setSelectedColor(null);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      makeupType === t
                        ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-300 dark:bg-brand-900 dark:text-brand-300'
                        : 'bg-surface-muted text-text-secondary hover:bg-surface-muted dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{TYPE_LABELS[t].emoji}</span>
                    {TYPE_LABELS[t].label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Color Palette */}
            <Card padding="md">
              <h3 className="text-sm font-semibold text-text-primary dark:text-gray-300 mb-3">
                الألوان{' '}
                {selectedColor && <span className="text-brand-600">— {selectedColor.nameAr}</span>}
              </h3>
              {palettesLoading ? (
                <div className="flex gap-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
                  ))}
                </div>
              ) : (
                <ColorPalette
                  colors={colors}
                  selectedId={selectedColor?.id ?? null}
                  onSelect={handleColorSelect}
                />
              )}
            </Card>

            {/* Intensity Slider */}
            <Card padding="md">
              <h3 className="text-sm font-semibold text-text-primary dark:text-gray-300 mb-3">
                الشفافية: <span className="text-brand-600">{intensity}%</span>
              </h3>
              <input
                type="range"
                min={10}
                max={100}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                <span>شفاف</span>
                <span>كثيف</span>
              </div>
            </Card>

            {/* Capture Button */}
            <Button onClick={takePhoto} disabled={!cameraReady} className="w-full" size="lg">
              التقطي صورة
            </Button>
          </div>

          {/* Right — Camera Viewfinder */}
          <div className="lg:col-span-3">
            <Card padding="none" className="overflow-hidden">
              <div ref={containerRef} className="relative aspect-[9/16] max-h-[70vh] bg-black">
                {/* Camera view */}
                {cameraReady ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`absolute inset-0 h-full w-full object-cover ${facing === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    {/* Canvas overlay for makeup */}
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                    />

                    {/* Face guide overlay */}
                    {!selectedColor && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-[65%] h-[55%] rounded-[50%] border-2 border-dashed border-white/40">
                          <div className="absolute top-[15%] left-[25%] w-[20%] h-[10%] rounded-full border border-white/25" />
                          <div className="absolute top-[15%] right-[25%] w-[20%] h-[10%] rounded-full border border-white/25" />
                          <div className="absolute bottom-[12%] left-[35%] w-[30%] h-[8%] rounded-full border border-white/25" />
                        </div>
                      </div>
                    )}

                    {/* Selected color indicator */}
                    {selectedColor && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-white text-xs backdrop-blur">
                        <div
                          className="h-4 w-4 rounded-full border border-white/50"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        {selectedColor.nameAr} · {intensity}%
                      </div>
                    )}

                    {/* Camera controls */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={flipCamera}
                        className="rounded-full bg-black/50 p-2 text-white text-sm backdrop-blur hover:bg-black/70 transition-colors"
                        title="قلب الكاميرا"
                      ></button>
                    </div>

                    {/* Camera error overlay */}
                    {cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="text-center p-6">
                          <p className="text-white text-lg mb-2"></p>
                          <p className="text-white/80 text-sm mb-3">{cameraError}</p>
                          <Button size="sm" onClick={() => startCamera('user')}>
                            إعادة المحاولة
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Captured photo preview */}
                    {capturedPhoto && (
                      <div className="absolute inset-0 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element -- canvas data: URL cannot be passed to next/image */}
                        <img
                          src={capturedPhoto}
                          alt="لقطة"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = capturedPhoto;
                              a.download = `galaxy-tryon-${Date.now()}.jpg`;
                              a.click();
                            }}
                            className="flex-1"
                          >
                            تحميل
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCapturedPhoto(null)}
                            className="flex-1 bg-white/20 text-white hover:bg-white/30"
                          >
                            إعادة التصوير
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <div className="animate-spin mx-auto mb-3 h-8 w-8 rounded-full border-2 border-white/30 border-t-white" />
                      <p className="text-sm">جاري تشغيل الكاميرا...</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Product Recommendations */}
        {selectedColor && (
          <Card padding="lg">
            <h3 className="text-lg font-bold text-text-primary dark:text-gray-100 mb-1">
              ️ منتجات مقترحة
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              منتجات تناسب درجة &ldquo;{selectedColor.nameAr}&rdquo; من متجرنا
            </p>
            {recsLoading ? (
              <GridSkeleton count={4} />
            ) : !products || products.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-4">
                لا توجد منتجات مطابقة حالياً — تصفحي متجرنا للمزيد
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((p) => (
                  <Link key={p.id} href={`/marketplace?product=${p.id}`}>
                    <Card
                      padding="md"
                      className="h-full transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    >
                      <div className="relative flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 mb-3">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.nameAr}
                            fill
                            className="rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-4xl"></span>
                        )}
                      </div>
                      {p.brand && (
                        <p className="text-[10px] font-medium text-brand-600 uppercase tracking-wide">
                          {p.brand}
                        </p>
                      )}
                      <h4 className="text-sm font-bold text-text-primary dark:text-gray-100 mt-0.5 line-clamp-1">
                        {p.nameAr}
                      </h4>
                      <p className="mt-1 text-sm font-extrabold text-brand-600">
                        {formatCurrency(p.price)} ر.س
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/marketplace">
                <Button variant="ghost" size="sm">
                  تصفحي المتجر كاملاً →
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Tips */}
        <Card
          padding="lg"
          className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 border-none"
        >
          <h3 className="font-bold text-text-primary dark:text-gray-100 mb-3"> نصائح للتجربة</h3>
          <div className="grid gap-2 text-sm text-text-secondary dark:text-gray-400 sm:grid-cols-2">
            <p> تأكدي من إضاءة وجهكِ جيداً للحصول على أفضل نتيجة</p>
            <p> التقطي صورة بعد اختيار اللون لمشاركتها مع صديقاتكِ</p>
            <p> جربي كل أنواع المكياج — شفاه، عيون، خدود، وأظافر</p>
            <p>️ بعد اختيار لونكِ المفضل، تصفحي المنتجات المتطابقة في متجرنا</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
