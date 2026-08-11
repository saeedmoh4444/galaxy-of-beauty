'use client';

import { Button } from './Button';
import { Modal } from './Modal';

/**
 * Confirm Dialog — for delete/cancel/logout confirmations.
 *
 * Usage:
 *   <ConfirmDialog open={show} title="تأكيد الحذف" message="هل أنت متأكدة؟"
 *     onConfirm={() => delete()} onCancel={() => setShow(false)} />
 */

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): JSX.Element {
  const confirmVariant =
    variant === 'danger'
      ? ('danger' as const)
      : variant === 'warning'
        ? ('secondary' as const)
        : ('primary' as const);

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="text-center">
        <span className="text-4xl">
          {variant === 'danger' ? '🗑️' : variant === 'warning' ? '⚠️' : '❓'}
        </span>
        <h3 className="mt-3 text-lg font-bold text-text-primary dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
