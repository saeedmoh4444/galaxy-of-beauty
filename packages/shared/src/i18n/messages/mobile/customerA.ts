// Mobile customer screens (a–m). Populated by the mobile sweep agents.

export const mobileCustomerAMessages = {
  // ── bookings (list / detail / confirm / create / reschedule) ──
  'bookings.status-pending': { ar: 'قيد الانتظار', en: 'Pending' },
  'bookings.status-in-progress': { ar: 'جاري', en: 'In Progress' },
  'bookings.empty-cta': {
    ar: 'ابدئي رحلتكِ مع أول حجز',
    en: 'Start your journey with your first booking',
  },
  'bookings.detail.booking-code': { ar: 'كود الحجز', en: 'Booking Code' },
  'bookings.detail.technician-id': { ar: 'رقم الفنية', en: 'Technician ID' },
  'bookings.reschedule.title': { ar: 'تعديل الموعد', en: 'Reschedule' },
  'bookings.reschedule.requested': { ar: 'تم طلب التعديل', en: 'Reschedule requested' },
  'bookings.reschedule.notified': {
    ar: 'سيتم إعلامكِ عند تأكيد الموعد الجديد',
    en: 'You will be notified once the new appointment is confirmed',
  },
  'bookings.reschedule.tomorrow': { ar: 'تعديل للغد', en: 'Move to tomorrow' },
  'bookings.create.service-meta': {
    ar: '{price} ر.س · {duration} دقيقة',
    en: '{price} SAR · {duration} min',
  },
  'bookings.create.variant-label': { ar: 'المتغير', en: 'Variant' },
  'bookings.create.variant-basic': { ar: 'الأساسي', en: 'Basic' },
  'bookings.create.address-label': { ar: 'العنوان', en: 'Address' },
  'bookings.create.technician-note': {
    ar: '* ستقوم الفنية بتأكيد الموعد النهائي',
    en: '* The technician will confirm the final appointment',
  },

  // ── ai-chat ──
  'aiChat.welcome-desc': {
    ar: 'أنا مستشارة التجميل الذكية، اسأليني عن أي شيء',
    en: "I'm your AI beauty consultant — ask me anything",
  },
  'aiChat.error': {
    ar: 'عذراً، حدث خطأ. حاولي مرة أخرى.',
    en: 'Sorry, something went wrong. Please try again.',
  },
  'aiChat.input-placeholder': { ar: 'اكتب رسالتك...', en: 'Type your message...' },

  // ── loyalty ──
  'loyalty.load-error': { ar: 'فشل تحميل حساب الولاء', en: 'Failed to load loyalty account' },
  'loyalty.tier-silver': { ar: 'فضية', en: 'Silver' },
  'loyalty.tier-gold': { ar: 'ذهبية', en: 'Gold' },
  'loyalty.tier-platinum': { ar: 'بلاتينية', en: 'Platinum' },
  'loyalty.lifetime-points': { ar: 'إجمالي: {points} نقطة', en: 'Lifetime: {points} points' },
  'loyalty.recent-transactions': { ar: 'آخر العمليات', en: 'Recent Transactions' },
  'loyalty.txn-fallback': { ar: 'عملية', en: 'Transaction' },

  // ── addresses ──
  'addresses.title': { ar: 'عناويني', en: 'My Addresses' },
  'addresses.empty-title': { ar: 'لا توجد عناوين', en: 'No addresses yet' },
  'addresses.empty-desc': {
    ar: 'أضيفي عنوانكِ الأول لتسهيل الحجز',
    en: 'Add your first address to make booking easier',
  },
  'addresses.add-new': { ar: 'إضافة عنوان جديد', en: 'Add New Address' },

  // ── marketplace ──
  'marketplace.load-error': { ar: 'فشل تحميل المتجر', en: 'Failed to load marketplace' },

  // ── gift-cards ──
  'giftCards.empty-desc': {
    ar: 'اشتري بطاقة هدية لأصدقائك',
    en: 'Buy a gift card for your friends',
  },

  // ── achievements ──
  'achievements.subtitle': {
    ar: 'ميداليات وجوائز رحلتكِ الجمالية',
    en: 'Medals and rewards from your beauty journey',
  },
  'achievements.progress-count': {
    ar: '{earned}/{total} إنجاز — {pct}%',
    en: '{earned}/{total} achievements — {pct}%',
  },
  'achievements.streak-label': { ar: 'أيام', en: 'Days' },

  // ── advanced-booking ──
  'advancedBooking.done': { ar: 'تم!', en: 'Done!' },
  'advancedBooking.bookings-count': { ar: '{count} حجوزات', en: '{count} bookings' },
  'advancedBooking.recurrence': { ar: 'التكرار', en: 'Recurrence' },
  'advancedBooking.occurrences-count': { ar: 'عدد المرات: {count}', en: 'Occurrences: {count}' },
  'advancedBooking.create-count': { ar: 'إنشاء {count} حجوزات', en: 'Create {count} bookings' },
  'advancedBooking.freq-weekly': { ar: 'أسبوعي', en: 'Weekly' },
  'advancedBooking.freq-monthly': { ar: 'شهري', en: 'Monthly' },

  // ── ai-assistant ──
  'aiAssistant.title': { ar: ' المساعد الذكي', en: 'AI Assistant' },
  'aiAssistant.placeholder': {
    ar: 'اسألي عن خدمات التجميل...',
    en: 'Ask about beauty services...',
  },

  // ── ai-feed ──
  'aiFeed.title': { ar: ' خلاصتي الذكية', en: 'My Smart Feed' },
  'aiFeed.recommended': { ar: ' موصى به لكِ', en: 'Recommended for you' },
  'aiFeed.from-wishlist': { ar: ' من قائمة أمنياتكِ', en: 'From your wishlist' },
  'aiFeed.skin-profile': { ar: ' ملف بشرتكِ', en: 'Your Skin Profile' },
  'aiFeed.price': { ar: '{price} ر.س', en: '{price} SAR' },

  // ── corporate-wellness ──
  'corporateWellness.load-error': { ar: 'فشل تحميل الباقات', en: 'Failed to load plans' },
  'corporateWellness.subtitle': {
    ar: 'باقات تجميل وعناية لمنسوبات الشركات',
    en: 'Beauty and care packages for company employees',
  },
  'corporateWellness.request-received': {
    ar: 'تم استلام طلبكِ وسنتواصل معكِ',
    en: 'We received your request and will contact you',
  },
  'corporateWellness.title': { ar: ' عافية الشركات', en: 'Corporate Wellness' },
  'corporateWellness.price': { ar: '{price} ر.س / سنوياً', en: '{price} SAR / year' },
  'corporateWellness.employees': { ar: 'حتى {count} موظفة', en: 'Up to {count} employees' },
  'corporateWellness.close': { ar: ' إغلاق', en: 'Close' },
  'corporateWellness.submit-request': { ar: ' تقديم طلب', en: 'Submit Request' },
  'corporateWellness.company-name-ph': { ar: 'اسم الشركة', en: 'Company name' },
  'corporateWellness.contact-name-ph': { ar: 'اسم المسؤولة', en: 'Contact name' },
  'corporateWellness.email-ph': { ar: 'البريد الإلكتروني', en: 'Email' },
  'corporateWellness.send-request': { ar: 'إرسال الطلب', en: 'Send Request' },
  'corporateWellness.my-enquiries': { ar: 'طلباتي السابقة', en: 'My Previous Requests' },
} as const satisfies Record<string, { ar: string; en: string }>;
