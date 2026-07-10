// ---------------------------------------------------------------------------
// Galaxy of Beauty — i18n Configuration
// ---------------------------------------------------------------------------

export const defaultLocale = 'ar';
export const supportedLocales = ['ar', 'en'] as const;
export type Locale = (typeof supportedLocales)[number];

export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

// ---- Common translation keys shared across web + mobile ----

export const sharedMessages = {
  // Buttons
  'button.save': { ar: 'حفظ', en: 'Save' },
  'button.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'button.delete': { ar: 'حذف', en: 'Delete' },
  'button.edit': { ar: 'تعديل', en: 'Edit' },
  'button.submit': { ar: 'إرسال', en: 'Submit' },
  'button.retry': { ar: 'إعادة المحاولة', en: 'Retry' },
  'button.close': { ar: 'إغلاق', en: 'Close' },
  'button.confirm': { ar: 'تأكيد', en: 'Confirm' },
  'button.back': { ar: 'رجوع', en: 'Back' },
  'button.next': { ar: 'التالي', en: 'Next' },
  'button.bookNow': { ar: 'احجزي الآن', en: 'Book Now' },

  // Auth
  'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'auth.register': { ar: 'إنشاء حساب', en: 'Register' },
  'auth.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'auth.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.forgotPassword': { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  'auth.noAccount': { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  'auth.hasAccount': { ar: 'لديك حساب؟', en: 'Already have an account?' },

  // States
  'state.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'state.error': { ar: 'حدث خطأ ما', en: 'Something went wrong' },
  'state.empty': { ar: 'لا توجد بيانات', en: 'No data found' },
  'state.noResults': { ar: 'لا توجد نتائج', en: 'No results' },
  'state.offline': { ar: 'أنت غير متصل بالإنترنت', en: 'You are offline' },

  // Navigation
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.services': { ar: 'الخدمات', en: 'Services' },
  'nav.bookings': { ar: 'الحجوزات', en: 'Bookings' },
  'nav.wallet': { ar: 'المحفظة', en: 'Wallet' },
  'nav.profile': { ar: 'الملف الشخصي', en: 'Profile' },
  'nav.notifications': { ar: 'الإشعارات', en: 'Notifications' },

  // Booking
  'booking.selectService': { ar: 'اختيار الخدمة', en: 'Select Service' },
  'booking.selectTechnician': { ar: 'اختيار الفنية', en: 'Select Technician' },
  'booking.selectTime': { ar: 'اختيار الوقت', en: 'Select Time' },
  'booking.confirm': { ar: 'تأكيد الحجز', en: 'Confirm Booking' },
  'booking.status.REQUESTED': { ar: 'قيد الانتظار', en: 'Requested' },
  'booking.status.ACCEPTED': { ar: 'مقبول', en: 'Accepted' },
  'booking.status.COMPLETED': { ar: 'مكتمل', en: 'Completed' },
  'booking.status.CANCELLED': { ar: 'ملغي', en: 'Cancelled' },
  'booking.status.REJECTED': { ar: 'مرفوض', en: 'Rejected' },

  // Wallet
  'wallet.balance': { ar: 'الرصيد', en: 'Balance' },
  'wallet.bonus': { ar: 'رصيد المكافآت', en: 'Bonus Balance' },
  'wallet.withdraw': { ar: 'سحب', en: 'Withdraw' },
  'wallet.transactions': { ar: 'المعاملات', en: 'Transactions' },

  // Misc
  'misc.sar': { ar: 'ر.س', en: 'SAR' },
  'misc.min': { ar: 'دقيقة', en: 'min' },
  'misc.rating': { ar: 'تقييم', en: 'Rating' },
  'misc.reviews': { ar: 'تقييمات', en: 'Reviews' },
  'misc.search': { ar: 'بحث', en: 'Search' },
  'misc.filter': { ar: 'تصفية', en: 'Filter' },
  'misc.sort': { ar: 'ترتيب', en: 'Sort' },
} as const;

export type TranslationKey = keyof typeof sharedMessages;

/**
 * Get a translated message. Falls back to key if not found.
 */
export function t(key: TranslationKey, locale: Locale): string {
  const msg = sharedMessages[key];
  if (!msg) return key;
  return msg[locale] ?? msg.ar;
}
