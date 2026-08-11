'use client';

import { cn } from '@galaxy/shared';

/**
 * Parent Approval Badge — signals teen services requiring parental consent.
 * From Phase W7: Mother-Daughter & Family — Girls' First Beauty.
 *
 * Usage:
 *   <DadApprovalBadge serviceName="درس مكياج" parentApproved={false} />
 */

interface DadApprovalBadgeProps {
  serviceName: string;
  parentApproved?: boolean;
  parentName?: string;
  age?: number;
  onRequestApproval?: () => void;
  className?: string;
}

export function DadApprovalBadge({
  serviceName,
  parentApproved = false,
  parentName = 'ولي الأمر',
  age,
  onRequestApproval,
  className = '',
}: DadApprovalBadgeProps): JSX.Element {
  const needsApproval = age !== undefined && age < 18;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        parentApproved
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30'
          : 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {parentApproved ? '✅' : '👨‍👩‍👧'}
          </span>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
              {serviceName}
            </h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              {parentApproved ? 'تمت الموافقة من ولي الأمر' : `تحتاج موافقة ${parentName}`}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
            parentApproved
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
          )}
        >
          {parentApproved ? '✅ موافق' : '⏳ بانتظار'}
        </span>
      </div>

      {/* Age context */}
      {age !== undefined && (
        <div className="mt-2 rounded-lg bg-white/60 p-2 text-center dark:bg-black/20">
          <p className="text-[10px] text-text-secondary dark:text-gray-300">
            👧 {age} سنة — {needsApproval ? 'مطلوب موافقة ولي الأمر' : 'لا تحتاج موافقة'}
          </p>
        </div>
      )}

      {/* Approval flow */}
      {!parentApproved && (
        <>
          <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-black/20">
            <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
              📱 كيف يحصل ولي الأمر على الموافقة؟
            </p>
            <div className="mt-1 space-y-0.5 text-[10px] text-text-secondary dark:text-gray-300">
              <p>1. نرسل رابط الموافقة لجوال {parentName}</p>
              <p>2. يضغط على الرابط ويوافق</p>
              <p>3. يتم تأكيد الحجز فوراً</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestApproval}
            className="mt-2 w-full rounded-xl bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
          >
            أرسلي طلب الموافقة 📲
          </button>
        </>
      )}

      {parentApproved && (
        <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-center dark:bg-emerald-950">
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
            🎉 تمت الموافقة — احجزي جلستكِ الآن
          </p>
        </div>
      )}

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        👨‍👩‍👧 سلامتِك وراحتكِ هي أولويتنا دائماً
      </p>
    </div>
  );
}
