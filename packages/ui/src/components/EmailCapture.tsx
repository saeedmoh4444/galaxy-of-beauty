'use client';

import { useState } from 'react';
import { Button } from './Button';

/**
 * Email capture popup/inline form for lead generation.
 * Offers a first-booking discount in exchange for email.
 *
 * Usage:
 *   <EmailCapture discount="10%" onSubmit={(email) => { ... }} />
 */

interface EmailCaptureProps {
  discount?: string;
  onSubmit: (email: string) => void;
  onDismiss?: () => void;
  successTitle?: string;
  discountCodeLabel?: string;
  useCodeText?: string;
  discountTitlePrefix?: string;
  firstBookingText?: string;
  placeholder?: string;
  submitButtonText?: string;
  laterText?: string;
  className?: string;
}

export function EmailCapture({
  discount = '١٠٪',
  onSubmit,
  onDismiss,
  className = '',
  successTitle = 'تم التسجيل بنجاح!',
  discountCodeLabel = 'كود الخصم: ',
  useCodeText = 'استخدميه في أول حجز لكِ',
  discountTitlePrefix = 'احصلي على خصم ',
  firstBookingText = 'على أول حجز لكِ عند التسجيل',
  placeholder = 'بريدك الإلكتروني',
  submitButtonText = 'تسجيل',
  laterText = 'لاحقاً',
}: EmailCaptureProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-center text-white ${className}`}
    >
      {submitted ? (
        <div>
          <span className="text-4xl"></span>
          <h3 className="mt-3 text-lg font-bold">{successTitle}</h3>
          <p className="mt-1 text-sm text-brand-200">{discountCodeLabel}WELCOME10</p>
          <p className="mt-2 text-xs text-brand-300">{useCodeText}</p>
        </div>
      ) : (
        <div>
          <span className="text-4xl"></span>
          <h3 className="mt-3 text-lg font-bold">
            {discountTitlePrefix}
            {discount}
          </h3>
          <p className="mt-1 text-sm text-brand-200">{firstBookingText}</p>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg border-0 bg-white/20 px-3 py-2 text-sm text-white placeholder:text-white/60"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (email.includes('@')) {
                  onSubmit(email);
                  setSubmitted(true);
                }
              }}
            >
              {submitButtonText}
            </Button>
          </div>
          {onDismiss ? (
            <button onClick={onDismiss} className="mt-3 text-xs text-brand-300 hover:text-white">
              {laterText}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
