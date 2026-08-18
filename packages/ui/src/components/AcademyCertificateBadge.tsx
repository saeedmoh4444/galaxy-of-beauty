'use client';

import { cn } from '@galaxy/shared';

/**
 * Academy Certificate Badge — course completion certification from Galaxy Beauty Academy.
 * From Phase W6: Education & Empowerment — Paid Certifications.
 *
 * Usage:
 *   <AcademyCertificateBadge
 *     certificate={{ course: 'مكياج احترافي', level: 'professional', date: '2026-07' }}
 *   />
 */

type CertLevel = 'foundation' | 'professional' | 'master';

interface LevelDef {
  emoji: string;
  label: { ar: string; en: string };
  color: string;
  gradient: string;
}

const CERTS: Record<CertLevel, LevelDef> = {
  foundation: {
    emoji: '',
    label: { ar: 'أساسي', en: 'Foundation' },
    color: 'text-emerald-600 dark:text-emerald-300',
    gradient: 'from-emerald-500 to-teal-500',
  },
  professional: {
    emoji: '',
    label: { ar: 'احترافي', en: 'Professional' },
    color: 'text-blue-600 dark:text-blue-300',
    gradient: 'from-blue-500 to-sky-500',
  },
  master: {
    emoji: '',
    label: { ar: 'ماستر', en: 'Master' },
    color: 'text-purple-600 dark:text-purple-300',
    gradient: 'from-purple-500 to-violet-500',
  },
};

interface Certificate {
  course: string;
  level: CertLevel;
  date: string;
  /** Certificate ID for verification */
  certId?: string;
  /** Whether certificate is verified on blockchain */
  isBlockchainVerified?: boolean;
}

interface AcademyCertificateBadgeProps {
  certificate: Certificate;
  onShare?: () => void;
  onVerify?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Academy name shown under the title */
  academyName?: string;
  /** Label for the certificate ID field */
  certIdLabel?: string;
  /** Blockchain verification heading */
  verifiedTitle?: string;
  /** Blockchain verification body text */
  verifiedText?: string;
  /** Share button label */
  shareLabel?: string;
  /** Verify button label */
  verifyLabel?: string;
  /** Accreditation footnote */
  accreditationText?: string;
  /** Locale for internal level label strings */
  locale?: 'ar' | 'en';
}

export function AcademyCertificateBadge({
  certificate,
  onShare,
  onVerify,
  className = '',
  title = 'شهادة معتمدة',
  academyName = 'أكاديمية جالاكسي بيوتي',
  certIdLabel = 'رقم الشهادة',
  verifiedTitle = 'موثقة بتقنية البلوك تشين',
  verifiedText = 'شهادتكِ محمية ولا يمكن تزويرها',
  shareLabel = 'مشاركة',
  verifyLabel = 'تحقق',
  accreditationText = '️ معتمدة من المؤسسة العامة للتدريب التقني والمهني',
  locale = 'ar',
}: AcademyCertificateBadgeProps): JSX.Element {
  const level = CERTS[certificate.level];

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-5 dark:border-blue-900 dark:from-blue-950 dark:to-sky-950',
        className,
      )}
    >
      {/* Certificate seal */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-800 dark:to-sky-800">
          <span className="text-3xl" aria-hidden="true"></span>
        </div>
        <h4 className="mt-2 text-sm font-bold text-blue-800 dark:text-blue-200">{title}</h4>
        <p className="text-[10px] text-blue-500 dark:text-blue-400">{academyName}</p>
      </div>

      {/* Course name */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-xs font-bold text-text-primary dark:text-gray-100">
          {certificate.course}
        </p>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium',
              certificate.level === 'master'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : certificate.level === 'professional'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
            )}
          >
            {level.emoji} {level.label[locale]}
          </span>
          <span className="text-[10px] text-text-tertiary dark:text-gray-500">
            {certificate.date}
          </span>
        </div>
      </div>

      {/* Certificate ID */}
      {certificate.certId && (
        <div className="mt-2 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{certIdLabel}</p>
          <p className="text-xs font-mono font-bold text-text-primary dark:text-gray-100" dir="ltr">
            {certificate.certId}
          </p>
        </div>
      )}

      {/* Blockchain verification */}
      {certificate.isBlockchainVerified && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-emerald-950">
          <span className="text-xs" aria-hidden="true"></span>
          <div>
            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {verifiedTitle}
            </p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{verifiedText}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onShare}
          className="flex-1 rounded-xl bg-blue-600 py-2 text-[10px] font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          {shareLabel}
        </button>
        <button
          type="button"
          onClick={onVerify}
          className="flex-1 rounded-xl border border-blue-200 bg-white py-2 text-[10px] font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-gray-800 dark:text-blue-300"
        >
          {verifyLabel}
        </button>
      </div>

      {/* Accreditation */}
      <p className="mt-2 text-center text-[9px] text-blue-500 dark:text-blue-400">
        {accreditationText}
      </p>
    </div>
  );
}
