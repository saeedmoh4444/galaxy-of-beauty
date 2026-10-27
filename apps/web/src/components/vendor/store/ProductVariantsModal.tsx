'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { Modal, Button, Input, Card, formatCurrency } from '@galaxy/ui';
import { api } from '@/lib/trpc';
import { useLocale } from '@/components/LocaleProvider';

interface VariantProduct {
  id: number;
  price: number;
  nameAr?: string;
  nameEn?: string;
}

/** C1 — per-product variants manager: list, add, partial-edit and delete
 *  over the vendorPortal.variants family (ownership-guarded server-side). */
export function ProductVariantsModal({
  product,
  onClose,
}: {
  product: VariantProduct;
  onClose: () => void;
}): JSX.Element {
  const { t, locale } = useLocale();
  const q = api.vendorPortal.variants.useQuery({ productId: product.id });
  const variants = q.data ?? [];

  // Add form state (reset after a successful create).
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [sku, setSku] = useState('');
  const [delta, setDelta] = useState(0);
  const [stock, setStock] = useState(0);
  const [threshold, setThreshold] = useState(5);
  const [showForm, setShowForm] = useState(false);

  const addMut = api.vendorPortal.addVariant.useMutation({
    onSuccess: () => {
      setNameAr('');
      setNameEn('');
      setSku('');
      setDelta(0);
      setStock(0);
      setThreshold(5);
      setShowForm(false);
      void q.refetch();
    },
  });
  const updateMut = api.vendorPortal.updateVariant.useMutation({
    onSuccess: () => void q.refetch(),
  });
  const deleteMut = api.vendorPortal.deleteVariant.useMutation({
    onSuccess: () => void q.refetch(),
  });

  const canAdd = nameAr.trim().length > 0 && nameEn.trim().length > 0;

  return (
    <Modal
      open
      onClose={onClose}
      title={`${t('vendorPortal.variants.title')} — ${product.nameAr ?? product.nameEn ?? ''}`}
    >
      <div className="space-y-3">
        {variants.length === 0 && !q.isLoading ? (
          <p className="text-sm text-text-tertiary">{t('vendorPortal.variants.empty')}</p>
        ) : null}
        {variants.map((v) => {
          const label =
            (v.nameJson as { ar?: string; en?: string } | null)?.[locale === 'ar' ? 'ar' : 'en'] ??
            `#${v.id}`;
          const deltaNum = Number(v.priceDelta ?? 0);
          return (
            <Card key={v.id} padding="sm" className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold">
                  {label}
                  {v.sku ? <span className="ml-2 text-xs text-text-tertiary">{v.sku}</span> : null}
                </p>
                <p className="text-xs text-text-secondary">
                  {formatCurrency(product.price + deltaNum)}
                  {deltaNum !== 0 ? ` (${deltaNum > 0 ? '+' : ''}${deltaNum})` : ''} ·{' '}
                  {t('vendorPortal.stock')}: {v.stock ?? 0}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  label={t('vendorPortal.stock')}
                  type="number"
                  value={v.stock ?? 0}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isNaN(n)) return;
                    updateMut.mutate({ variantId: v.id, stock: n });
                  }}
                  className="w-24"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  title={t('vendorPortal.variants.active')}
                  onClick={() => updateMut.mutate({ variantId: v.id, isActive: !v.isActive })}
                >
                  {v.isActive ? '👁️' : '🚫'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMut.mutate({ variantId: v.id })}
                >
                  🗑️
                </Button>
              </div>
            </Card>
          );
        })}

        {!showForm ? (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            + {t('vendorPortal.variants.add')}
          </Button>
        ) : (
          <Card padding="md" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('vendorPortal.variants.nameAr')}
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
              <Input
                label={t('vendorPortal.variants.nameEn')}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
              <Input
                label={t('vendorPortal.variants.sku')}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              <Input
                label={t('vendorPortal.variants.delta')}
                type="number"
                value={delta}
                onChange={(e) => setDelta(parseInt(e.target.value, 10) || 0)}
              />
              <Input
                label={t('vendorPortal.stock')}
                type="number"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
              />
              <Input
                label={t('vendorPortal.variants.threshold')}
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 5)}
              />
            </div>
            {addMut.isError && (
              <p className="text-sm text-red-600 dark:text-red-400">{addMut.error.message}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                {t('button.cancel')}
              </Button>
              <Button
                size="sm"
                disabled={!canAdd}
                loading={addMut.isPending}
                onClick={() =>
                  addMut.mutate({
                    productId: product.id,
                    nameAr: nameAr.trim(),
                    nameEn: nameEn.trim(),
                    sku: sku.trim() || undefined,
                    priceDelta: delta,
                    stock,
                    lowStockThreshold: threshold,
                  })
                }
              >
                {t('vendorPortal.variants.add')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}
