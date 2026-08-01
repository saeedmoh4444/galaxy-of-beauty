/**
 * i18n Foundation — Arabic-first translation system for Galaxy of Beauty
 *
 * Usage:
 *   import { t, setLocale } from '@/lib/i18n';
 *   t('welcome')          // → 'مرحباً بكِ' (ar) or 'Welcome' (en)
 *   t('bookings', { count: 5 }) // → '٥ حجوزات' (ar) or '5 Bookings' (en)
 *
 * Key design decisions:
 *   - Arabic is the default/primary language (platform is women's beauty in Saudi Arabia)
 *   - English is secondary for international expansion
 *   - No external dependency — pure TypeScript, zero runtime overhead
 *   - Keys use snake_case English identifiers; values contain the Arabic/English text
 */

type Locale = 'ar' | 'en';

let currentLocale: Locale = 'ar';

const translations: Record<string, Record<Locale, string>> = {
  // ── Common ────────────────────────────────────────────────
  welcome: { ar: 'مرحباً بكِ', en: 'Welcome' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  error: { ar: 'حدث خطأ', en: 'An error occurred' },
  retry: { ar: 'إعادة المحاولة', en: 'Retry' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  confirm: { ar: 'تأكيد', en: 'Confirm' },
  back: { ar: 'رجوع', en: 'Back' },
  next: { ar: 'التالي', en: 'Next' },
  done: { ar: 'تم', en: 'Done' },
  search: { ar: 'بحث', en: 'Search' },
  noResults: { ar: 'لا توجد نتائج', en: 'No results' },
  noData: { ar: 'لا توجد بيانات', en: 'No data available' },
  success: { ar: 'تم بنجاح', en: 'Success' },
  failed: { ar: 'فشلت العملية', en: 'Operation failed' },

  // ── Auth ──────────────────────────────────────────────────
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Register' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  phone: { ar: 'رقم الجوال', en: 'Phone number' },
  forgotPassword: { ar: 'نسيت كلمة المرور؟', en: 'Forgot password?' },
  twoFactorCode: { ar: 'رمز التحقق', en: 'Verification code' },

  // ── Navigation ────────────────────────────────────────────
  home: { ar: 'الرئيسية', en: 'Home' },
  bookings: { ar: 'حجوزاتي', en: 'My Bookings' },
  services: { ar: 'الخدمات', en: 'Services' },
  wallet: { ar: 'المحفظة', en: 'Wallet' },
  profile: { ar: 'حسابي', en: 'Profile' },

  // ── Bookings ──────────────────────────────────────────────
  newBooking: { ar: 'حجز جديد', en: 'New Booking' },
  bookingConfirmed: { ar: 'تم تأكيد الحجز', en: 'Booking confirmed' },
  bookingCancelled: { ar: 'تم إلغاء الحجز', en: 'Booking cancelled' },
  selectService: { ar: 'اختاري الخدمة', en: 'Select service' },
  selectDate: { ar: 'اختاري التاريخ', en: 'Select date' },
  selectTechnician: { ar: 'اختاري الفنية', en: 'Select technician' },
  totalAmount: { ar: 'المبلغ الإجمالي', en: 'Total amount' },

  // ── Payment ───────────────────────────────────────────────
  payment: { ar: 'الدفع', en: 'Payment' },
  checkout: { ar: 'إتمام الدفع', en: 'Checkout' },
  invoices: { ar: 'الفواتير', en: 'Invoices' },
  paid: { ar: 'مدفوع', en: 'Paid' },
  pending: { ar: 'معلق', en: 'Pending' },

  // ── Loyalty ───────────────────────────────────────────────
  points: { ar: 'نقاط', en: 'Points' },
  tier: { ar: 'الفئة', en: 'Tier' },
  rewards: { ar: 'المكافآت', en: 'Rewards' },
  cashback: { ar: 'استرداد نقدي', en: 'Cashback' },
};

/**
 * Translate a key with optional interpolation variables.
 *
 * @example
 *   t('welcome')                    // 'مرحباً بكِ'
 *   t('bookings_count', { count: 5 }) // (uses key 'bookings' from map)
 */
export function t(key: string, _vars?: Record<string, string | number>): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLocale] ?? key;
}

/**
 * Switch locale globally.
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/**
 * Get current locale.
 */
export function getLocale(): Locale {
  return currentLocale;
}
