/**
 * Shared labels, status maps, and role constants.
 * Single source of truth — import from here instead of duplicating across pages.
 */

export const BOOKING_STATUS_LABELS = {
  REQUESTED: 'قيد الطلب',
  ACCEPTED: 'مقبول',
  PAYMENT_AUTHORIZED: 'دفع معلق',
  CONFIRMED_OFFLINE: 'دفع نقدي',
  PAID: 'مدفوع',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغي',
  NO_SHOW: 'لم تحضر',
};

export const BOOKING_STATUS_COLORS = {
  COMPLETED: 'success',
  PAID: 'success',
  CANCELLED: 'error',
  REJECTED: 'error',
  NO_SHOW: 'error',
  REQUESTED: 'info',
  ACCEPTED: 'warning',
  PAYMENT_AUTHORIZED: 'warning',
  CONFIRMED_OFFLINE: 'warning',
  IN_PROGRESS: 'info',
};

export function getStatusColor(status) {
  return BOOKING_STATUS_COLORS[status] || 'default';
}

export const ROLE_LABELS = {
  CUSTOMER: 'عميلة',
  TECHNICIAN: 'متخصصة',
  ADMIN: 'مدير',
};

export const KYC_STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  VERIFIED: 'موثقة',
  REJECTED: 'مرفوضة',
  SUBMITTED: 'قيد المراجعة',
};

export const PAYOUT_STATUS_LABELS = {
  PENDING: 'معلق',
  PROCESSING: 'قيد المعالجة',
  COMPLETED: 'مكتمل',
  FAILED: 'فشل',
};
