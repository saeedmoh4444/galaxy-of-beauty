'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { ReactNode, MouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { cn } from '@galaxy/shared';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/** CSS selector for all focusable elements inside a modal. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ── Focus trap ──────────────────────────────────────────
  const trapFocus = useCallback((e: ReactKeyboardEvent | KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = getFocusableElements(panel);
    if (focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      trapFocus(e);
    },
    [onClose, trapFocus],
  );

  // ── Open / close lifecycle ──────────────────────────────
  useEffect(() => {
    if (open) {
      // Store the currently focused element so we can restore later
      previousFocusRef.current = document.activeElement as HTMLElement | null;

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Move focus into the modal after the next paint
      const raf = requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (panel) {
          const focusable = getFocusableElements(panel);
          // Prefer the close button, then the first focusable, then the panel itself
          if (focusable.length > 0) {
            focusable[0]!.focus();
          } else {
            panel.focus();
          }
        }
      });

      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';

        // Restore focus to the element that triggered the modal
        requestAnimationFrame(() => {
          previousFocusRef.current?.focus();
          previousFocusRef.current = null;
        });
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleBackdropClick = (e: MouseEvent) => {
    if (closeOnBackdrop && e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-2xl bg-surface shadow-xl outline-none dark:bg-gray-900',
          'animate-in zoom-in-95 duration-200',
          sizeStyles[size],
          className,
        )}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute end-3 top-3 flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="إغلاق"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {(title || description) && (
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
