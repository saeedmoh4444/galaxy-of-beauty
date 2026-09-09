// Profile strings.

export const profileMessages = {
  'profile.edit': { ar: 'تعديل الملف الشخصي', en: 'Edit Profile' },
  'profile.settings': { ar: 'الإعدادات', en: 'Settings' },
  'profile.language': { ar: 'اللغة', en: 'Language' },
  'profile.notifications': { ar: 'تفضيلات الإشعارات', en: 'Notification Preferences' },

  // Profile page
  'profile.title': { ar: 'الملف الشخصي', en: 'Profile' },
  'profile.updated-success': {
    ar: 'تم تحديث الملف الشخصي بنجاح',
    en: 'Profile updated successfully',
  },
  'profile.personal-info': { ar: 'المعلومات الشخصية', en: 'Personal Information' },
  'profile.addresses': { ar: 'العناوين', en: 'Addresses' },
  'profile.load-error': { ar: 'فشل تحميل الملف الشخصي', en: 'Failed to load profile' },
  'profile.login': { ar: 'تسجيل الدخول', en: 'Log In' },
  'profile.name': { ar: 'الاسم', en: 'Name' },
  'profile.name-too-short': { ar: 'الاسم قصير جداً', en: 'Name is too short' },
  'profile.phone': { ar: 'رقم الجوال', en: 'Mobile Number' },
  'profile.phone-format': { ar: 'صيغة الجوال: +9665xxxxxxxx', en: 'Phone format: +9665xxxxxxxx' },
  'profile.arabic': { ar: 'العربية', en: 'Arabic' },

  // Addresses (profile page + addresses page)
  'profile.add-address': { ar: 'إضافة عنوان', en: 'Add Address' },
  'profile.edit-address': { ar: 'تعديل عنوان', en: 'Edit Address' },
  'profile.addresses-load-error': { ar: 'فشل تحميل العناوين', en: 'Failed to load addresses' },
  'profile.no-addresses': { ar: 'لا توجد عناوين', en: 'No addresses yet' },
  'profile.add-first-address': {
    ar: 'أضف عنوانك الأول ليسهل عملية الحجز',
    en: 'Add your first address to make booking easier',
  },
  'profile.default': { ar: 'افتراضي', en: 'Default' },
  'profile.building-suffix': { ar: ', مبنى {building}', en: ', Building {building}' },
  'profile.set-default': { ar: 'تعيين افتراضي', en: 'Set as Default' },
  'profile.delete-address-confirm': {
    ar: 'هل أنت متأكد من حذف هذا العنوان؟',
    en: 'Are you sure you want to delete this address?',
  },
  'profile.label-hint': { ar: 'تسمية (مثال: المنزل، العمل)', en: 'Label (e.g. Home, Work)' },
  'profile.city': { ar: 'المدينة', en: 'City' },
  'profile.area': { ar: 'المنطقة', en: 'Area' },
  'profile.street': { ar: 'الشارع', en: 'Street' },
  'profile.building': { ar: 'المبنى', en: 'Building' },
  'profile.floor': { ar: 'الطابق', en: 'Floor' },
  'profile.apartment': { ar: 'الشقة', en: 'Apartment' },
  'profile.update-address': { ar: 'تحديث العنوان', en: 'Update Address' },
  'profile.add-address-submit': { ar: 'إضافة العنوان', en: 'Add Address' },
  'profile.address-added': { ar: 'تمت إضافة العنوان', en: 'Address added' },
  'profile.address-updated': { ar: 'تم تحديث العنوان', en: 'Address updated' },
  'profile.address-deleted': { ar: 'تم حذف العنوان', en: 'Address deleted' },
  'profile.address-label': { ar: 'المسمى', en: 'Label' },
  'profile.label-placeholder': { ar: 'مثال: المنزل', en: 'e.g. Home' },

  // Notifications page
  'profile.notifications-title': { ar: 'الإشعارات', en: 'Notifications' },
  'profile.mark-all-read': { ar: 'تحديد الكل كمقروء', en: 'Mark All as Read' },
  'profile.notifications-error': { ar: 'فشل تحميل الإشعارات', en: 'Failed to load notifications' },
  'profile.no-notifications': { ar: 'لا توجد إشعارات', en: 'No notifications' },
  'profile.no-notifications-desc': {
    ar: 'ليس لديك أي إشعارات جديدة',
    en: 'You have no new notifications',
  },
  'profile.mark-read': { ar: 'قراءة', en: 'Mark as Read' },
  'profile.page-of': { ar: '{page} من {totalPages}', en: '{page} of {totalPages}' },

  // Dashboard strings (customer home)
  'dashboard.title': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'dashboard.daily-assessment': { ar: 'تقييم اليوم', en: "Today's Assessment" },
  'dashboard.stats-error': { ar: 'فشل تحميل الإحصائيات', en: 'Failed to load statistics' },

  // Onboarding tour (§3.6 — first-run guided tour)
  'tour.bookTitle': { ar: 'احجزي أول خدمة', en: 'Book your first service' },
  'tour.bookBody': {
    ar: 'من زر «احجزي الآن» تختارين الخدمة والفنية والوقت — الدفع عند الوصول أو أونلاين، وأنتِ تتحكمين بكل التفاصيل.',
    en: 'From “Book now” pick a service, technician and time — pay at the venue or online, with full control over the details.',
  },
  'tour.walletTitle': { ar: 'محفظتك وميزانيتك', en: 'Your wallet & budget' },
  'tour.walletBody': {
    ar: 'رصيدك، بطاقات الهدايا، والميزانية الشهرية في مكان واحد — اشحني وتابعي مصاريفك من هذه البطاقة.',
    en: 'Balance, gift cards and monthly budget in one place — top up and track spending from this card.',
  },
  'tour.aiTitle': { ar: 'بيوتي AI — مستشارتك', en: 'Beauty AI, your advisor' },
  'tour.aiBody': {
    ar: 'اسألي مستشارة الذكاء الاصطناعي عن روتينك، بشرتك، أو أي سؤال تجميلي — متاحة على مدار الساعة وبخصوصية كاملة.',
    en: 'Ask the AI advisor about your routine, skin or any beauty question — available 24/7 with complete privacy.',
  },
  'tour.wellnessTitle': { ar: 'مركز العافية', en: 'Your wellness hub' },
  'tour.wellnessBody': {
    ar: 'دورتك، حالتك المزاجية، نصائح ما بعد الجلسات والمزيد — كل رحلتك الصحية في صفحة واحدة تتبع مرحلة حياتك.',
    en: 'Your cycle, mood, post-treatment care and more — your whole wellness journey in one life-stage-aware page.',
  },
  'tour.referralsTitle': { ar: 'دعوة الصديقات', en: 'Invite your friends' },
  'tour.referralsBody': {
    ar: 'شاركي رابطك الخاص واكسبي مكافآت عندما تنضم صديقاتك — جمال مشترك، مكافآت مشتركة.',
    en: 'Share your personal link and earn rewards when friends join — shared beauty, shared rewards.',
  },
  'tour.next': { ar: 'التالي', en: 'Next' },
  'tour.back': { ar: 'السابق', en: 'Back' },
  'tour.skip': { ar: 'تخطي', en: 'Skip' },
  'tour.done': { ar: 'تمام، لنبدأ!', en: 'Done, let’s go!' },
  'tour.replay': { ar: 'جولة تعريفية', en: 'Guided tour' },
  'tour.progress': { ar: '{current} من {total}', en: '{current} of {total}' },
  'dashboard.bookings': { ar: 'الحجوزات', en: 'Bookings' },
  'dashboard.spending': { ar: 'الإنفاق', en: 'Spending' },
  'dashboard.continuity': { ar: 'الاستمرارية', en: 'Continuity' },
  'dashboard.weeks': { ar: 'أسابيع', en: 'weeks' },
  'dashboard.budget': { ar: 'الميزانية', en: 'Budget' },
  'dashboard.gift-cards': { ar: 'بطاقات الهدية', en: 'Gift Cards' },
  'dashboard.inspiration-board': { ar: 'لوحة الإلهام', en: 'Inspiration Board' },
  'dashboard.surprise-me': { ar: 'فاجئيني', en: 'Surprise Me' },
  'dashboard.recent-bookings': { ar: 'آخر الحجوزات', en: 'Recent Bookings' },
  'dashboard.load-error': { ar: 'فشل التحميل', en: 'Failed to load' },
  'dashboard.no-bookings': { ar: 'لا توجد حجوزات', en: 'No bookings yet' },
  'dashboard.start-journey': {
    ar: 'ابدئي رحلتكِ مع أول حجز',
    en: 'Start your journey with your first booking',
  },
  'dashboard.gift-registry': { ar: 'سجل الهدايا', en: 'Gift Registry' },
  'dashboard.beauty-circle': { ar: 'دائرة الجمال', en: 'Beauty Circle' },
  'dashboard.savings-goal': { ar: 'هدف ادخار', en: 'Savings goal' },
} as const;
