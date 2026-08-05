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

  // Time
  'time.today': { ar: 'اليوم', en: 'Today' },
  'time.tomorrow': { ar: 'غداً', en: 'Tomorrow' },
  'time.yesterday': { ar: 'أمس', en: 'Yesterday' },
  'time.days': { ar: 'أيام', en: 'Days' },
  'time.hours': { ar: 'ساعات', en: 'Hours' },
  'time.minutes': { ar: 'دقائق', en: 'Minutes' },
  'time.seconds': { ar: 'ثواني', en: 'Seconds' },

  // Confirmations
  'confirm.delete': { ar: 'هل أنت متأكدة من الحذف؟', en: 'Are you sure you want to delete?' },
  'confirm.cancel': { ar: 'هل أنت متأكدة من الإلغاء؟', en: 'Are you sure you want to cancel?' },
  'confirm.logout': { ar: 'هل أنت متأكدة من تسجيل الخروج؟', en: 'Are you sure you want to logout?' },
  'confirm.unsaved': { ar: 'لديك تغييرات غير محفوظة', en: 'You have unsaved changes' },

  // Status
  'status.active': { ar: 'نشط', en: 'Active' },
  'status.inactive': { ar: 'غير نشط', en: 'Inactive' },
  'status.pending': { ar: 'قيد الانتظار', en: 'Pending' },
  'status.approved': { ar: 'مقبول', en: 'Approved' },
  'status.rejected': { ar: 'مرفوض', en: 'Rejected' },
  'status.expired': { ar: 'منتهي', en: 'Expired' },

  // Payment
  'payment.card': { ar: 'بطاقة', en: 'Card' },
  'payment.cash': { ar: 'نقدي', en: 'Cash' },
  'payment.wallet': { ar: 'محفظة', en: 'Wallet' },
  'payment.applePay': { ar: 'آبل باي', en: 'Apple Pay' },
  'payment.mada': { ar: 'مدى', en: 'Mada' },

  // Notifications
  'notif.bookingCreated': { ar: 'تم إنشاء الحجز', en: 'Booking Created' },
  'notif.bookingAccepted': { ar: 'تم قبول الحجز', en: 'Booking Accepted' },
  'notif.bookingCompleted': { ar: 'تم اكتمال الحجز', en: 'Booking Completed' },
  'notif.paymentReceived': { ar: 'تم استلام الدفع', en: 'Payment Received' },
  'notif.newMessage': { ar: 'رسالة جديدة', en: 'New Message' },
  'notif.promotion': { ar: 'عرض جديد', en: 'New Promotion' },

  // Errors (Phase 9: Delight Messages)
  'error.network': { ar: 'عفواً! يبدو أن الإنترنت يأخذ استراحة. حاولي مرة أخرى؟ 🌐', en: 'Oops! Looks like the internet is taking a break. Try again?' },
  'error.serverError': { ar: 'عذراً! شيء غير متوقع حدث. فريقنا التقني تم تنبيهه تلقائياً. جربي مرة أخرى؟ 💜', en: 'Sorry! Something unexpected happened. Our tech team has been alerted. Try again?' },
  'error.validationError': { ar: 'بعض البيانات تحتاج تعديل بسيط. راجعي الحقول المحددة ♀️', en: 'Some fields need a quick fix. Check the highlighted fields.' },
  'error.rateLimit': { ar: 'واو! أنتِ نشيطة جداً! انتظري لحظة قبل المحاولة مرة أخرى ⏳', en: 'Wow, you are fast! Wait a moment before trying again.' },
  'error.unauthorized': { ar: 'هذه المنطقة للأعضاء فقط. سجلي الدخول للوصول إليها 🔐', en: 'This area is for members only. Log in to access it.' },

  // Onboarding
  'onboarding.welcome': { ar: 'مرحباً بكِ في جالكسي بيوتي', en: 'Welcome to Galaxy of Beauty' },
  'onboarding.getStarted': { ar: 'ابدئي الآن', en: 'Get Started' },
  'onboarding.skip': { ar: 'تخطي', en: 'Skip' },

  // Booking flow
  'booking.service': { ar: 'الخدمة', en: 'Service' },
  'booking.technician': { ar: 'الفنية', en: 'Technician' },
  'booking.dateTime': { ar: 'التاريخ والوقت', en: 'Date & Time' },
  'booking.summary': { ar: 'ملخص الحجز', en: 'Booking Summary' },
  'booking.discount': { ar: 'الخصم', en: 'Discount' },

  // Profile
  'profile.edit': { ar: 'تعديل الملف الشخصي', en: 'Edit Profile' },
  'profile.settings': { ar: 'الإعدادات', en: 'Settings' },
  'profile.language': { ar: 'اللغة', en: 'Language' },
  'profile.notifications': { ar: 'تفضيلات الإشعارات', en: 'Notification Preferences' },

  // Actions
  'action.viewAll': { ar: 'عرض الكل', en: 'View All' },
  'action.learnMore': { ar: 'معرفة المزيد', en: 'Learn More' },
  'action.share': { ar: 'مشاركة', en: 'Share' },
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
