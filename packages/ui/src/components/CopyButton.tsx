'use client';

import { useState } from 'react';

/**
 * Copy to Clipboard button with feedback animation.
 *
 * Usage:
 *   <CopyButton text="GOB-NOURA001" />
 */

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'نسخ', className = '' }: CopyButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-lg border border-edge bg-surface-muted px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:bg-surface dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${copied ? 'border-green-400 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300' : ''} ${className}`}
    >
      {copied ? '✅ تم النسخ' : `📋 ${label}`}
    </button>
  );
}
