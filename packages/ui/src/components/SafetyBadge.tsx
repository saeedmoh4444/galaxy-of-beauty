'use client';

/**
 * Safety Badge — platform safety guarantees for women.
 * From Phase W1: Safety & Privacy.
 *
 * Usage:
 *   <SafetyBadge type="female_verified" />
 */

const SAFETY_TYPES: Record<string, { emoji: string; label: string; desc: string }> = {
  female_verified: { emoji: '✅', label: 'فنية موثقة', desc: 'تم التحقق من هويتها عبر مكالمة فيديو' },
  privacy_first: { emoji: '🔒', label: 'خصوصية تامة', desc: 'صوركِ ومعلوماتكِ محمية ولا تشارك' },
  safe_space: { emoji: '🛡️', label: 'مساحة آمنة', desc: 'منصة نسائية بالكامل — لا رجال' },
  secure_payment: { emoji: '💳', label: 'دفع آمن', desc: 'مشفّر بالكامل عبر PayFort' },
  emergency_support: { emoji: '🆘', label: 'دعم طارئ', desc: 'فريق دعم متاح ٢٤/٧ للطوارئ' },
  pdpl_compliant: { emoji: '📜', label: 'متوافقة مع PDPL', desc: 'نظام حماية البيانات الشخصية السعودي' },
};

interface SafetyBadgeProps {
  type: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function SafetyBadge({ type, size = 'sm', className = '' }: SafetyBadgeProps): JSX.Element | null {
  const s = SAFETY_TYPES[type];
  if (!s) return null;

  return (
    <div className={`flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950 ${className}`}>
      <span className="text-lg">{s.emoji}</span>
      <div>
        <p className="text-sm font-semibold text-green-800 dark:text-green-200">{s.label}</p>
        {size === 'md' ? <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">{s.desc}</p> : null}
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
      {types.map((type) => <SafetyBadge key={type} type={type} size="md" />)}
    </div>
  );
}
