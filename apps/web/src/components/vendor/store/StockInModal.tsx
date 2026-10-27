'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { Modal, Button, Input } from '@galaxy/ui';
import { api } from '@/lib/trpc';
import { useLocale } from '@/components/LocaleProvider';

interface StockInProduct {
  id: number;
  nameAr?: string;
  nameEn?: string;
}

/** C2b — stock-in dialog: pick the base product or one of its variants,
 *  enter a quantity, increment. The barcode/QR flow shares the mutation. */
export function StockInModal({
  product,
  onClose,
}: {
  product: StockInProduct;
  onClose: () => void;
}): JSX.Element {
  const { t, locale } = useLocale();
  const variantsQ = api.vendorPortal.variants.useQuery({ productId: product.id });
  const variants = variantsQ.data ?? [];

  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<number | undefined>();
  const stockInMut = api.vendorPortal.stockIn.useMutation({
    onSuccess: () => {
      setQuantity(1);
      onClose();
    },
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={`${t('vendorPortal.stockin.title')} — ${product.nameAr ?? product.nameEn ?? ''}`}
    >
      <div className="space-y-3">
        <Input
          label={t('vendorPortal.stockin.quantity')}
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
        />
        {variants.length > 0 ? (
          <select
            value={variantId ?? ''}
            onChange={(e) => setVariantId(Number(e.target.value) || undefined)}
            className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
          >
            <option value="">{t('vendorPortal.stockin.base')}</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {(v.nameJson as { ar?: string; en?: string } | null)?.[
                  locale === 'ar' ? 'ar' : 'en'
                ] ?? `#${v.id}`}
              </option>
            ))}
          </select>
        ) : null}
        {stockInMut.isError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{stockInMut.error.message}</p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose}>
            {t('button.cancel')}
          </Button>
          <Button
            size="sm"
            loading={stockInMut.isPending}
            onClick={() => stockInMut.mutate({ productId: product.id, variantId, quantity })}
          >
            {t('vendorPortal.stockin.title')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
