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

  // Errors — app shell (error boundary, root error page, 404)
  'error.unexpected': { ar: 'حدث خطأ غير متوقع', en: 'Unexpected Error' },
  'error.unexpected-desc': {
    ar: 'نأسف على هذا الخطأ. يرجى تحديث الصفحة أو المحاولة لاحقاً.',
    en: 'Sorry for this error. Please refresh the page or try again later.',
  },
  'error.try-again': { ar: 'المحاولة مرة أخرى', en: 'Try Again' },
  'error.try-again-aria': { ar: 'محاولة مرة أخرى', en: 'Try Again' },
  'error.reload-page': { ar: 'تحديث الصفحة', en: 'Reload Page' },
  'error.try-again-support': {
    ar: 'يرجى المحاولة مرة أخرى. إذا استمرت المشكلة، تواصلي مع فريق الدعم.',
    en: 'Please try again. If the problem persists, contact our support team.',
  },
  'error.page-not-found': { ar: 'الصفحة غير موجودة', en: 'Page Not Found' },
  'error.not-found-code': { ar: '٤٠٤', en: '404' },
  'error.not-found-title': {
    ar: 'عذراً، الصفحة التي تبحثين عنها غير موجودة',
    en: 'Sorry, the page you are looking for does not exist',
  },
  'error.not-found-hint': { ar: 'ربما تم نقلها أو حذفها', en: 'It may have been moved or deleted' },

  // Common app-shell actions
  'common.back-home': { ar: 'العودة للرئيسية', en: 'Back to Home' },
  'common.browse-services': { ar: 'تصفحي الخدمات', en: 'Browse Services' },
  'common.skip-to-content': { ar: 'تخطي إلى المحتوى الرئيسي', en: 'Skip to main content' },
  'common.back-to-top': { ar: 'العودة للأعلى', en: 'Back to top' },
  'common.breadcrumb-nav': { ar: 'مسار التنقل', en: 'Breadcrumb navigation' },

  // States — offline banner
  'state.offline-banner': {
    ar: 'أنت غير متصل بالإنترنت حالياً — قد لا تعمل بعض الميزات',
    en: 'You are currently offline — some features may not work',
  },

  // PWA install prompt
  'pwa.install-title': {
    ar: 'أضيفي التطبيق للشاشة الرئيسية',
    en: 'Add the app to your home screen',
  },
  'pwa.install-desc': {
    ar: 'وصول أسرع لحجوزاتكِ وخدماتكِ',
    en: 'Faster access to your bookings and services',
  },
  'pwa.install': { ar: 'تثبيت', en: 'Install' },
  'pwa.later': { ar: 'لاحقاً', en: 'Later' },

  // Calendar + sharing
  'calendar.add-to-calendar': { ar: 'أضف للتقويم', en: 'Add to Calendar' },
  'share.via-whatsapp': { ar: 'مشاركة عبر واتساب', en: 'Share via WhatsApp' },
  'share.via-twitter': { ar: 'مشاركة عبر تويتر', en: 'Share via Twitter' },
  'share.copy-link': { ar: 'نسخ الرابط', en: 'Copy Link' },
  'share.copy': { ar: 'نسخ', en: 'Copy' },
  'share.whatsapp': { ar: 'واتساب', en: 'WhatsApp' },
  'share.twitter': { ar: 'تويتر', en: 'Twitter' },

  // Add-on suggestions
  'addon.add-to-booking': { ar: 'أضيفي إلى حجزكِ', en: 'Add to your booking' },
  'addon.deep-hair-treatment': { ar: 'علاج الشعر العميق', en: 'Deep Hair Treatment' },
  'addon.shine-serum': { ar: 'سيروم لمعان', en: 'Shine Serum' },
  'addon.extra-styling': { ar: 'تصفيف إضافي', en: 'Extra Styling' },
  'addon.lash-extensions': { ar: 'تركيب رموش', en: 'Lash Extensions' },
  'addon.brow-shaping': { ar: 'تحديد حواجب', en: 'Brow Shaping' },
  'addon.waterproof-makeup': { ar: 'مكياج مقاوم للماء', en: 'Waterproof Makeup' },
  'addon.gel-polish': { ar: 'طلاء جيل', en: 'Gel Polish' },
  'addon.nail-art': { ar: 'نقش أظافر', en: 'Nail Art' },
  'addon.nail-treatment': { ar: 'علاج أظافر', en: 'Nail Treatment' },
  'addon.face-mask': { ar: 'ماسك وجه', en: 'Face Mask' },
  'addon.chemical-peel': { ar: 'تقشير كيميائي', en: 'Chemical Peel' },
  'addon.sunscreen': { ar: 'واقي شمس', en: 'Sunscreen' },
  'addon.quick-massage': { ar: 'مساج سريع (١٥ دقيقة)', en: 'Quick Massage (15 min)' },
  'addon.welcome-drink': { ar: 'مشروب ترحيبي', en: 'Welcome Drink' },

  // Rebook reminder
  'rebook.since-one': {
    ar: 'مرّ {weeks} أسبوع على آخر {service}',
    en: 'It has been {weeks} week since your last {service}',
  },
  'rebook.since-many': {
    ar: 'مرّ {weeks} أسابيع على آخر {service}',
    en: 'It has been {weeks} weeks since your last {service}',
  },
  'rebook.ready': { ar: 'مستعدة لتجديد إطلالتكِ؟', en: 'Ready to refresh your look?' },
  'rebook.button': { ar: 'أعيدي الحجز', en: 'Rebook' },
  'rebook.service-fallback': { ar: 'خدمة', en: 'service' },
} as const;
