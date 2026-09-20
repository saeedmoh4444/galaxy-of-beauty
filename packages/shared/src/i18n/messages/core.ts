// Core UI strings — buttons, states, misc, time, confirmations, statuses,
// payments, errors, actions. Shared across web + mobile.

export const coreMessages = {
  // Buttons
  'button.save': { ar: 'حفظ', en: 'Save' },
  'button.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'button.delete': { ar: 'حذف', en: 'Delete' },
  'button.edit': { ar: 'تعديل', en: 'Edit' },
  'button.retry': { ar: 'إعادة المحاولة', en: 'Retry' },
  'button.back': { ar: 'رجوع', en: 'Back' },
  'button.next': { ar: 'التالي', en: 'Next' },
  'button.bookNow': { ar: 'احجزي الآن', en: 'Book Now' },

  // States
  'state.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'state.error': { ar: 'حدث خطأ ما', en: 'Something went wrong' },
  'state.empty': { ar: 'لا توجد بيانات', en: 'No data found' },
  'state.noResults': { ar: 'لا توجد نتائج', en: 'No results' },

  // Misc
  'misc.sar': { ar: 'ر.س', en: 'SAR' },
  'misc.min': { ar: 'دقيقة', en: 'min' },
  'misc.rating': { ar: 'تقييم', en: 'Rating' },

  // Time

  // Confirmations
  'confirm.logout': {
    ar: 'هل أنت متأكدة من تسجيل الخروج؟',
    en: 'Are you sure you want to logout?',
  },

  // Status
  'status.active': { ar: 'نشط', en: 'Active' },
  'status.inactive': { ar: 'غير نشط', en: 'Inactive' },
  'status.pending': { ar: 'قيد الانتظار', en: 'Pending' },

  // Payment

  // Errors (Phase 9: Delight Messages)

  // Actions
  'action.viewAll': { ar: 'عرض الكل', en: 'View All' },

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
