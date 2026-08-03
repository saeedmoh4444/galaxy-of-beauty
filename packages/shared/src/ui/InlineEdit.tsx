'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { KeyboardEvent, FocusEvent } from 'react';
import { cn } from '../utils/cn';

interface InlineEditProps {
  /** Current display value */
  value: string;
  /** Called with the new value when the user saves. Return the saved value or throw. */
  onSave: (newValue: string) => Promise<string>;
  /** Accessible label for screen readers */
  label: string;
  /** Input type — text, textarea for multiline, or number */
  type?: 'text' | 'textarea' | 'number';
  /** Placeholder shown when empty or during editing */
  placeholder?: string;
  /** Validate the input before saving. Return an error string or null. */
  validate?: (value: string) => string | null;
  /** Additional class names for the wrapper */
  className?: string;
  /** Disable editing */
  disabled?: boolean;
  /** Empty-state placeholder shown when value is empty */
  emptyText?: string;
}

/**
 * Inline editing component — click to edit, Enter to save, Escape to cancel.
 * Provides optimistic updates with rollback on failure.
 *
 * Usage:
 *   <InlineEdit
 *     value={userName}
 *     onSave={async (v) => { await api.updateName(v); return v; }}
 *     label="الاسم"
 *   />
 */
export function InlineEdit({
  value,
  onSave,
  label,
  type = 'text',
  placeholder,
  validate,
  className = '',
  disabled = false,
  emptyText = '—',
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync draft when external value changes
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for quick replacement
      if (type === 'text') {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [editing, type]);

  const handleSave = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      cancel();
      return;
    }

    // Client-side validation
    if (validate) {
      const validationError = validate(trimmed);
      if (validationError) {
        setError(validationError);
        inputRef.current?.focus();
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(trimmed);
      setEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } catch (err) {
      setError((err as Error).message || 'فشل الحفظ');
      setDraft(value); // Rollback
      inputRef.current?.focus();
    } finally {
      setSaving(false);
    }
  }, [draft, value, validate, onSave]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
    setError(null);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && type !== 'textarea') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    },
    [handleSave, cancel, type],
  );

  const handleBlur = useCallback(
    (_e: FocusEvent) => {
      // Small delay to allow Enter/Escape to fire first
      setTimeout(() => {
        if (editing) handleSave();
      }, 150);
    },
    [editing, handleSave],
  );

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {editing ? (
        <span className="relative inline-flex items-center">
          <InputComponent
            ref={inputRef as never}
            type={type === 'textarea' ? undefined : type}
            value={draft}
            onChange={(e: { target: { value: string } }) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={saving}
            placeholder={placeholder}
            aria-label={label}
            className={cn(
              'rounded-lg border border-brand-400 bg-white px-2 py-1 text-sm text-text-primary outline-none ring-2 ring-brand-200 transition-shadow',
              'focus:border-brand-500 focus:ring-brand-500',
              'disabled:opacity-50',
              'dark:bg-gray-900 dark:text-gray-100',
              type === 'textarea' ? 'min-h-[60px] resize-y' : 'min-w-[120px]',
            )}
            rows={type === 'textarea' ? 3 : undefined}
          />
          {saving && (
            <span className="ml-1.5 inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          )}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setDraft(value);
              setEditing(true);
            }
          }}
          disabled={disabled}
          className={cn(
            'group inline-flex items-center gap-1 rounded px-1 -mx-1 py-0.5 text-sm transition-colors',
            'hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            'disabled:cursor-not-allowed',
          )}
          aria-label={`${label}: ${value || emptyText}. اضغط للتعديل`}
        >
          <span className={cn(value ? 'text-text-primary' : 'text-text-tertiary italic')}>
            {value || emptyText}
          </span>
          <svg
            className="h-3.5 w-3.5 shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <path d="m15 5 4 4" />
          </svg>
          {justSaved && (
            <svg
              className="h-4 w-4 shrink-0 text-success animate-in fade-in duration-200"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              aria-label="تم الحفظ"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>
      )}

      {error && (
        <span className="ml-1 text-xs text-danger" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
