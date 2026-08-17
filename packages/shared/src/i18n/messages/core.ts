// Core UI strings — buttons, states, misc, time, confirmations, statuses,
// payments, errors, actions. Shared across web + mobile.

export const coreMessages = {
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

  // States
  'state.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'state.error': { ar: 'حدث خطأ ما', en: 'Something went wrong' },
  'state.empty': { ar: 'لا توجد بيانات', en: 'No data found' },
  'state.noResults': { ar: 'لا توجد نتائج', en: 'No results' },
  'state.offline': { ar: 'أنت غير متصل بالإنترنت', en: 'You are offline' },

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
  'confirm.logout': {
    ar: 'هل أنت متأكدة من تسجيل الخروج؟',
    en: 'Are you sure you want to logout?',
  },
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

  // Errors (Phase 9: Delight Messages)
  'error.network': {
    ar: 'عفواً! يبدو أن الإنترنت يأخذ استراحة. حاولي مرة أخرى؟ ',
    en: 'Oops! Looks like the internet is taking a break. Try again?',
  },
  'error.serverError': {
    ar: 'عذراً! شيء غير متوقع حدث. فريقنا التقني تم تنبيهه تلقائياً. جربي مرة أخرى؟ ',
    en: 'Sorry! Something unexpected happened. Our tech team has been alerted. Try again?',
  },
  'error.validationError': {
    ar: 'بعض البيانات تحتاج تعديل بسيط. راجعي الحقول المحددة ️',
    en: 'Some fields need a quick fix. Check the highlighted fields.',
  },
  'error.rateLimit': {
    ar: 'واو! أنتِ نشيطة جداً! انتظري لحظة قبل المحاولة مرة أخرى ',
    en: 'Wow, you are fast! Wait a moment before trying again.',
  },
  'error.unauthorized': {
    ar: 'هذه المنطقة للأعضاء فقط. سجلي الدخول للوصول إليها ',
    en: 'This area is for members only. Log in to access it.',
  },

  // Actions
  'action.viewAll': { ar: 'عرض الكل', en: 'View All' },
  'action.learnMore': { ar: 'معرفة المزيد', en: 'Learn More' },
  'action.share': { ar: 'مشاركة', en: 'Share' },
} as const;
