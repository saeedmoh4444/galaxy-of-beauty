'use client';

/**
 * Walkthrough — guided product tour with spotlight + tooltip card.
 *
 * Reusable across pages: steps anchor on CSS selectors; the component
 * dims the page (box-shadow hole), pulses a rose ring around the target,
 * and shows a positioned tooltip card (below/above, viewport-clamped —
 * numeric math only, so identical in RTL/LTR).
 *
 * A11y: role=dialog + aria-modal, aria-live step announcements, Escape
 * to skip, focus moved to the card on step change. prefers-reduced-motion
 * neutralizes the pulse via the global CSS rule.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../Button';

export interface WalkthroughStep {
  /** CSS selector for the anchor element (e.g. '[data-tour="book"]') */
  target: string;
  title: string;
  body: string;
}

interface WalkthroughProps {
  open: boolean;
  steps: WalkthroughStep[];
  /** Called when the user skips or completes (reason tells which) */
  onClose: (reason: 'complete' | 'skip') => void;
  /** Translated control labels */
  labels: {
    next: string;
    back: string;
    skip: string;
    done: string;
    /** '{current} من {total}' style progress — pass a template */
    progress: (current: number, total: number) => string;
  };
  /** Selector prefix to scope target lookup (defaults to document) */
  scope?: string;
}

const CARD_WIDTH = 384;
const GAP = 14;
const EDGE_PAD = 12;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function Walkthrough({
  open,
  steps,
  onClose,
  labels,
  scope = '',
}: WalkthroughProps): JSX.Element | null {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const resolveTarget = useCallback(
    (selector: string): HTMLElement | null => {
      try {
        return document.querySelector(`${scope} ${selector}`.trim()) as HTMLElement | null;
      } catch {
        return null;
      }
    },
    [scope],
  );

  // Advance to the next step with a valid, visible target; skips dead
  // steps automatically so a missing selector can never stall the tour.
  const settleStep = useCallback(
    (nextIndex: number): void => {
      let i = nextIndex;
      while (i < steps.length) {
        const target = resolveTarget(steps[i]!.target);
        if (target && target.getBoundingClientRect().width > 0) {
          // Instant scroll (reduced-motion-first): reading the rect after
          // scrollIntoView gives post-scroll coordinates, so the spotlight
          // never flashes at a stale position.
          target.scrollIntoView({ block: 'center', behavior: 'auto' });
          const r = target.getBoundingClientRect();
          setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
          setIndex(i);
          return;
        }
        i += 1;
      }
      onClose('complete');
    },
    [steps, resolveTarget, onClose],
  );

  // Reset + settle on the open transition only. settleStep is recreated
  // whenever a consumer passes an unstable onClose (e.g. an inline
  // function) — re-running this effect on every parent render while the
  // tour is open would yank the user back to step 1 mid-tour.
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current && steps.length > 0) settleStep(0);
    else if (!open) setIndex(0);
    prevOpen.current = open;
  }, [open, steps, settleStep]);

  // Escape = skip.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose('skip');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Move focus into the card on each step.
  useEffect(() => {
    if (open) cardRef.current?.focus();
  }, [open, index]);

  // Keep the spotlight glued to the target on resize.
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      const target = resolveTarget(steps[index]?.target ?? '');
      if (target) {
        const r = target.getBoundingClientRect();
        setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, index, steps, resolveTarget]);

  const cardPosition = useMemo(() => {
    if (!rect) return null;
    const EST_CARD_HEIGHT = 200;
    const targetBottom = rect.top + rect.height;
    // Prefer below the target; flip above when it would overflow.
    let top = targetBottom + GAP;
    if (top + EST_CARD_HEIGHT > window.innerHeight - EDGE_PAD) {
      top = Math.max(EDGE_PAD, rect.top - EST_CARD_HEIGHT - GAP);
    }
    const left = Math.max(EDGE_PAD, Math.min(rect.left, window.innerWidth - CARD_WIDTH - EDGE_PAD));
    return { top, left };
  }, [rect]);

  if (!open || !rect || !cardPosition) return null;

  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="tour">
      {/* interaction blocker (clicks outside the card do nothing) */}
      <div className="absolute inset-0" />

      {/* spotlight ring: transparent box + box-shadow "hole" + pulse */}
      <div
        aria-hidden
        className="animate-spotlight pointer-events-none absolute rounded-2xl"
        style={{
          left: rect.left - 8,
          top: rect.top - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        }}
      />

      {/* tooltip card */}
      <div
        ref={cardRef}
        tabIndex={-1}
        data-testid="tour-card"
        className="absolute w-full max-w-sm rounded-2xl border border-edge bg-surface-elevated p-5 shadow-xl shadow-brand-900/20 outline-none"
        style={{
          top: cardPosition.top,
          left: cardPosition.left,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-extrabold text-text-primary">{step?.title}</h3>
          <button
            data-testid="tour-skip"
            onClick={() => onClose('skip')}
            className="rounded-lg p-1 text-text-tertiary transition-colors hover:bg-surface-muted hover:text-text-secondary"
          >
            {labels.skip}
          </button>
        </div>

        <p aria-live="polite" className="mt-2 text-sm leading-relaxed text-text-secondary">
          {step?.body}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          {/* progress dots */}
          <div className="flex items-center gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-brand-600' : 'w-1.5 bg-edge'
                }`}
              />
            ))}
          </div>
          <span className="sr-only">{labels.progress(index + 1, steps.length)}</span>

          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                data-testid="tour-back"
                onClick={() => settleStep(index - 1)}
              >
                {labels.back}
              </Button>
            )}
            {isLast ? (
              <Button size="sm" data-testid="tour-done" onClick={() => onClose('complete')}>
                {labels.done}
              </Button>
            ) : (
              <Button size="sm" data-testid="tour-next" onClick={() => settleStep(index + 1)}>
                {labels.next}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
