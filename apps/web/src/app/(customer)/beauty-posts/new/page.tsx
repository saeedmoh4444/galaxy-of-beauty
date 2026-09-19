'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, Button, Input, useToast } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function NewBeautyPostPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [productIds, setProductIds] = useState<number[]>([]);
  const [serviceIds, setServiceIds] = useState<number[]>([]);

  const uploadMut = api.uploads.uploadMedia.useMutation({
    onSuccess: (uploaded) => {
      setUploading(false);
      const url = (uploaded as { url?: string }).url;
      if (url) {
        setImageUrl(url);
        addToast('success', t('skin.uploaded'));
      } else {
        addToast('error', t('skin.uploadError'));
      }
    },
    onError: () => {
      setUploading(false);
      addToast('error', t('skin.uploadError'));
    },
  });
  const createMut = api.beautyPosts.create.useMutation({
    onSuccess: () => {
      addToast('success', t('beautyPosts.created'));
      router.push('/beauty-posts');
    },
    onError: () => addToast('error', t('beautyPosts.createError')),
  });

  const productsQ = api.marketplace.products.useQuery(
    { sortBy: 'popular', limit: 12 },
    { refetchOnWindowFocus: false },
  );
  const servicesQ = api.services.list.useQuery({ sort: 'popular', limit: 12 } as never, {
    refetchOnWindowFocus: false,
  });
  const products = ((productsQ.data as unknown as { items?: Array<Record<string, unknown>> })
    ?.items ?? []) as Array<Record<string, unknown>>;
  const services = ((servicesQ.data as unknown as { items?: Array<Record<string, unknown>> })
    ?.items ?? []) as Array<Record<string, unknown>>;

  const pickName = (nameJson: unknown): string => {
    const n = (nameJson ?? {}) as { ar?: string; en?: string };
    return locale === 'ar' ? (n.ar ?? '') : (n.en ?? '');
  };

  const toggleId = (list: number[], set: (v: number[]) => void, id: number) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('error', t('skin.uploadError'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploading(true);
      uploadMut.mutate({
        mediaType: 'image',
        file: { name: file.name, type: file.type, size: file.size, base64: String(reader.result) },
      });
    };
    reader.onerror = () => addToast('error', t('skin.uploadError'));
    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">{t('beautyPosts.new.title')}</h1>

        <Card padding="md">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={uploading}
            className="block w-full text-sm text-text-secondary file:me-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {uploading && <p className="mt-2 text-xs text-brand-600">{t('skin.uploading')}</p>}
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="mt-3 aspect-[4/3] w-full rounded-xl object-cover"
            />
          )}
          <div className="mt-3">
            <Input
              label={t('beautyPosts.new.caption')}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={300}
            />
          </div>
        </Card>

        <Card padding="md">
          <h3 className="mb-2 font-semibold text-text-primary">
            {t('beautyPosts.new.tagProducts')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <button
                key={p.id as number}
                onClick={() => toggleId(productIds, setProductIds, p.id as number)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${productIds.includes(p.id as number) ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary'}`}
              >
                {pickName(p.nameJson)}
              </button>
            ))}
          </div>
          <h3 className="mb-2 mt-4 font-semibold text-text-primary">
            {t('beautyPosts.new.tagServices')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <button
                key={s.id as number}
                onClick={() => toggleId(serviceIds, setServiceIds, s.id as number)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${serviceIds.includes(s.id as number) ? 'bg-accent-500 text-white' : 'bg-surface-muted text-text-secondary'}`}
              >
                {pickName(s.titleJson)}
              </button>
            ))}
          </div>
        </Card>

        <Button
          className="w-full"
          size="lg"
          loading={createMut.isPending}
          disabled={!imageUrl}
          onClick={() =>
            createMut.mutate({ imageUrl, caption: caption || undefined, productIds, serviceIds })
          }
        >
          {t('beautyPosts.new.publish')}
        </Button>
      </div>
    </DashboardLayout>
  );
}
