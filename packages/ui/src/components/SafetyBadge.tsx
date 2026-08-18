'use client';

/**
 * Safety Badge — platform safety guarantees for women.
 * From Phase W1: Safety & Privacy.
 *
 * Usage:
 *   <SafetyBadge type="female_verified" />
 */

const SAFETY_TYPES: Record<
  string,
  { emoji: string; label: { ar: string; en: string }; desc: { ar: string; en: string } }
> = {
  female_verified: {
    emoji: '',
    label: { ar: 'فنية موثقة', en: 'Verified technician' },
    desc: { ar: 'تم التحقق من هويتها عبر مكالمة فيديو', en: 'Identity verified via video call' },
  },
  privacy_first: {
    emoji: '',
    label: { ar: 'خصوصية تامة', en: 'Full privacy' },
    desc: {
      ar: 'صوركِ ومعلوماتكِ محمية ولا تشارك',
      en: 'Your photos and info are protected and never shared',
    },
  },
  safe_space: {
    emoji: '️',
    label: { ar: 'مساحة آمنة', en: 'Safe space' },
    desc: { ar: 'منصة نسائية بالكامل — لا رجال', en: 'Women-only platform — no men' },
  },
  secure_payment: {
    emoji: '',
    label: { ar: 'دفع آمن', en: 'Secure payment' },
    desc: { ar: 'مشفّر بالكامل عبر PayFort', en: 'Fully encrypted via PayFort' },
  },
  emergency_support: {
    emoji: '🆘',
    label: { ar: 'دعم طارئ', en: 'Emergency support' },
    desc: { ar: 'فريق دعم متاح ٢٤/٧ للطوارئ', en: 'Support team available 24/7 for emergencies' },
  },
  pdpl_compliant: {
    emoji: '',
    label: { ar: 'متوافقة مع PDPL', en: 'PDPL compliant' },
    desc: { ar: 'نظام حماية البيانات الشخصية السعودي', en: 'Saudi Personal Data Protection Law' },
  },
};

interface SafetyBadgeProps {
  type: string;
  size?: 'sm' | 'md';
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  className?: string;
}

export function SafetyBadge({
  type,
  size = 'sm',
  className = '',
  locale = 'ar',
}: SafetyBadgeProps): JSX.Element | null {
  const s = SAFETY_TYPES[type];
  if (!s) return null;

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950 ${className}`}
    >
      <span className="text-lg">{s.emoji}</span>
      <div>
        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
          {s.label[locale]}
        </p>
        {size === 'md' ? (
          <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">{s.desc[locale]}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Safety Guarantees — full list of safety badges for landing page.
 */
export function SafetyGuarantees({ className = '' }: { className?: string }): JSX.Element {
  const types = ['female_verified', 'privacy_first', 'safe_space', 'secure_payment'];
  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {types.map((type) => (
        <SafetyBadge key={type} type={type} size="md" />
      ))}
    </div>
  );
}
