// Mobile customer screens (n–z). Populated by the mobile sweep agents.

export const mobileCustomerBMessages = {
  // ---- referrals ----
  'mobile.referrals.load-error': { ar: 'فشل تحميل الإحالات', en: 'Failed to load referrals' },
  'mobile.referrals.title': { ar: 'الإحالات', en: 'Referrals' },
  'mobile.referrals.your-code': { ar: 'كود الإحالة الخاص بكِ', en: 'Your referral code' },
  'mobile.referrals.copy-code': { ar: 'نسخ الكود', en: 'Copy Code' },
  'mobile.referrals.referrals': { ar: 'إحالات', en: 'Referrals' },
  'mobile.referrals.rewards': { ar: 'مكافآت', en: 'Rewards' },

  // ---- promo ----
  'mobile.promo.load-error': { ar: 'فشل تحميل الأكواد', en: 'Failed to load promo codes' },
  'mobile.promo.title': { ar: 'أكواد الخصم', en: 'Promo Codes' },
  'mobile.promo.input-placeholder': { ar: 'أدخلي كود الخصم', en: 'Enter a promo code' },
  'mobile.promo.apply': { ar: 'تطبيق', en: 'Apply' },
  'mobile.promo.discount-percent': { ar: 'خصم {value}%', en: 'Discount {value}%' },
  'mobile.promo.discount-amount': { ar: 'خصم {value}', en: 'Discount {value}' },
  'mobile.promo.min-order': { ar: 'الحد الأدنى: {value}', en: 'Minimum order: {value}' },

  // ---- wallet ----
  'mobile.wallet.available-balance': { ar: 'الرصيد المتاح', en: 'Available Balance' },
  'mobile.wallet.bonus': { ar: '+ {amount} مكافآت', en: '+ {amount} bonus' },
  'mobile.wallet.top-up': { ar: 'شحن رصيد', en: 'Top Up' },
  'mobile.wallet.recent-transactions': { ar: 'آخر المعاملات', en: 'Recent Transactions' },

  // ---- ride-hailing ----
  'mobile.rideHailing.title': { ar: 'توصيل للموعد', en: 'Ride to Your Appointment' },
  'mobile.rideHailing.booked': { ar: 'تم الحجز!', en: 'Booked!' },
  'mobile.rideHailing.eta': { ar: '{time} · {price} ر.س', en: '{time} · {price} SAR' },
  'mobile.rideHailing.book': { ar: 'احجز', en: 'Book' },

  // ---- streaks ----
  'mobile.streaks.load-error': { ar: 'فشل تحميل الاستمرارية', en: 'Failed to load streak' },
  'mobile.streaks.title': { ar: 'الاستمرارية', en: 'Streaks' },
  'mobile.streaks.current': {
    ar: 'الاستمرارية الحالية: {days} أيام',
    en: 'Current streak: {days} days',
  },
  'mobile.streaks.longest': {
    ar: 'أطول استمرارية: {days} أيام',
    en: 'Longest streak: {days} days',
  },
  'mobile.streaks.tip': {
    ar: 'احجزي أسبوعياً للحفاظ على استمراريتكِ!',
    en: 'Book weekly to keep your streak going!',
  },

  // ---- streak-calendar ----
  'mobile.streakCalendar.load-error': {
    ar: 'فشل تحميل التقويم',
    en: 'Failed to load calendar',
  },
  'mobile.streakCalendar.title': { ar: 'تقويم الاستمرارية', en: 'Streak Calendar' },
  'mobile.streakCalendar.current-week': {
    ar: 'الأسبوع الحالي: {days} أيام',
    en: 'Current week: {days} days',
  },
  'mobile.streakCalendar.longest': {
    ar: 'أطول استمرارية: {days} أيام',
    en: 'Longest streak: {days} days',
  },
  'mobile.streakCalendar.tip': {
    ar: 'احجزي أسبوعياً للحفاظ على استمراريتكِ وكسب المكافآت!',
    en: 'Book weekly to keep your streak going and earn rewards!',
  },

  // ---- service-compare ----
  'mobile.serviceCompare.comparison': { ar: 'المقارنة', en: 'Comparison' },

  // ---- saved-cards ----
  'mobile.savedCards.load-error': { ar: 'فشل تحميل البطاقات', en: 'Failed to load cards' },
  'mobile.savedCards.title': { ar: 'البطاقات المحفوظة', en: 'Saved Cards' },
  'mobile.savedCards.empty-title': { ar: 'لا توجد بطاقات محفوظة', en: 'No saved cards' },
  'mobile.savedCards.empty-desc': {
    ar: 'أضيفي بطاقتكِ للدفع السريع',
    en: 'Add your card for quick payments',
  },
  'mobile.savedCards.expires': { ar: 'تنتهي {month}/{year}', en: 'Expires {month}/{year}' },

  // ---- wellness-tracker ----
  'mobile.wellnessTracker.title': { ar: 'متعقب الصحة', en: 'Health Tracker' },
  'mobile.wellnessTracker.cups': { ar: 'أكواب', en: 'Cups' },
  'mobile.wellnessTracker.sleep': { ar: 'نوم', en: 'Sleep' },
  'mobile.wellnessTracker.steps': { ar: 'خطوة', en: 'Steps' },

  // ---- service-history ----
  'mobile.serviceHistory.load-error': { ar: 'فشل تحميل السجل', en: 'Failed to load history' },
  'mobile.serviceHistory.empty-title': { ar: 'لا يوجد سجل خدمات', en: 'No service history' },
  'mobile.serviceHistory.empty-desc': {
    ar: 'ستظهر خدماتكِ السابقة هنا',
    en: 'Your past services will appear here',
  },
  'mobile.serviceHistory.title': { ar: 'سجل الخدمات', en: 'Service History' },

  // ---- reviews ----
  'mobile.reviews.load-error': { ar: 'فشل تحميل التقييمات', en: 'Failed to load reviews' },
  'mobile.reviews.empty-title': { ar: 'لا توجد تقييمات', en: 'No reviews yet' },
  'mobile.reviews.empty-desc': {
    ar: 'قيمي الخدمات التي حصلتِ عليها',
    en: 'Rate the services you received',
  },

  // ---- smart-schedule ----
  'mobile.smartSchedule.title': { ar: 'جدولة ذكية', en: 'Smart Schedule' },
  'mobile.smartSchedule.tech-rating': {
    ar: '#{id} · {rating}',
    en: 'Service Provider #{id} · {rating}',
  },
  'mobile.smartSchedule.book': { ar: 'احجز', en: 'Book' },
  'mobile.smartSchedule.change-service': { ar: 'تغيير الخدمة', en: 'Change Service' },

  // ---- vendor-portal ----
  'mobile.vendorPortal.title': { ar: 'بوابة البائعين', en: 'Vendor Portal' },
  'mobile.vendorPortal.products': { ar: 'منتجات', en: 'Products' },
  'mobile.vendorPortal.sar': { ar: 'ر.س', en: 'SAR' },

  // ---- tech-onboarding ----
  'mobile.techOnboarding.title': {
    ar: 'التسجيل كمقدمة خدمة',
    en: 'Register as a Service Provider',
  },
  'mobile.techOnboarding.completed': {
    ar: '{completed}/{total} مكتملة',
    en: '{completed}/{total} completed',
  },
  'mobile.techOnboarding.upload': { ar: 'رفع', en: 'Upload' },

  // ---- style-match ----
  'mobile.styleMatch.title': { ar: 'مطابقة الأسلوب', en: 'Style Match' },
  'mobile.styleMatch.hint': { ar: 'اكتشفي أسلوبكِ المثالي', en: 'Discover your perfect style' },
  'mobile.styleMatch.analyze': { ar: 'حللي أسلوبي', en: 'Analyze My Style' },

  // ---- service-wishlist ----
  'mobile.serviceWishlist.title': { ar: 'قائمة الخدمات', en: 'Service Wishlist' },
  'mobile.serviceWishlist.lowest-price': {
    ar: 'أقل سعر: {price} ر.س',
    en: 'Lowest price: {price} SAR',
  },

  // ---- service-menu-qr ----
  'mobile.serviceMenuQr.title': { ar: 'QR قائمة الخدمات', en: 'Service Menu QR' },
  'mobile.serviceMenuQr.generate': { ar: 'توليد QR', en: 'Generate QR' },
  'mobile.serviceMenuQr.generated': { ar: 'تم توليد QR!', en: 'QR generated!' },

  // ---- salon-management ----
  'mobile.salonManagement.title': { ar: 'إدارة الصالون', en: 'Salon Management' },
  'mobile.salonManagement.today-bookings': { ar: 'حجز اليوم', en: "Today's Bookings" },

  // ---- referral-dashboard ----
  'mobile.referralDashboard.title': { ar: 'لوحة الإحالات', en: 'Referral Dashboard' },
  'mobile.referralDashboard.referrals': { ar: 'إحالة', en: 'Referral' },

  // ---- recommendations ----
  'mobile.recommendations.title': { ar: 'توصيات ذكية', en: 'Smart Recommendations' },
  'mobile.recommendations.booked-together': { ar: 'غالباً تُحجز مع:', en: 'Often booked with:' },

  // ---- product-scanner ----
  'mobile.productScanner.not-found': { ar: 'لم يتم العثور على المنتج', en: 'Product not found' },
  'mobile.productScanner.title': { ar: 'فحص المنتجات', en: 'Product Scanner' },
  'mobile.productScanner.scan': { ar: 'مسح الباركود', en: 'Scan Barcode' },

  // ---- waitlist ----
  'mobile.waitlist.title': { ar: 'قائمة الانتظار', en: 'Waitlist' },
  'mobile.waitlist.position': { ar: 'الموقع: #{position}', en: 'Position: #{position}' },

  // ---- vip-membership ----
  'mobile.vipMembership.title': { ar: 'العضوية المميزة', en: 'VIP Membership' },
  'mobile.vipMembership.auto-renew-on': {
    ar: 'تجديد تلقائي مفعل',
    en: 'Auto-renewal enabled',
  },
  'mobile.vipMembership.auto-renew-off': {
    ar: 'تجديد تلقائي معطل',
    en: 'Auto-renewal disabled',
  },

  // ---- post-treatment ----
  'mobile.postTreatment.title': { ar: 'متابعة ما بعد العلاج', en: 'Post-Treatment Care' },
  'mobile.postTreatment.subtitle': {
    ar: 'تعليمات العناية بعد كل خدمة',
    en: 'Aftercare instructions for every service',
  },
  'mobile.postTreatment.tab-facial': { ar: 'عناية بالبشرة', en: 'Facial Care' },
  'mobile.postTreatment.tab-waxing': { ar: 'إزالة شعر', en: 'Hair Removal' },
  'mobile.postTreatment.tab-hair-color': { ar: 'صبغ شعر', en: 'Hair Color' },
  'mobile.postTreatment.tab-nails': { ar: 'أظافر', en: 'Nails' },
  'mobile.postTreatment.progress': {
    ar: 'تقدم المتابعة: {progress}%',
    en: 'Follow-up progress: {progress}%',
  },
  'mobile.postTreatment.instructions': { ar: 'التعليمات', en: 'Instructions' },
  'mobile.postTreatment.aftercare-facial-1': { ar: 'لا تلمسي وجهك', en: 'Do not touch your face' },
  'mobile.postTreatment.aftercare-facial-2': {
    ar: 'تجنبي المكياج لمدة 24 ساعة',
    en: 'Avoid makeup for 24 hours',
  },
  'mobile.postTreatment.aftercare-facial-3': { ar: 'استخدمي واقي الشمس', en: 'Use sunscreen' },
  'mobile.postTreatment.aftercare-facial-4': {
    ar: 'اشربي الكثير من الماء',
    en: 'Drink plenty of water',
  },
  'mobile.postTreatment.aftercare-waxing-1': {
    ar: 'تجنبي الشمس لمدة 48 ساعة',
    en: 'Avoid sun for 48 hours',
  },
  'mobile.postTreatment.aftercare-waxing-2': {
    ar: 'لا تستخدمي المقشرات',
    en: 'Do not use exfoliants',
  },
  'mobile.postTreatment.aftercare-waxing-3': {
    ar: 'ارتدي ملابس قطنية',
    en: 'Wear cotton clothing',
  },
  'mobile.postTreatment.aftercare-waxing-4': { ar: 'رطبي المنطقة', en: 'Moisturize the area' },
  'mobile.postTreatment.aftercare-hair-color-1': {
    ar: 'لا تغسلي شعرك لمدة 48 ساعة',
    en: 'Do not wash your hair for 48 hours',
  },
  'mobile.postTreatment.aftercare-hair-color-2': {
    ar: 'استخدمي شامبو خالٍ من الكبريتات',
    en: 'Use sulfate-free shampoo',
  },
  'mobile.postTreatment.aftercare-hair-color-3': { ar: 'تجنبي الحرارة', en: 'Avoid heat' },
  'mobile.postTreatment.aftercare-hair-color-4': {
    ar: 'استخدمي بلسم مرطب',
    en: 'Use a hydrating conditioner',
  },
  'mobile.postTreatment.aftercare-nails-1': { ar: 'تجنبي الماء الساخن', en: 'Avoid hot water' },
  'mobile.postTreatment.aftercare-nails-2': { ar: 'استخدمي كريم اليدين', en: 'Use hand cream' },
  'mobile.postTreatment.aftercare-nails-3': {
    ar: 'لا تستخدمي أظافرك كأدوات',
    en: 'Do not use your nails as tools',
  },
  'mobile.postTreatment.aftercare-nails-4': { ar: 'زيوت الأظافر', en: 'Nail oils' },
  'mobile.postTreatment.day-1': { ar: 'اليوم 1', en: 'Day 1' },
  'mobile.postTreatment.day-2-3': { ar: 'اليوم 2-3', en: 'Day 2-3' },
  'mobile.postTreatment.day-4-7': { ar: 'اليوم 4-7', en: 'Day 4-7' },
  'mobile.postTreatment.day-4-plus': { ar: 'اليوم 4 وما بعد', en: 'Day 4+' },
  'mobile.postTreatment.day-1-2': { ar: 'اليوم 1-2', en: 'Day 1-2' },
  'mobile.postTreatment.day-3-5': { ar: 'اليوم 3-5', en: 'Day 3-5' },
  'mobile.postTreatment.day-6-plus': { ar: 'اليوم 6 وما بعد', en: 'Day 6+' },
  'mobile.postTreatment.day-2-7': { ar: 'اليوم 2-7', en: 'Day 2-7' },
  'mobile.postTreatment.week-2-plus': { ar: 'الأسبوع 2 وما بعد', en: 'Week 2+' },
  'mobile.postTreatment.action-facial-day-1': {
    ar: 'لا تغسلي وجهك — اتركي المنتجات',
    en: 'Do not wash your face — leave the products',
  },
  'mobile.postTreatment.action-facial-day-2-3': {
    ar: 'غسول لطيف + مرطب',
    en: 'Gentle cleanser + moisturizer',
  },
  'mobile.postTreatment.action-facial-day-4-7': {
    ar: 'عودي إلى روتينك المعتاد',
    en: 'Return to your normal routine',
  },
  'mobile.postTreatment.action-waxing-day-1': {
    ar: 'لا تلمسي المنطقة — تجنبي الحرارة',
    en: 'Do not touch the area — avoid heat',
  },
  'mobile.postTreatment.action-waxing-day-2-3': {
    ar: 'ترطيب خفيف + ملابس واسعة',
    en: 'Light moisturizing + loose clothing',
  },
  'mobile.postTreatment.action-waxing-day-4-plus': {
    ar: 'تقشير لطيف لمنع نمو الشعر تحت الجلد',
    en: 'Gentle exfoliation to prevent ingrown hairs',
  },
  'mobile.postTreatment.action-hair-color-day-1-2': {
    ar: 'لا تغسلي شعرك — ثبتي اللون',
    en: 'Do not wash — set the color',
  },
  'mobile.postTreatment.action-hair-color-day-3-5': {
    ar: 'اشطفيه بماء بارد + بلسم',
    en: 'Rinse with cold water + conditioner',
  },
  'mobile.postTreatment.action-hair-color-day-6-plus': {
    ar: 'روتينك المعتاد مع حماية من الحرارة',
    en: 'Normal routine with heat protection',
  },
  'mobile.postTreatment.action-nails-day-1': { ar: 'حافظي على جفاف الأظافر', en: 'Keep nails dry' },
  'mobile.postTreatment.action-nails-day-2-7': {
    ar: 'ترطيب يومي + زيت أظافر',
    en: 'Moisturize daily + nail oil',
  },
  'mobile.postTreatment.action-nails-week-2-plus': {
    ar: 'لمسات عند الحاجة',
    en: 'Touch-ups when needed',
  },
  'mobile.postTreatment.timeline': { ar: 'الجدول الزمني', en: 'Timeline' },

  // ---- post-care ----
  'mobile.postCare.title': { ar: 'عناية ما بعد الخدمة', en: 'Post-Service Care' },
  'mobile.postCare.tipsCount': { ar: '{count} نصيحة للعناية', en: '{count} care tips' },

  // ---- stores (store plan Phase 4) ----
  'mobile.stores.title': { ar: 'المتاجر', en: 'Stores' },
  'mobile.stores.products': { ar: 'منتج', en: 'products' },
  'mobile.stores.empty': { ar: 'لا توجد متاجر بعد', en: 'No stores yet' },
  'mobile.stores.load-error': { ar: 'فشل تحميل المتاجر', en: 'Failed to load stores' },
  'mobile.stores.not-found': { ar: 'المتجر غير موجود', en: 'Store not found' },
  'mobile.stores.verified': { ar: 'متجر موثق', en: 'Verified' },
  'mobile.stores.stock': { ar: 'المخزون: {count}', en: 'Stock: {count}' },
  'mobile.stores.add-to-cart': { ar: 'أضيفي للسلة', en: 'Add to cart' },
  'mobile.stores.added-to-cart': { ar: 'تمت الإضافة للسلة', en: 'Added to cart' },
  'mobile.stores.login-to-buy': { ar: 'سجلي الدخول للشراء', en: 'Sign in to buy' },
  'mobile.stores.empty-products': { ar: 'لا توجد منتجات', en: 'No products' },
  // E2 — medical clinics screens
  'mobile.clinics.title': { ar: 'العيادات الطبية', en: 'Medical Clinics' },
  'mobile.clinics.empty': { ar: 'لا توجد عيادات', en: 'No clinics' },
  'mobile.clinics.load-error': { ar: 'فشل تحميل العيادات', en: 'Failed to load clinics' },
  'mobile.clinics.not-found': { ar: 'العيادة غير موجودة', en: 'Clinic not found' },
  'mobile.clinics.verified': { ar: 'ترخيص معتمد', en: 'Licensed & verified' },
  'mobile.clinics.price': {
    ar: 'الاستشارة: {{price}} ر.س',
    en: 'Consultation: {{price}} SAR',
  },
  'mobile.clinics.slots': { ar: 'المواعيد المتاحة', en: 'Open slots' },
  'mobile.clinics.no-slots': { ar: 'لا توجد مواعيد متاحة', en: 'No open slots' },
  'mobile.clinics.book': { ar: 'حجز استشارة', en: 'Book consultation' },
  'mobile.clinics.consent': {
    ar: 'أوافق على الإقرار الطبي',
    en: 'I consent to the medical disclaimer',
  },
  'mobile.clinics.confirm': { ar: 'تأكيد الحجز', en: 'Confirm' },
  'mobile.clinics.booked': { ar: 'تم إرسال طلب الحجز', en: 'Booking request sent' },
  'mobile.clinics.packages': { ar: 'باقات العلاج', en: 'Treatment packages' },
  'mobile.clinics.login-to-book': {
    ar: 'سجلي الدخول للحجز',
    en: 'Sign in to book',
  },
  // E3 — gym screens
  'mobile.gyms.title': { ar: 'النوادي الرياضية', en: 'Fitness Gyms' },
  // E5 — nail bars + barberettes (mobile)
  'mobile.nailBars.title': { ar: 'صالونات الأظافر', en: 'Nail Bars' },
  'mobile.nailBars.empty': { ar: 'لا توجد صالونات أظافر', en: 'No nail bars' },
  'mobile.nailBars.load-error': { ar: 'فشل تحميل الصالونات', en: 'Failed to load nail bars' },
  'mobile.nailBars.verified': { ar: 'مصرح', en: 'Licensed' },
  'mobile.nailBars.child-friendly': { ar: 'ركن أطفال', en: 'Child-friendly corner' },
  'mobile.nailBars.pay-at-venue': { ar: 'الدفع في الصالون', en: 'Pay at venue' },
  'mobile.nailBars.slots': { ar: 'المحطات المتاحة', en: 'Available stations' },
  'mobile.nailBars.no-slots': { ar: 'لا توجد مواعيد متاحة', en: 'No slots available' },
  'mobile.nailBars.spots-left': { ar: 'متبقي {n} محطة', en: '{n} stations left' },
  'mobile.nailBars.full': { ar: 'مكتمل', en: 'Full' },
  'mobile.nailBars.book': { ar: 'احجزي', en: 'Book' },
  'mobile.barberettes.title': { ar: 'باربيريت', en: 'Barberettes' },
  'mobile.barberettes.subtitle': {
    ar: 'خبيرات القصات القصيرة العصرية',
    en: 'Experts in short modern cuts',
  },
  'mobile.barberettes.empty': { ar: 'لا توجد باربيريت بعد', en: 'No barberettes yet' },
  'mobile.barberettes.load-error': { ar: 'فشل تحميل الباربيريت', en: 'Failed to load barberettes' },
  'mobile.gyms.empty': { ar: 'لا توجد نوادي', en: 'No gyms' },
  'mobile.gyms.load-error': { ar: 'فشل تحميل النوادي', en: 'Failed to load gyms' },
  'mobile.gyms.not-found': { ar: 'النادي غير موجود', en: 'Gym not found' },
  'mobile.gyms.verified': { ar: 'ترخيص معتمد', en: 'Licensed & verified' },
  'mobile.gyms.classes': { ar: 'الحصص الجماعية', en: 'Group classes' },
  'mobile.gyms.no-classes': { ar: 'لا توجد حصص قادمة', en: 'No upcoming classes' },
  'mobile.gyms.spots-left': { ar: 'متبقي {{count}} مقعد', en: '{{count}} spots left' },
  'mobile.gyms.full': { ar: 'مكتمل', en: 'Full' },
  'mobile.gyms.book': { ar: 'احجزي مقعداً', en: 'Book a seat' },
  'mobile.gyms.booked': { ar: 'تم حجز مقعدك', en: 'Seat booked' },
  'mobile.gyms.plans': { ar: 'العضويات', en: 'Memberships' },
  'mobile.gyms.subscribe': { ar: 'اشتركي', en: 'Subscribe' },
  'mobile.gyms.passes': { ar: 'البطاقات اليومية', en: 'Day passes' },
  'mobile.gyms.buy': { ar: 'اشتري', en: 'Buy' },
  'mobile.gyms.login-to-book': {
    ar: 'سجلي الدخول للحجز',
    en: 'Sign in to book',
  },
  'mobile.trainers.title': { ar: 'المدربات', en: 'Trainers' },
  'mobile.trainers.empty': { ar: 'لا توجد مدربات', en: 'No trainers' },
  'mobile.trainers.load-error': { ar: 'فشل تحميل المدربات', en: 'Failed to load trainers' },

  // ---- travel-kit ----
  'mobile.travelKit.title': { ar: 'حقيبة السفر', en: 'Travel Kit' },
  'mobile.travelKit.kit-contents': {
    ar: 'محتويات الحقيبة - {name}',
    en: 'Kit Contents - {name}',
  },

  // ---- spa-planner ----
  'mobile.spaPlanner.title': { ar: 'مخطط السبا', en: 'Spa Planner' },
  'mobile.spaPlanner.duration-price': {
    ar: '{duration} · {price} ر.س',
    en: '{duration} · {price} SAR',
  },

  // ---- service-warranty ----
  'mobile.serviceWarranty.title': { ar: 'ضمان الخدمة', en: 'Service Warranty' },
  'mobile.serviceWarranty.expires': { ar: 'ينتهي: {date}', en: 'Expires: {date}' },

  // ---- savings-goals ----
  'mobile.savingsGoals.title': { ar: 'أهداف التوفير', en: 'Savings Goals' },
  'mobile.savingsGoals.progress': {
    ar: '{current} / {target} ر.س',
    en: '{current} / {target} SAR',
  },

  // ---- restock-reminder ----
  'mobile.restockReminder.title': { ar: 'تذكير بإعادة الطلب', en: 'Restock Reminder' },
  'mobile.restockReminder.last-ordered': { ar: 'آخر طلب: {date}', en: 'Last ordered: {date}' },

  // ---- recurring ----
  'mobile.recurring.title': { ar: 'حجوزات متكررة', en: 'Recurring Bookings' },
  'mobile.recurring.freq': {
    ar: '{recurrence} · {count} مرات',
    en: '{recurrence} · {count} times',
  },

  // ---- price-drop-alerts ----
  'mobile.priceDropAlerts.title': { ar: 'تنبيهات الأسعار', en: 'Price Drop Alerts' },
  'mobile.priceDropAlerts.dropped': { ar: '{price} ر.س', en: '{price} SAR' },

  // ---- personalized-feed ----
  'mobile.personalizedFeed.title': { ar: 'خلاصتي', en: 'My Feed' },
  'mobile.personalizedFeed.price': { ar: '{price} ر.س', en: '{price} SAR' },

  // ---- skin-diary ----
  'mobile.skinDiary.title': { ar: 'يوميات البشرة', en: 'Skin Diary' },

  // ---- self-care ----
  'mobile.selfCare.title': { ar: 'العناية الذاتية', en: 'Self-Care' },
  'mobile.selfCare.duration': { ar: '{duration}', en: '{duration}' },

  // ---- sale-alerts ----
  'mobile.saleAlerts.title': { ar: 'تنبيهات التخفيضات', en: 'Sale Alerts' },

  // ---- routine-scheduler ----
  'mobile.routineScheduler.title': { ar: 'جدول الروتين', en: 'Routine Scheduler' },

  // ---- reschedule ----
  'mobile.reschedule.title': { ar: 'إعادة جدولة', en: 'Reschedule' },
  'mobile.reschedule.subtitle': {
    ar: 'غيري موعد حجوزاتكِ القادمة',
    en: 'Change the time of your upcoming bookings',
  },
  'mobile.reschedule.success': {
    ar: 'تمت إعادة الجدولة بنجاح',
    en: 'Booking rescheduled successfully',
  },
  'mobile.reschedule.no-reschedulable': {
    ar: 'مافي حجوزات قابلة لإعادة الجدولة',
    en: 'No bookings available to reschedule',
  },
  'mobile.reschedule.booking': { ar: 'حجز #{id}', en: 'Booking #{id}' },
  'mobile.reschedule.choose-new-date': {
    ar: 'اختر الموعد الجديد',
    en: 'Choose a new date & time',
  },
  'mobile.reschedule.reason-placeholder': {
    ar: 'سبب إعادة الجدولة (اختياري)',
    en: 'Reason for rescheduling (optional)',
  },
  'mobile.reschedule.confirm': { ar: 'تأكيد إعادة الجدولة', en: 'Confirm Reschedule' },

  // ---- rewards-marketplace ----
  'mobile.rewardsMarketplace.load-error': {
    ar: 'فشل تحميل المكافآت',
    en: 'Failed to load rewards',
  },
  'mobile.rewardsMarketplace.title': { ar: 'سوق المكافآت', en: 'Rewards Marketplace' },
  'mobile.rewardsMarketplace.subtitle': {
    ar: 'استبدلي نقاطكِ بمكافآت حصرية',
    en: 'Redeem your points for exclusive rewards',
  },
  'mobile.rewardsMarketplace.points-balance': { ar: 'رصيد نقاطكِ', en: 'Your points balance' },
  'mobile.rewardsMarketplace.tier-multiplier': {
    ar: '{tier} · مضاعف ×{multiplier}',
    en: '{tier} · Multiplier ×{multiplier}',
  },
  'mobile.rewardsMarketplace.redeemed': { ar: 'تم الاستبدال', en: 'Redeemed' },
  'mobile.rewardsMarketplace.redeem': { ar: 'استبدلي', en: 'Redeem' },
  'mobile.rewardsMarketplace.insufficient': {
    ar: 'نقاط غير كافية',
    en: 'Not enough points',
  },
  'mobile.rewardsMarketplace.points-history': { ar: 'سجل النقاط', en: 'Points history' },

  // ---- social ----
  'mobile.social.load-error': { ar: 'فشل تحميل المحتوى', en: 'Failed to load content' },
  'mobile.social.title': { ar: 'مجتمع الجمال', en: 'Beauty Community' },
  'mobile.social.subtitle': {
    ar: 'اكتشفي أحدث الصيحات والفنيات المميزات',
    en: 'Discover the latest trends and top service providers',
  },
  'mobile.social.tab-feed': { ar: 'الرئيسية', en: 'Feed' },
  'mobile.social.tab-trending': { ar: 'الرائج', en: 'Trending' },
  'mobile.social.tab-spotlight': { ar: 'التسليط', en: 'Spotlight' },
  'mobile.social.tab-tips': { ar: 'نصائح', en: 'Tips' },
  'mobile.social.trending-services': { ar: 'الخدمات الرائجة', en: 'Trending Services' },
  'mobile.social.bookings-count': { ar: '{count} حجز', en: '{count} bookings' },
  'mobile.social.spotlight-technicians': { ar: 'فنيات مميزات', en: 'Featured Service Providers' },
  'mobile.social.beauty-tips': { ar: 'نصائح تجميلية', en: 'Beauty Tips' },
  'mobile.social.lookbook': { ar: 'لوك بوك الموسم', en: 'Lookbook of the Season' },

  // ---- wellness-hub ----
  'mobile.wellnessHub.load-error': { ar: 'فشل تحميل البيانات', en: 'Failed to load data' },
  'mobile.wellnessHub.title': { ar: 'مركز العافية', en: 'Wellness Hub' },
  'mobile.wellnessHub.subtitle': {
    ar: 'نظرة شاملة على صحتكِ وجمالكِ',
    en: 'A complete overview of your health and beauty',
  },
  'mobile.wellnessHub.cycle-day': {
    ar: 'اليوم {day} من {length}',
    en: 'Day {day} of {length}',
  },
  'mobile.wellnessHub.next-cycle': {
    ar: 'الدورة القادمة بعد {days} يوم',
    en: 'Next cycle in {days} days',
  },
  'mobile.wellnessHub.mood': { ar: 'مزاج', en: 'Mood' },
  'mobile.wellnessHub.energy': { ar: 'طاقة', en: 'Energy' },
  'mobile.wellnessHub.sleep': { ar: 'نوم', en: 'Sleep' },
  'mobile.wellnessHub.water': { ar: 'ماء', en: 'Water' },
  'mobile.wellnessHub.weekly-summary': { ar: 'ملخص الأسبوع', en: 'Weekly Summary' },
  'mobile.wellnessHub.avg-mood': {
    ar: 'متوسط المزاج: {avg}/5',
    en: 'Average mood: {avg}/5',
  },
  'mobile.wellnessHub.avg-energy': {
    ar: 'متوسط الطاقة: {avg}/10',
    en: 'Average energy: {avg}/10',
  },
  'mobile.wellnessHub.recent-journals': { ar: 'آخر اليوميات', en: 'Recent Journal Entries' },
  'mobile.wellnessHub.action-checkin': { ar: 'تقييم', en: 'Check-in' },
  'mobile.wellnessHub.action-cycle': { ar: 'الدورة', en: 'Cycle' },
  'mobile.wellnessHub.action-skin': { ar: 'بشرة', en: 'Skin' },
  'mobile.wellnessHub.action-wellness': { ar: 'عافية', en: 'Wellness' },

  // ---- E4b — mental wellness + nutrition content ----
  'mobile.wellnessContent.breatheTitle': { ar: 'تمارين التنفس', en: 'Breathing exercises' },
  'mobile.wellnessContent.meditationTitle': { ar: 'تأملات قصيرة', en: 'Short meditations' },
  'mobile.wellnessContent.minutes': { ar: '{min} دقائق', en: '{min} min' },
  'mobile.wellnessContent.pattern': {
    ar: 'شهيق {inhale} · حبس {hold} · زفير {exhale} × {cycles}',
    en: 'Inhale {inhale} · hold {hold} · exhale {exhale} × {cycles}',
  },
  'mobile.wellnessContent.nutritionTitle': {
    ar: 'تغذية من أجل جمالك',
    en: 'Nutrition for your beauty',
  },
  // E6a — life-stage journeys + period pampering (mobile)
  'mobile.lifeStage.title': { ar: 'رحلتك الآن', en: 'Your journey now' },
  'mobile.lifeStage.pamper-title': { ar: 'تدليل ما قبل الدورة', en: 'Pre-period pampering' },
  'mobile.lifeStage.pamper-active': {
    ar: 'دورتكِ قريبة — دللي نفسك بهذه العروض',
    en: 'Your period is near — treat yourself',
  },
  // E6b — postpartum care (mobile)
  'mobile.postpartum.title': { ar: 'رعاية ما بعد الولادة', en: 'Postpartum care' },
  'mobile.postpartum.signals-title': { ar: 'متى تراجعين طبيبتك', en: 'When to see your doctor' },
  'mobile.postpartum.services': { ar: 'خدمات التعافي', en: 'Recovery services' },
  'mobile.postpartum.salons': {
    ar: 'زيارات منزلية ترحب بطفلك',
    en: 'Home visits that welcome your baby',
  },
  // E7 — beauty media layer (mobile)
  'mobile.beautyShorts.privacy': {
    ar: 'نساء فقط — المحتوى لا يغادر دائرة النساء',
    en: 'Women only — content stays in the women’s circle',
  },
  // E6c — menopause mode (mobile)
  'mobile.menopause.title': { ar: 'وضع انقطاع الطمث', en: 'Menopause mode' },
  'mobile.menopause.signals-title': { ar: 'متى تراجعين طبيبتك', en: 'When to see your doctor' },

  // ---- wallet/top-up ----
  'mobile.topUp.top-up-error': { ar: 'فشل شحن الرصيد', en: 'Failed to top up balance' },
  'mobile.topUp.invalid-amount': { ar: 'أدخلي مبلغاً صحيحاً', en: 'Enter a valid amount' },
  'mobile.topUp.range-error': {
    ar: 'المبلغ يجب أن يكون بين {min} و {max} ر.س',
    en: 'Amount must be between {min} and {max} SAR',
  },
  'mobile.topUp.title': { ar: 'شحن الرصيد', en: 'Top Up Balance' },
  'mobile.topUp.quick-amounts': { ar: 'المبالغ السريعة', en: 'Quick Amounts' },
  'mobile.topUp.amount-placeholder': { ar: 'أدخلي المبلغ', en: 'Enter amount' },

  // ---- video ----
  'mobile.booking.video-call': { ar: 'مكالمة فيديو', en: 'Video call' },
  'mobile.booking.family-member': {
    ar: 'حجز لصالح فرد من العائلة',
    en: 'Book for a family member',
  },
  'mobile.booking.pref.gentle': { ar: 'لطيف', en: 'Gentle' },
  'mobile.booking.pref.hypoallergenic': { ar: 'مضاد للحساسية', en: 'Hypoallergenic' },
  'mobile.booking.pref.fragrance_free': { ar: 'خالٍ من العطور', en: 'Fragrance-free' },
  'mobile.booking.pref.natural': { ar: 'طبيعي', en: 'Natural' },
  'mobile.booking.pref.quick': { ar: 'سريع', en: 'Quick' },
  'mobile.booking.pref.quiet': { ar: 'هادئ', en: 'Quiet' },
  'mobile.booking.family-member-none': { ar: 'لا (حجز لنفسي)', en: 'No (book for myself)' },
  'mobile.booking.on-behalf-of': { ar: 'على حساب: {name}', en: 'On behalf of: {name}' },
  'mobile.booking.per-hour': { ar: 'لكل ساعة', en: 'per hour' },
  'mobile.booking.babysitting-disclaimer': {
    ar: 'تنبيه: خدمة جليسة أطفال — يُرجى إضافة جهة اتصال للطوارئ في ملف الطفل. نتحقق من مقدمات الخدمة، ويبقى الأهل مسؤولين عن الإشراف النهائي.',
    en: 'Note: babysitting service — please add an emergency contact to the child profile. Providers are verified, but parents retain final supervision responsibility.',
  },
  'mobile.familyAccount.emergency-contact': { ar: 'جهة اتصال للطوارئ', en: 'Emergency contact' },
  'mobile.familyAccount.allergies': { ar: 'الحساسية', en: 'Allergies' },
  'mobile.familyAccount.edit-safety': { ar: 'تعديل بيانات السلامة', en: 'Edit safety details' },
  'mobile.familyAccount.save': { ar: 'حفظ', en: 'Save' },
  'mobile.familyAccount.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'mobile.familyAccount.saved': { ar: 'تم حفظ بيانات السلامة', en: 'Safety details saved' },
  'mobile.familyAccount.kids-services': { ar: 'تصفحي خدمات الأطفال', en: 'Browse kids services' },
  'mobile.booking.bundle-selected': {
    ar: 'باقة ماما وأنا: {name}',
    en: 'Mommy & Me bundle: {name}',
  },
  'mobile.services.mommy-friendly': { ar: 'مناسب للأمهات والأطفال', en: 'Mommy & kid friendly' },
  'mobile.video.unavailable': { ar: 'الجلسة غير متاحة', en: 'Session unavailable' },
  'mobile.video.start': { ar: 'بدء الاستشارة', en: 'Start consultation' },
  'mobile.video.start-failed': { ar: 'تعذر بدء الجلسة', en: 'Failed to start session' },
  'mobile.video.title': { ar: 'جلسة فيديو', en: 'Video Session' },
  'mobile.video.join-room': { ar: 'دخول الغرفة', en: 'Enter Room' },
  'mobile.video.unknown': { ar: 'غير معروف', en: 'Unknown' },
  'mobile.video.room-label': { ar: 'رقم الغرفة', en: 'Room number' },
  'mobile.video.booking-id': { ar: 'الحجز: {id}', en: 'Booking: {id}' },
  'mobile.video.connecting': { ar: 'جارٍ الاتصال…', en: 'Connecting…' },
  'mobile.video.waiting-peer': {
    ar: 'بانتظار انضمام الطرف الآخر…',
    en: 'Waiting for the other side to join…',
  },
  'mobile.video.peer-left': { ar: 'غادر الطرف الآخر الغرفة', en: 'The other side left the room' },
  'mobile.video.mute': { ar: 'كتم الصوت', en: 'Mute' },
  'mobile.video.unmute': { ar: 'تشغيل الصوت', en: 'Unmute' },
  'mobile.video.camera-on': { ar: 'إيقاف الكاميرا', en: 'Stop camera' },
  'mobile.video.camera-off': { ar: 'تشغيل الكاميرا', en: 'Start camera' },
  'mobile.video.end-call': { ar: 'إنهاء المكالمة', en: 'End call' },
  'mobile.video.permission-denied': {
    ar: 'تعذر الوصول إلى الكاميرا أو الميكروفون',
    en: 'Could not access camera or microphone',
  },

  // ---- gift-card-market ----
  'mobile.giftCardMarket.title': { ar: 'سوق البطاقات', en: 'Gift Card Market' },
  'mobile.giftCardMarket.save': { ar: 'وفر {percent}%', en: 'Save {percent}%' },
  'mobile.giftCardMarket.buy': { ar: 'شراء', en: 'Buy' },

  // ---- gift-registry ----
  'mobile.giftRegistry.title': { ar: 'سجل الهدايا', en: 'Gift Registry' },

  // ---- group-bookings ----
  'mobile.groupBookings.title': { ar: 'الحجوزات الجماعية', en: 'Group Bookings' },
  'mobile.groupBookings.members-summary': {
    ar: '{count} أفراد · {total} ر.س',
    en: '{count} members · {total} SAR',
  },
  'mobile.groupBookings.status-confirmed': { ar: 'مؤكد', en: 'Confirmed' },
  'mobile.groupBookings.status-pending': { ar: 'قيد الانتظار', en: 'Pending' },
  'mobile.groupBookings.status-completed': { ar: 'مكتمل', en: 'Completed' },
  'mobile.groupBookings.status-cancelled': { ar: 'ملغي', en: 'Cancelled' },
  'mobile.groupBookings.status-in-progress': { ar: 'جاري', en: 'In Progress' },
  'mobile.groupBookings.status-unknown': { ar: 'غير معروف', en: 'Unknown' },
  'mobile.groupBookings.load-error': { ar: 'تعذر تحميل التفاصيل', en: 'Failed to load details' },
  'mobile.groupBookings.amount': { ar: 'المبلغ', en: 'Amount' },
  'mobile.groupBookings.discount': { ar: 'خصم: {value}%', en: 'Discount: {value}%' },

  // ---- hair-care-guide ----
  'mobile.hairCareGuide.title': { ar: 'دليل العناية بالشعر', en: 'Hair Care Guide' },
  'mobile.hairCareGuide.subtitle': {
    ar: 'كل ما تحتاجينه لشعر صحي وجميل',
    en: 'Everything you need for healthy, beautiful hair',
  },

  // ---- hair-color-sim ----
  'mobile.hairColorSim.title': { ar: 'محاكي لون الشعر', en: 'Hair Color Simulator' },
  'mobile.hairColorSim.subtitle': { ar: 'اختاري لون شعرك الجديد', en: 'Pick your new hair color' },

  // ---- home-service ----
  'mobile.homeService.title': { ar: 'خدمة منزلية', en: 'Home Service' },
  'mobile.homeService.estimate': { ar: 'تقدير التكلفة — الرياض', en: 'Estimate Cost — Riyadh' },

  // ---- inspiration ----
  'mobile.inspiration.title': { ar: 'لوحة الإلهام', en: 'Inspiration Board' },

  // ---- invoices ----
  'mobile.invoices.title': { ar: 'الفواتير الإلكترونية', en: 'E-Invoices' },
  'mobile.invoices.load-error': { ar: 'فشل تحميل الفواتير', en: 'Failed to load invoices' },
  'mobile.invoices.empty': { ar: 'لا توجد فواتير', en: 'No invoices' },
  'mobile.invoices.status-reported': { ar: 'مبلغ عنه', en: 'Reported' },
  'mobile.invoices.status-cleared': { ar: 'تم التخليص', en: 'Cleared' },
  'mobile.invoices.status-rejected': { ar: 'مرفوض', en: 'Rejected' },

  // ---- iot-sync ----
  'mobile.iotSync.title': { ar: 'الأجهزة الذكية', en: 'Smart Devices' },
  'mobile.iotSync.connected': { ar: 'متصل', en: 'Connected' },
  'mobile.iotSync.disconnected': { ar: 'غير متصل', en: 'Disconnected' },
  'mobile.iotSync.sync': { ar: 'مزامنة', en: 'Sync' },
  'mobile.iotSync.link': { ar: 'ربط', en: 'Link' },

  // ---- last-mile ----
  'mobile.lastMile.title': { ar: 'توصيل سريع', en: 'Fast Delivery' },
  'mobile.lastMile.ordered': { ar: 'تم الطلب!', en: 'Order placed!' },
  'mobile.lastMile.summary': { ar: '{estimated} · {total} ر.س', en: '{estimated} · {total} SAR' },
  'mobile.lastMile.order': { ar: 'اطلب', en: 'Order' },

  // ---- leadership ----
  'mobile.leadership.title': { ar: 'القيادة', en: 'Leadership' },
  'mobile.leadership.subtitle': {
    ar: 'تمكين المرأة في عالم التجميل',
    en: 'Empowering women in the beauty industry',
  },

  // ---- life-events ----
  'mobile.lifeEvents.title': { ar: 'مراحل الحياة', en: 'Life Stages' },
  'mobile.lifeEvents.subtitle': {
    ar: 'لكل مرحلة عمرية جمالها الخاص',
    en: 'Every stage of life has its own beauty',
  },

  // ---- live-chat ----
  'mobile.liveChat.title': { ar: 'الدعم المباشر', en: 'Live Support' },
  'mobile.liveChat.input-placeholder': { ar: 'اكتبي...', en: 'Type a message...' },
  'mobile.liveChat.send': { ar: 'إرسال', en: 'Send' },

  // ---- loyalty-punch-card ----
  'mobile.loyaltyPunchCard.title': { ar: 'بطاقة الولاء', en: 'Loyalty Card' },

  // ---- makeup-guide ----
  'mobile.makeupGuide.title': { ar: 'دليل المكياج', en: 'Makeup Guide' },
  'mobile.makeupGuide.subtitle': {
    ar: 'كل ما تحتاجينه لإطلالة مثالية',
    en: 'Everything you need for a perfect look',
  },

  // ---- mood-board ----
  'mobile.moodBoard.title': { ar: 'لوحة المود', en: 'Mood Board' },

  // ---- my-journey ----
  'mobile.myJourney.title': { ar: 'رحلتي', en: 'My Journey' },
  'mobile.myJourney.load-error': { ar: 'فشل تحميل الرحلة', en: 'Failed to load your journey' },
  'mobile.myJourney.empty': { ar: 'لا توجد بيانات', en: 'No data yet' },

  // ---- my-subscription ----
  'mobile.mySubscription.title': { ar: 'اشتراكي', en: 'My Subscription' },
  'mobile.mySubscription.auto-renew': { ar: 'تجديد تلقائي', en: 'Auto-renew' },
  'mobile.mySubscription.no-renewal': { ar: 'بدون تجديد', en: 'No renewal' },
  'mobile.mySubscription.not-subscribed': { ar: 'غير مشترك', en: 'Not subscribed' },
  'mobile.mySubscription.no-active': { ar: 'لا يوجد اشتراك نشط', en: 'No active subscription' },

  // ---- nail-care-guide ----
  'mobile.nailCareGuide.title': { ar: 'دليل العناية بالأظافر', en: 'Nail Care Guide' },
  'mobile.nailCareGuide.subtitle': {
    ar: 'كل ما تحتاجينه لأظافر جميلة وصحية',
    en: 'Everything you need for beautiful, healthy nails',
  },

  // ---- newsletter ----
  'mobile.newsletter.title': { ar: 'النشرة البريدية', en: 'Newsletter' },
  'mobile.newsletter.email-placeholder': { ar: 'بريدكِ الإلكتروني', en: 'Your email' },
  'mobile.newsletter.subscribe': { ar: 'اشتراك', en: 'Subscribe' },
  'mobile.newsletter.subscribed': { ar: 'تم الاشتراك!', en: 'Subscribed!' },

  // ---- night-mode ----
  'mobile.nightMode.title': { ar: 'الوضع الليلي', en: 'Night Mode' },
  'mobile.nightMode.enable': { ar: 'تفعيل الوضع الليلي', en: 'Enable night mode' },
  'mobile.nightMode.colors': { ar: 'الألوان', en: 'Colors' },
  'mobile.nightMode.desc': {
    ar: 'خلفيات داكنة ونصوص فاتحة لتجربة مريحة للعين في الإضاءة المنخفضة',
    en: 'Dark backgrounds and light text for comfortable viewing in low light',
  },
  'mobile.nightMode.preview': { ar: 'معاينة للوضع الليلي', en: 'Night mode preview' },
  'mobile.nightMode.hint': {
    ar: 'الوضع الليلي يقلل إجهاد العين ويوفر البطارية',
    en: 'Night mode reduces eye strain and saves battery',
  },

  // ---- notifications ----
  'mobile.notifications.title': { ar: 'الإشعارات', en: 'Notifications' },
  'mobile.notifications.load-error': {
    ar: 'فشل تحميل الإشعارات',
    en: 'Failed to load notifications',
  },
  'mobile.notifications.empty-title': { ar: 'لا توجد إشعارات', en: 'No notifications' },
  'mobile.notifications.empty-desc': {
    ar: 'لم تصلك أي إشعارات بعد',
    en: 'You have not received any notifications yet',
  },
  'mobile.notifications.mark-all': { ar: 'تحديد الكل كمقروء', en: 'Mark all as read' },

  // ---- notification-settings ----
  'mobile.notificationSettings.title': { ar: 'إعدادات الإشعارات', en: 'Notification Settings' },
  'mobile.notificationSettings.bookings': { ar: 'الحجوزات', en: 'Bookings' },
  'mobile.notificationSettings.promo': { ar: 'العروض', en: 'Promotions' },
  'mobile.notificationSettings.chat': { ar: 'المحادثة', en: 'Chat' },
  'mobile.notificationSettings.reviews': { ar: 'التقييمات', en: 'Reviews' },

  // ---- payments ----
  'mobile.payments.title': { ar: 'المدفوعات', en: 'Payments' },
  'mobile.payments.load-error': { ar: 'فشل تحميل المدفوعات', en: 'Failed to load payments' },
  'mobile.payments.empty': { ar: 'لا توجد مدفوعات', en: 'No payments' },

  // ---- pen-pal ----
  'mobile.penPal.title': { ar: 'صديقة الجمال', en: 'Beauty Buddy' },
  'mobile.penPal.no-match': { ar: 'لم تجدِ صديقة بعد', en: 'No match yet' },

  // ---- perfume-guide ----
  'mobile.perfumeGuide.title': { ar: 'دليل العطور', en: 'Perfume Guide' },
  'mobile.perfumeGuide.subtitle': {
    ar: 'كل ما تحتاجينه عن عالم العطور الشرقية والغربية',
    en: 'Everything you need to know about Eastern and Western fragrances',
  },

  // ---- personal-care ----
  'mobile.personalCare.title': { ar: 'العناية الشخصية', en: 'Personal Care' },
  'mobile.personalCare.subtitle': {
    ar: 'تفاصيل صغيرة — تأثير كبير',
    en: 'Small details — big impact',
  },

  // ---- profile ----
  'mobile.profile.title': { ar: 'حسابي', en: 'My Account' },
  'mobile.profile.load-error': { ar: 'فشل تحميل الملف الشخصي', en: 'Failed to load profile' },
  'mobile.profile.name': { ar: 'الاسم', en: 'Name' },
  'mobile.profile.email': { ar: 'البريد', en: 'Email' },
  'mobile.profile.phone': { ar: 'الهاتف', en: 'Phone' },
  'mobile.profile.role': { ar: 'الدور', en: 'Role' },
  'mobile.profile.role-customer': { ar: 'عميلة', en: 'Customer' },
  'mobile.profile.role-technician': { ar: 'مقدمة خدمة', en: 'Service Provider' },
  'mobile.profile.role-supervisor': { ar: 'مشرفة', en: 'Supervisor' },
  'mobile.profile.language': { ar: 'اللغة', en: 'Language' },
  'mobile.profile.lang-ar': { ar: 'العربية', en: 'Arabic' },
  'mobile.profile.edit': { ar: 'تعديل الملف', en: 'Edit Profile' },

  // ---- safety ----
  'mobile.safety.title': { ar: 'السلامة', en: 'Safety' },
  'mobile.safety.subtitle': { ar: 'سلامتكِ أولويتنا', en: 'Your safety is our priority' },
  'mobile.safety.activate': { ar: 'تفعيل', en: 'Activate' },

  // ---- salon-membership ----
  'mobile.salonMembership.title': { ar: 'عضويات الصالون', en: 'Salon Memberships' },
  'mobile.salonMembership.subtitle': {
    ar: 'اختاري العضوية اللي تناسبكِ',
    en: 'Choose the membership that suits you',
  },
  'mobile.salonMembership.load-error': {
    ar: 'فشل تحميل العضويات',
    en: 'Failed to load memberships',
  },
  'mobile.salonMembership.current': { ar: 'عضويتكِ الحالية', en: 'Your current membership' },
  'mobile.salonMembership.tier-platinum': { ar: 'بلاتينية', en: 'Platinum' },
  'mobile.salonMembership.tier-premium': { ar: 'مميزة', en: 'Premium' },
  'mobile.salonMembership.tier-basic': { ar: 'أساسية', en: 'Basic' },
  'mobile.salonMembership.cancel-auto-renew': {
    ar: 'إلغاء التجديد التلقائي',
    en: 'Cancel auto-renewal',
  },
  'mobile.salonMembership.free': { ar: 'مجانية', en: 'Free' },
  'mobile.salonMembership.monthly-price': { ar: '{price} ر.س / شهرياً', en: '{price} SAR / month' },
  'mobile.salonMembership.benefits': { ar: 'المميزات', en: 'Benefits' },
  'mobile.salonMembership.not-included': { ar: 'غير متضمن', en: 'Not included' },
  'mobile.salonMembership.subscribe': { ar: 'اشتراك', en: 'Subscribe' },

  // ---- seasonal-calendar ----
  'mobile.seasonalCalendar.title': { ar: 'تقويم الجمال', en: 'Beauty Calendar' },
  'mobile.seasonalCalendar.subtitle': {
    ar: 'خدمات موسمية مصممة لبشرتكِ',
    en: 'Seasonal services designed for your skin',
  },
  'mobile.seasonalCalendar.season-services': { ar: 'خدمات الموسم', en: 'Seasonal Services' },
  'mobile.seasonalCalendar.book': { ar: 'احجزي خدمات الموسم', en: 'Book Seasonal Services' },

  // ---- skin-analysis ----
  'mobile.skinAnalysis.title': { ar: 'تحليل البشرة بالذكاء الاصطناعي', en: 'AI Skin Analysis' },
  'mobile.skinAnalysis.upload-title': { ar: 'حملي صورة لبشرتك', en: 'Upload a photo of your skin' },
  'mobile.skinAnalysis.upload-hint': {
    ar: 'التقطي صورة أو أدخلي رابط الصورة',
    en: 'Take a photo or enter an image URL',
  },
  'mobile.skinAnalysis.capturing': { ar: 'جاري التصوير...', en: 'Capturing...' },
  'mobile.skinAnalysis.capture': { ar: 'التقاط صورة', en: 'Take Photo' },
  'mobile.skinAnalysis.analyze': { ar: 'تحليل', en: 'Analyze' },
  'mobile.skinAnalysis.analyze-error': {
    ar: 'فشل تحليل الصورة. حاولي مجدداً.',
    en: 'Failed to analyze the photo. Try again.',
  },
  'mobile.skinAnalysis.capture-success': {
    ar: 'تم التقاط الصورة بنجاح. اضغطي على تحليل للمتابعة.',
    en: 'Photo captured successfully. Tap Analyze to continue.',
  },
  'mobile.skinAnalysis.url-required': {
    ar: 'الرجاء إدخال رابط الصورة',
    en: 'Please enter an image URL',
  },
  'mobile.skinAnalysis.type-dry': { ar: 'جافة', en: 'Dry' },
  'mobile.skinAnalysis.type-oily': { ar: 'دهنية', en: 'Oily' },
  'mobile.skinAnalysis.type-combination': { ar: 'مختلطة', en: 'Combination' },
  'mobile.skinAnalysis.type-normal': { ar: 'عادية', en: 'Normal' },
  'mobile.skinAnalysis.type-sensitive': { ar: 'حساسة', en: 'Sensitive' },
  'mobile.skinAnalysis.type-unknown': { ar: 'غير محدد', en: 'Unknown' },
  'mobile.skinAnalysis.results': { ar: 'نتائج التحليل', en: 'Analysis results' },
  'mobile.skinAnalysis.skin-type': { ar: 'نوع البشرة', en: 'Skin type' },
  'mobile.skinAnalysis.concerns': { ar: 'المشاكل', en: 'Concerns' },
  'mobile.skinAnalysis.hydration': { ar: 'مستوى الترطيب', en: 'Hydration level' },
  'mobile.skinAnalysis.sensitivity': { ar: 'مستوى الحساسية', en: 'Sensitivity level' },
  'mobile.skinAnalysis.age-estimate': { ar: 'العمر التقديري', en: 'Estimated age' },
  'mobile.skinAnalysis.recommendations': { ar: 'التوصيات', en: 'Recommendations' },
  'mobile.skinAnalysis.history': { ar: 'التحليلات السابقة', en: 'Previous analyses' },
  'mobile.skinAnalysis.empty-title': { ar: 'لا توجد تحليلات سابقة', en: 'No previous analyses' },
  'mobile.skinAnalysis.empty-desc': {
    ar: 'حملي أول صورة لتحليل بشرتك',
    en: 'Upload your first photo to analyze your skin',
  },
  'mobile.skinAnalysis.uploading': { ar: 'جارٍ رفع الصورة…', en: 'Uploading photo…' },
  'mobile.skinAnalysis.upload-error': {
    ar: 'فشل رفع الصورة، حاولي مرة أخرى',
    en: 'Upload failed, please try again',
  },
  'mobile.skinAnalysis.capture-retry': {
    ar: 'تعذر قراءة الصورة، أعيدي الالتقاط',
    en: 'Could not read the photo, please retake it',
  },

  // ---- 2.5 social commerce (beauty-posts) ----
  'mobile.beautyPosts.title': { ar: 'إطلالاتي', en: 'My Galaxy Looks' },
  'mobile.beautyPosts.subtitle': {
    ar: 'كل إطلالة قابلة للشراء — اضغطي على الوسوم',
    en: 'Every look is shoppable — tap the tags',
  },
  'mobile.beautyPosts.verified': { ar: 'موثقة', en: 'Verified' },
  'mobile.beautyPosts.get-this-look': { ar: 'احصلي على هذه الإطلالة', en: 'Get this look' },
  'mobile.beautyPosts.add-to-cart': { ar: 'أضيفي للسلة', en: 'Add to cart' },
  'mobile.beautyPosts.added-to-cart': { ar: 'تمت الإضافة إلى السلة', en: 'Added to cart' },
  'mobile.beautyPosts.cart-error': { ar: 'فشل الإضافة إلى السلة', en: 'Could not add to cart' },
  'mobile.beautyPosts.book': { ar: 'احجزي', en: 'Book' },
  'mobile.beautyPosts.comments': { ar: 'التعليقات', en: 'Comments' },
  'mobile.beautyPosts.comment-placeholder': { ar: 'أضيفي تعليقاً…', en: 'Add a comment…' },
  'mobile.beautyPosts.send': { ar: 'إرسال', en: 'Send' },
  'mobile.beautyPosts.home-title': { ar: 'إطلالات مميزة', en: 'Featured looks' },
  'mobile.beautyPosts.view-all': { ar: 'الكل', en: 'All' },

  // ---- skincare-guide ----
  'mobile.skincareGuide.title': { ar: 'دليل المكونات', en: 'Ingredient Guide' },
  'mobile.skincareGuide.subtitle': {
    ar: 'كل ما تحتاجين معرفته عن المكونات الفعالة للعناية بالبشرة',
    en: 'Everything you need to know about effective skincare ingredients',
  },

  // ---- skin-timeline ----
  'mobile.skinTimeline.title': { ar: 'تطور البشرة', en: 'Skin Journey' },
  'mobile.skinTimeline.subtitle': {
    ar: 'تابعي رحلة بشرتكِ عبر الزمن',
    en: 'Follow your skin journey through time',
  },
  'mobile.skinTimeline.cancel-compare': { ar: 'إلغاء المقارنة', en: 'Cancel comparison' },
  'mobile.skinTimeline.weekly-compare': { ar: 'مقارنة أسبوعية', en: 'Weekly Comparison' },
  'mobile.skinTimeline.last-week': { ar: 'الأسبوع الماضي', en: 'Last Week' },
  'mobile.skinTimeline.this-week': { ar: 'هذا الأسبوع', en: 'This Week' },
  'mobile.skinTimeline.skin-update': { ar: 'تحديث البشرة', en: 'Skin update' },
  'mobile.skinTimeline.stats': { ar: 'إحصائيات', en: 'Stats' },
  'mobile.skinTimeline.hydration-improvement': { ar: 'تحسن الترطيب', en: 'Hydration improvement' },
  'mobile.skinTimeline.glow-improvement': { ar: 'تحسن النضارة', en: 'Glow improvement' },
  'mobile.skinTimeline.updates': { ar: 'تحديثات', en: 'Updates' },

  // ---- social-challenges ----
  'mobile.socialChallenges.title': { ar: 'تحديات اجتماعية', en: 'Social Challenges' },
  'mobile.socialChallenges.subtitle': {
    ar: 'انضمي للتحديات الجماعية وكسبي مكافآت',
    en: 'Join group challenges and earn rewards',
  },
  'mobile.socialChallenges.my-challenges': {
    ar: 'تحدياتي ({count})',
    en: 'My Challenges ({count})',
  },
  'mobile.socialChallenges.no-challenges': {
    ar: 'لم تنضمي لأي تحدي بعد',
    en: 'You have not joined any challenges yet',
  },
  'mobile.socialChallenges.joined': { ar: 'منضم', en: 'Joined' },
  'mobile.socialChallenges.join': { ar: 'انضمام', en: 'Join' },

  // ---- subscriptions ----
  'mobile.subscriptions.title': { ar: 'اشتراكاتي', en: 'My Subscriptions' },
  'mobile.subscriptions.load-error': {
    ar: 'فشل تحميل الاشتراكات',
    en: 'Failed to load subscriptions',
  },
  'mobile.subscriptions.current': { ar: 'الاشتراك الحالي', en: 'Current subscription' },
  'mobile.subscriptions.plan': { ar: 'خطة', en: 'Plan' },
  'mobile.subscriptions.active': { ar: 'نشط', en: 'Active' },
  'mobile.subscriptions.paused': { ar: 'متوقف', en: 'Paused' },
  'mobile.subscriptions.expires': { ar: 'ينتهي: {date}', en: 'Expires: {date}' },
  'mobile.subscriptions.available-plans': { ar: 'الباقات المتاحة', en: 'Available plans' },
  'mobile.subscriptions.per-month': { ar: '/ شهر', en: '/ month' },
  'mobile.subscriptions.subscribe-now': { ar: 'اشتركي الآن', en: 'Subscribe now' },

  // ---- sustainability ----
  'mobile.sustainability.title': {
    ar: 'الاستدامة والإتاحة',
    en: 'Sustainability & Accessibility',
  },
  'mobile.sustainability.subtitle': {
    ar: 'جمال مستدام — للجميع',
    en: 'Sustainable beauty — for everyone',
  },

  // ---- tech-waitlist ----
  'mobile.techWaitlist.my-lists': { ar: 'قوائمي', en: 'My Lists' },
  'mobile.techWaitlist.position': { ar: 'الموقع: {position}', en: 'Position: {position}' },
  'mobile.techWaitlist.leave': { ar: 'خروج', en: 'Leave' },
  'mobile.techWaitlist.popular': {
    ar: 'الفنيات الأكثر طلباً',
    en: 'Most Requested Service Providers',
  },
  'mobile.techWaitlist.waiting': {
    ar: '{rating} · {count} في الانتظار',
    en: '{rating} · {count} waiting',
  },
  'mobile.techWaitlist.join': { ar: 'انضمام', en: 'Join' },

  // ---- travel-checklist ----
  'mobile.travelChecklist.subtitle': {
    ar: 'قائمة مستلزمات الجمال للسفر',
    en: 'A beauty essentials checklist for travel',
  },
  'mobile.travelChecklist.progress': { ar: '{progress}% جاهز', en: '{progress}% ready' },
  'mobile.travelChecklist.list': { ar: 'القائمة', en: 'The List' },

  // ---- virtual-consultation ----
  'mobile.virtualConsultation.title': { ar: 'استشارة افتراضية', en: 'Virtual Consultation' },
  'mobile.virtualConsultation.subtitle': {
    ar: 'استشيري خبيرات التجميل عبر الفيديو',
    en: 'Consult beauty experts over video',
  },
  'mobile.virtualConsultation.load-error': {
    ar: 'فشل تحميل الاستشارات',
    en: 'Failed to load consultations',
  },
  'mobile.virtualConsultation.booked': { ar: 'تم الحجز بنجاح', en: 'Booking confirmed' },
  'mobile.virtualConsultation.choose-time': {
    ar: 'اختر الوقت — {name}',
    en: 'Choose a time — {name}',
  },
  'mobile.virtualConsultation.book-cta': { ar: 'احجزي — {price} ر.س', en: 'Book — {price} SAR' },
  'mobile.virtualConsultation.my-bookings': { ar: 'حجوزاتي', en: 'My bookings' },

  // ---- virtual-try-on ----
  'mobile.virtualTryOn.title': { ar: 'تجربة افتراضية', en: 'Virtual Try-On' },
  'mobile.virtualTryOn.subtitle': {
    ar: 'جربي ألوان المكياج افتراضياً',
    en: 'Try makeup colors virtually',
  },
  'mobile.virtualTryOn.type.lips': { ar: 'شفاه', en: 'Lips' },
  'mobile.virtualTryOn.type.eyes': { ar: 'عيون', en: 'Eyes' },
  'mobile.virtualTryOn.type.blush': { ar: 'خدود', en: 'Blush' },
  'mobile.virtualTryOn.type.nails': { ar: 'أظافر', en: 'Nails' },
  'mobile.virtualTryOn.intensity': { ar: 'الكثافة', en: 'Intensity' },
  'mobile.virtualTryOn.capture': { ar: 'التقاط ومشاركة', en: 'Capture & share' },
  'mobile.virtualTryOn.bookThisLook': { ar: 'احجزي هذه الإطلالة', en: 'Book this look' },
  'mobile.virtualTryOn.shareText': {
    ar: 'جربت إطلالتي على جالكسي بيوتي!',
    en: 'Tried my look on Galaxy of Beauty!',
  },
  'mobile.virtualTryOn.cameraDenied': {
    ar: 'يحتاج التطبيق إذن الكاميرا لتفعيل التجربة',
    en: 'Camera permission is needed for the live try-on',
  },
  'mobile.virtualTryOn.retry': { ar: 'إعادة المحاولة', en: 'Retry' },
  'mobile.virtualTryOn.share': { ar: 'مشاركة', en: 'Share' },

  // ---- wellness ----
  'mobile.wellness.title': { ar: 'الصحة والعافية', en: 'Health & Wellness' },
  'mobile.wellness.subtitle': {
    ar: 'جمالكِ يبدأ من صحتكِ',
    en: 'Your beauty starts with your health',
  },

  // ---- wellness-hub ----
  'mobile.wellnessHub.skin-analysis': { ar: 'تحليل البشرة', en: 'Skin Analysis' },
  'mobile.wellnessHub.skin-type-label': { ar: 'النوع:', en: 'Type:' },

  // ---- wishlist ----
  'mobile.wishlist.title': { ar: 'المفضلة', en: 'Favorites' },
  'mobile.wishlist.load-error': { ar: 'فشل تحميل المفضلة', en: 'Failed to load favorites' },
  'mobile.wishlist.empty-title': { ar: 'لا توجد خدمات مفضلة', en: 'No favorite services' },
  'mobile.wishlist.empty-desc': {
    ar: 'أضيفي خدماتكِ المفضلة لتجديها بسرعة',
    en: 'Add your favorite services to find them quickly',
  },
  'mobile.wishlist.service-fallback': { ar: 'خدمة #{id}', en: 'Service #{id}' },

  // ---- onboarding tour (§3.6 — RN walkthrough engine) ----
  'mobile.tour.bookTitle': { ar: 'احجزي أول خدمة', en: 'Book your first service' },
  'mobile.tour.bookBody': {
    ar: 'من زر «احجزي الآن» تختارين الخدمة والفنية والوقت — الدفع عند الوصول أو أونلاين، وأنتِ تتحكمين بكل التفاصيل.',
    en: 'From “Book now” pick a service, technician and time — pay at the venue or online, with full control over the details.',
  },
  'mobile.tour.walletTitle': { ar: 'محفظتك وميزانيتك', en: 'Your wallet & budget' },
  'mobile.tour.walletBody': {
    ar: 'رصيدك، بطاقات الهدايا، والميزانية الشهرية في مكان واحد — اشحني وتابعي مصاريفك من هذه البطاقة.',
    en: 'Balance, gift cards and monthly budget in one place — top up and track spending from this card.',
  },
  'mobile.tour.aiTitle': { ar: 'بيوتي AI — مستشارتك', en: 'Beauty AI, your advisor' },
  'mobile.tour.aiBody': {
    ar: 'اسألي مستشارة الذكاء الاصطناعي عن روتينك، بشرتك، أو أي سؤال تجميلي — متاحة على مدار الساعة وبخصوصية كاملة.',
    en: 'Ask the AI advisor about your routine, skin or any beauty question — available 24/7 with complete privacy.',
  },
  'mobile.tour.wellnessTitle': { ar: 'مركز العافية', en: 'Your wellness hub' },
  'mobile.tour.wellnessBody': {
    ar: 'دورتك، حالتك المزاجية، نصائح ما بعد الجلسات والمزيد — كل رحلتك الصحية في صفحة واحدة تتبع مرحلة حياتك.',
    en: 'Your cycle, mood, post-treatment care and more — your whole wellness journey in one life-stage-aware page.',
  },
  'mobile.tour.referralsTitle': { ar: 'دعوة الصديقات', en: 'Invite your friends' },
  'mobile.tour.referralsBody': {
    ar: 'شاركي رابطك الخاص واكسبي مكافآت عندما تنضم صديقاتك — جمال مشترك، مكافآت مشتركة.',
    en: 'Share your personal link and earn rewards when friends join — shared beauty, shared rewards.',
  },
  'mobile.tour.next': { ar: 'التالي', en: 'Next' },
  'mobile.tour.back': { ar: 'السابق', en: 'Back' },
  'mobile.tour.skip': { ar: 'تخطي', en: 'Skip' },
  'mobile.tour.done': { ar: 'تمام، لنبدأ!', en: 'Done, let’s go!' },
  'mobile.tour.progress': { ar: '{current} من {total}', en: '{current} of {total}' },

  // ---- skincare-guide: ingredient guide content (i18n sweep) ----
  'mobile.skincareGuide.ingredient.vitaminC.title': { ar: 'فيتامين سي', en: 'Vitamin C' },
  'mobile.skincareGuide.ingredient.vitaminC.subtitle': {
    ar: 'مضاد الأكسدة الأقوى',
    en: 'The strongest antioxidant',
  },
  'mobile.skincareGuide.ingredient.vitaminC.tip1': {
    ar: 'صباحاً — قبل واقي الشمس',
    en: 'Morning — before sunscreen',
  },
  'mobile.skincareGuide.ingredient.vitaminC.tip2': {
    ar: 'يفتح التصبغات ويوحد اللون',
    en: 'Brightens pigmentation and evens skin tone',
  },
  'mobile.skincareGuide.ingredient.vitaminC.tip3': {
    ar: 'يعزز حماية واقي الشمس',
    en: 'Boosts your sunscreen’s protection',
  },
  'mobile.skincareGuide.ingredient.vitaminC.tip4': {
    ar: 'L-Ascorbic Acid — أقوى صيغة',
    en: 'L-Ascorbic Acid — the most potent form',
  },
  'mobile.skincareGuide.ingredient.retinol.title': { ar: 'الريتينول', en: 'Retinol' },
  'mobile.skincareGuide.ingredient.retinol.subtitle': {
    ar: 'المكون السحري للبشرة',
    en: 'The magic ingredient for skin',
  },
  'mobile.skincareGuide.ingredient.retinol.tip1': {
    ar: 'مساءً فقط — يتحسس من الشمس',
    en: 'Evening only — it increases sun sensitivity',
  },
  'mobile.skincareGuide.ingredient.retinol.tip2': {
    ar: 'كمية حبة بازلاء — للوجه كله',
    en: 'A pea-sized amount — for the whole face',
  },
  'mobile.skincareGuide.ingredient.retinol.tip3': {
    ar: 'ابدئي مرة أسبوعياً — ثم زيدي تدريجياً',
    en: 'Start once a week — then build up gradually',
  },
  'mobile.skincareGuide.ingredient.retinol.tip4': {
    ar: 'واقي شمس في الصباح — ضروري جداً',
    en: 'Sunscreen in the morning — absolutely essential',
  },
  'mobile.skincareGuide.ingredient.hyaluronicAcid.title': {
    ar: 'حمض الهيالورونيك',
    en: 'Hyaluronic Acid',
  },
  'mobile.skincareGuide.ingredient.hyaluronicAcid.subtitle': {
    ar: 'ملك الترطيب',
    en: 'The king of hydration',
  },
  'mobile.skincareGuide.ingredient.hyaluronicAcid.tip1': {
    ar: 'يحمل 1000 ضعف وزنه ماء',
    en: 'Holds 1000x its weight in water',
  },
  'mobile.skincareGuide.ingredient.hyaluronicAcid.tip2': {
    ar: 'يطبق على بشرة رطبة — وليس جافة',
    en: 'Apply to damp skin — not dry',
  },
  'mobile.skincareGuide.ingredient.hyaluronicAcid.tip3': {
    ar: 'مع فيتامين سي — ثنائي رائع',
    en: 'With vitamin C — a great duo',
  },
  'mobile.skincareGuide.ingredient.hyaluronicAcid.tip4': {
    ar: 'يناسب جميع أنواع البشرة',
    en: 'Suits all skin types',
  },
  'mobile.skincareGuide.ingredient.niacinamide.title': { ar: 'نياسيناميد', en: 'Niacinamide' },
  'mobile.skincareGuide.ingredient.niacinamide.subtitle': {
    ar: 'فيتامين B3 المتعدد الفوائد',
    en: 'Vitamin B3 with multiple benefits',
  },
  'mobile.skincareGuide.ingredient.niacinamide.tip1': {
    ar: 'يقلص المسام — بشرة أنعم',
    en: 'Shrinks pores — smoother skin',
  },
  'mobile.skincareGuide.ingredient.niacinamide.tip2': {
    ar: 'يوحد اللون — يقلل التصبغات',
    en: 'Evens skin tone — reduces pigmentation',
  },
  'mobile.skincareGuide.ingredient.niacinamide.tip3': {
    ar: 'يقوي حاجز البشرة',
    en: 'Strengthens the skin barrier',
  },
  'mobile.skincareGuide.ingredient.niacinamide.tip4': {
    ar: 'آمن مع معظم المكونات — صباح ومساء',
    en: 'Safe with most ingredients — morning and evening',
  },
  'mobile.skincareGuide.ingredient.azelaicAcid.title': { ar: 'حمض الأزيليك', en: 'Azelaic Acid' },
  'mobile.skincareGuide.ingredient.azelaicAcid.subtitle': {
    ar: 'المكون اللطيف متعدد الفوائد',
    en: 'The gentle multi-benefit ingredient',
  },
  'mobile.skincareGuide.ingredient.azelaicAcid.tip1': {
    ar: 'يعالج حبوب الشباب والوردية',
    en: 'Treats acne and rosacea',
  },
  'mobile.skincareGuide.ingredient.azelaicAcid.tip2': {
    ar: 'يفتح التصبغات — آمن للحوامل',
    en: 'Brightens pigmentation — pregnancy-safe',
  },
  'mobile.skincareGuide.ingredient.azelaicAcid.tip3': {
    ar: 'لطيف — مناسب للبشرة الحساسة',
    en: 'Gentle — suitable for sensitive skin',
  },
  'mobile.skincareGuide.ingredient.azelaicAcid.tip4': {
    ar: 'مع النياسيناميد — ثنائي مهدئ',
    en: 'With niacinamide — a calming duo',
  },
  'mobile.skincareGuide.ingredient.ceramides.title': { ar: 'السيراميد', en: 'Ceramides' },
  'mobile.skincareGuide.ingredient.ceramides.subtitle': {
    ar: 'طوب بناء حاجز البشرة',
    en: 'The building blocks of the skin barrier',
  },
  'mobile.skincareGuide.ingredient.ceramides.tip1': {
    ar: 'يعيد بناء حاجز البشرة',
    en: 'Rebuilds the skin barrier',
  },
  'mobile.skincareGuide.ingredient.ceramides.tip2': {
    ar: 'يمنع فقدان الرطوبة',
    en: 'Prevents moisture loss',
  },
  'mobile.skincareGuide.ingredient.ceramides.tip3': {
    ar: 'ممتاز للبشرة الحساسة والجافة',
    en: 'Excellent for sensitive and dry skin',
  },
  'mobile.skincareGuide.ingredient.ceramides.tip4': {
    ar: 'مع النياسيناميد — ثنائي مرمم',
    en: 'With niacinamide — a repairing duo',
  },
  'mobile.skincareGuide.ingredient.peptides.title': { ar: 'الببتيدات', en: 'Peptides' },
  'mobile.skincareGuide.ingredient.peptides.subtitle': {
    ar: 'بروتينات صغيرة — نتائج كبيرة',
    en: 'Small proteins — big results',
  },
  'mobile.skincareGuide.ingredient.peptides.tip1': {
    ar: 'تحفز الكولاجين — بشرة أكثر شباباً',
    en: 'Stimulate collagen — younger-looking skin',
  },
  'mobile.skincareGuide.ingredient.peptides.tip2': {
    ar: 'يمكن استخدامها صباحاً ومساءً',
    en: 'Can be used morning and evening',
  },
  'mobile.skincareGuide.ingredient.peptides.tip3': {
    ar: 'آمنة مع معظم المكونات الأخرى',
    en: 'Safe with most other ingredients',
  },
  'mobile.skincareGuide.ingredient.peptides.tip4': {
    ar: 'النتائج تحتاج 4-8 أسابيع',
    en: 'Results take 4-8 weeks',
  },
  'mobile.skincareGuide.ingredient.exfoliatingAcids.title': {
    ar: 'أحماض البشرة',
    en: 'Exfoliating Acids',
  },
  'mobile.skincareGuide.ingredient.exfoliatingAcids.subtitle': {
    ar: 'دليل AHA و BHA و PHA',
    en: 'A guide to AHA, BHA and PHA',
  },
  'mobile.skincareGuide.ingredient.exfoliatingAcids.tip1': {
    ar: 'AHA — يذيب السطح للتجاعيد',
    en: 'AHA — dissolves the surface for wrinkles',
  },
  'mobile.skincareGuide.ingredient.exfoliatingAcids.tip2': {
    ar: 'BHA — ينظف المسام للحبوب',
    en: 'BHA — clears pores for acne',
  },
  'mobile.skincareGuide.ingredient.exfoliatingAcids.tip3': {
    ar: 'PHA — لطيف للبشرة الحساسة',
    en: 'PHA — gentle for sensitive skin',
  },
  'mobile.skincareGuide.ingredient.exfoliatingAcids.tip4': {
    ar: 'لا تخلطي أحماض مع ريتينول معاً',
    en: 'Don’t mix acids with retinol together',
  },
  'mobile.skincareGuide.ingredient.faceMist.title': { ar: 'رذاذ الوجه', en: 'Face Mist' },
  'mobile.skincareGuide.ingredient.faceMist.subtitle': {
    ar: 'انتعاش فوري للبشرة',
    en: 'Instant refreshment for skin',
  },
  'mobile.skincareGuide.ingredient.faceMist.tip1': {
    ar: 'ماء الورد — مهدئ ومنعش طبيعي',
    en: 'Rose water — a natural soother and refresher',
  },
  'mobile.skincareGuide.ingredient.faceMist.tip2': {
    ar: 'قبل المرطب — يمتص بشكل أفضل',
    en: 'Before moisturizer — absorbs better',
  },
  'mobile.skincareGuide.ingredient.faceMist.tip3': {
    ar: 'فوق المكياج — إشراقة منتصف اليوم',
    en: 'Over makeup — a midday glow',
  },
  'mobile.skincareGuide.ingredient.faceMist.tip4': {
    ar: 'في الطائرة — يحمي من الجفاف',
    en: 'On the plane — protects against dryness',
  },
  'mobile.skincareGuide.ingredient.faceOils.title': { ar: 'زيوت الوجه', en: 'Face Oils' },
  'mobile.skincareGuide.ingredient.faceOils.subtitle': {
    ar: 'متى وكيف تستخدمينها',
    en: 'When and how to use them',
  },
  'mobile.skincareGuide.ingredient.faceOils.tip1': {
    ar: 'آخر خطوة في المساء — تغلق الترطيب',
    en: 'Last step at night — seals in moisture',
  },
  'mobile.skincareGuide.ingredient.faceOils.tip2': {
    ar: '2-3 قطرات فقط — بين راحة اليد',
    en: 'Just 2-3 drops — between your palms',
  },
  'mobile.skincareGuide.ingredient.faceOils.tip3': {
    ar: 'ثمر الورد — للتصبغات والتجاعيد',
    en: 'Rosehip — for pigmentation and wrinkles',
  },
  'mobile.skincareGuide.ingredient.faceOils.tip4': {
    ar: 'جوجوبا — الأقرب لزيوت البشرة',
    en: 'Jojoba — closest to the skin’s own oils',
  },
  'mobile.skincareGuide.ingredient.glassSkin.title': { ar: 'البشرة الزجاجية', en: 'Glass Skin' },
  'mobile.skincareGuide.ingredient.glassSkin.subtitle': {
    ar: 'سر البشرة الكورية الصافية',
    en: 'The secret of clear Korean skin',
  },
  'mobile.skincareGuide.ingredient.glassSkin.tip1': {
    ar: '7 طبقات ترطيب — تونر خفيف يطبق 7 مرات',
    en: '7 layers of hydration — a light toner applied 7 times',
  },
  'mobile.skincareGuide.ingredient.glassSkin.tip2': {
    ar: 'طبقات رقيقة — كل طبقة تمتص قبل التالية',
    en: 'Thin layers — let each absorb before the next',
  },
  'mobile.skincareGuide.ingredient.glassSkin.tip3': {
    ar: 'تقشير منتظم — أساس البشرة الزجاجية',
    en: 'Regular exfoliation — the foundation of glass skin',
  },
  'mobile.skincareGuide.ingredient.glassSkin.tip4': {
    ar: 'واقي شمس يومي — حماية من التصبغات',
    en: 'Daily sunscreen — protection from pigmentation',
  },
  'mobile.skincareGuide.ingredient.sheetMask.title': { ar: 'قناع الورقة', en: 'Sheet Mask' },
  'mobile.skincareGuide.ingredient.sheetMask.subtitle': {
    ar: 'علاج مكثف في 15 دقيقة',
    en: 'An intensive treatment in 15 minutes',
  },
  'mobile.skincareGuide.ingredient.sheetMask.tip1': {
    ar: 'بعد التنظيف — البشرة النظيفة تمتص أفضل',
    en: 'After cleansing — clean skin absorbs better',
  },
  'mobile.skincareGuide.ingredient.sheetMask.tip2': {
    ar: '15-20 دقيقة — لا تتركيه حتى يجف',
    en: '15-20 minutes — don’t leave it until it dries',
  },
  'mobile.skincareGuide.ingredient.sheetMask.tip3': {
    ar: 'دلكي الفائض — لا تغسلي وجهك بعده',
    en: 'Massage in the excess — don’t wash your face after',
  },
  'mobile.skincareGuide.ingredient.sheetMask.tip4': {
    ar: '2-3 مرات أسبوعياً — لا يومياً',
    en: '2-3 times a week — not daily',
  },
  'mobile.skincareGuide.ingredient.essence.title': { ar: 'الإسينس', en: 'Essence' },
  'mobile.skincareGuide.ingredient.essence.subtitle': {
    ar: 'الخطوة السحرية في الروتين الكوري',
    en: 'The magic step in the Korean routine',
  },
  'mobile.skincareGuide.ingredient.essence.tip1': {
    ar: 'بعد التونر — وقبل السيروم',
    en: 'After toner — and before serum',
  },
  'mobile.skincareGuide.ingredient.essence.tip2': {
    ar: 'قوام مائي خفيف — يخترق الطبقات العميقة',
    en: 'Light watery texture — penetrates deep layers',
  },
  'mobile.skincareGuide.ingredient.essence.tip3': {
    ar: 'يهيئ البشرة — يمتص السيروم بشكل أفضل',
    en: 'Preps the skin — serum absorbs better',
  },
  'mobile.skincareGuide.ingredient.essence.tip4': {
    ar: 'يطبق باليدين — ربتي ولا تفركي',
    en: 'Apply with your hands — pat, don’t rub',
  },
  'mobile.skincareGuide.ingredient.snailMucin.title': { ar: 'مادة الحلزون', en: 'Snail Mucin' },
  'mobile.skincareGuide.ingredient.snailMucin.subtitle': {
    ar: 'سر الترطيب الكوري',
    en: 'The secret of Korean hydration',
  },
  'mobile.skincareGuide.ingredient.snailMucin.tip1': {
    ar: 'غني بالجليكوليك أسيد — مقشر لطيف طبيعي',
    en: 'Rich in glycolic acid — a gentle natural exfoliant',
  },
  'mobile.skincareGuide.ingredient.snailMucin.tip2': {
    ar: 'ألانتوين — يهدئ ويرطب بعمق',
    en: 'Allantoin — soothes and deeply hydrates',
  },
  'mobile.skincareGuide.ingredient.snailMucin.tip3': {
    ar: 'يعالج الندبات والتصبغات',
    en: 'Treats scars and pigmentation',
  },
  'mobile.skincareGuide.ingredient.snailMucin.tip4': {
    ar: 'آمن مع معظم المكونات — صباح ومساء',
    en: 'Safe with most ingredients — morning and evening',
  },
  'mobile.skincareGuide.ingredient.centella.title': { ar: 'سينتيلا (Cica)', en: 'Centella (Cica)' },
  'mobile.skincareGuide.ingredient.centella.subtitle': {
    ar: 'عشبة النمر — مهدئ خارق',
    en: 'Tiger grass — a super soother',
  },
  'mobile.skincareGuide.ingredient.centella.tip1': {
    ar: 'يهدئ الالتهابات — ممتاز للبشرة الحساسة',
    en: 'Calms inflammation — excellent for sensitive skin',
  },
  'mobile.skincareGuide.ingredient.centella.tip2': {
    ar: 'يسرع التئام الجروح — يحفز الكولاجين',
    en: 'Speeds wound healing — stimulates collagen',
  },
  'mobile.skincareGuide.ingredient.centella.tip3': {
    ar: 'يقلل الاحمرار — بشرة هادئة ومتجانسة',
    en: 'Reduces redness — calm, even skin',
  },
  'mobile.skincareGuide.ingredient.centella.tip4': {
    ar: 'يقوي حاجز البشرة — يمنع فقدان الرطوبة',
    en: 'Strengthens the skin barrier — prevents moisture loss',
  },
  'mobile.skincareGuide.ingredient.chemicalPeel.title': {
    ar: 'التقشير الكيميائي',
    en: 'Chemical Peel',
  },
  'mobile.skincareGuide.ingredient.chemicalPeel.subtitle': {
    ar: 'تجديد البشرة بطريقة احترافية',
    en: 'Professional skin renewal',
  },
  'mobile.skincareGuide.ingredient.chemicalPeel.tip1': {
    ar: 'سطحي — أحماض خفيفة لا وقت تعافي',
    en: 'Superficial — mild acids, no downtime',
  },
  'mobile.skincareGuide.ingredient.chemicalPeel.tip2': {
    ar: 'متوسط — يخترق أعمق 3-5 أيام تقشير',
    en: 'Medium — penetrates deeper, 3-5 days of peeling',
  },
  'mobile.skincareGuide.ingredient.chemicalPeel.tip3': {
    ar: 'عميق — طبيب فقط نتائج قوية',
    en: 'Deep — doctor only, powerful results',
  },
  'mobile.skincareGuide.ingredient.chemicalPeel.tip4': {
    ar: 'بعد الجلسة — واقي شمس ضروري جداً',
    en: 'After the session — sunscreen is essential',
  },
  'mobile.skincareGuide.ingredient.microneedling.title': {
    ar: 'المايكرونيدلنغ',
    en: 'Microneedling',
  },
  'mobile.skincareGuide.ingredient.microneedling.subtitle': {
    ar: 'إبر دقيقة — نتائج مذهلة',
    en: 'Fine needles — amazing results',
  },
  'mobile.skincareGuide.ingredient.microneedling.tip1': {
    ar: 'يحفز الكولاجين — إبر دقيقة تخترق الجلد',
    en: 'Stimulates collagen — fine needles pierce the skin',
  },
  'mobile.skincareGuide.ingredient.microneedling.tip2': {
    ar: 'يعالج الندبات والمسام الواسعة',
    en: 'Treats scars and enlarged pores',
  },
  'mobile.skincareGuide.ingredient.microneedling.tip3': {
    ar: 'جلسة كل 4-6 أسابيع — 3-6 جلسات',
    en: 'A session every 4-6 weeks — 3-6 sessions',
  },
  'mobile.skincareGuide.ingredient.microneedling.tip4': {
    ar: 'بعد الجلسة — سيروم هيالورونيك أسيد',
    en: 'After the session — hyaluronic acid serum',
  },
  'mobile.skincareGuide.ingredient.hydrafacial.title': { ar: 'الهيدروفيشل', en: 'HydraFacial' },
  'mobile.skincareGuide.ingredient.hydrafacial.subtitle': {
    ar: 'تنظيف عميق بضغط الماء',
    en: 'Deep cleansing with water pressure',
  },
  'mobile.skincareGuide.ingredient.hydrafacial.tip1': {
    ar: 'ينظف المسام بعمق — بدون ألم أو احمرار',
    en: 'Deep-cleans pores — no pain or redness',
  },
  'mobile.skincareGuide.ingredient.hydrafacial.tip2': {
    ar: 'يرطب ويغذي — في نفس الجلسة',
    en: 'Hydrates and nourishes — in the same session',
  },
  'mobile.skincareGuide.ingredient.hydrafacial.tip3': {
    ar: '30-45 دقيقة — نتائج فورية',
    en: '30-45 minutes — instant results',
  },
  'mobile.skincareGuide.ingredient.hydrafacial.tip4': {
    ar: 'مرة شهرياً — للحفاظ على النتائج',
    en: 'Once a month — to maintain results',
  },
  'mobile.skincareGuide.ingredient.bakuchiol.title': { ar: 'الباكوتشيول', en: 'Bakuchiol' },
  'mobile.skincareGuide.ingredient.bakuchiol.subtitle': {
    ar: 'بديل الريتينول الطبيعي',
    en: 'The natural retinol alternative',
  },
  'mobile.skincareGuide.ingredient.bakuchiol.tip1': {
    ar: 'نباتي 100% — مستخلص من نبات البسوراليا',
    en: '100% plant-based — extracted from the psoralea plant',
  },
  'mobile.skincareGuide.ingredient.bakuchiol.tip2': {
    ar: 'آمن نهاراً — لا يتحسس من الشمس',
    en: 'Day-safe — doesn’t cause sun sensitivity',
  },
  'mobile.skincareGuide.ingredient.bakuchiol.tip3': {
    ar: 'آمن للحوامل — بديل ممتاز للريتينول',
    en: 'Pregnancy-safe — an excellent retinol alternative',
  },
  'mobile.skincareGuide.ingredient.bakuchiol.tip4': {
    ar: 'يحفز الكولاجين — بدون تهيج أو تقشير',
    en: 'Stimulates collagen — without irritation or peeling',
  },
  'mobile.skincareGuide.ingredient.mixingIngredients.title': {
    ar: 'خلط المكونات',
    en: 'Mixing Ingredients',
  },
  'mobile.skincareGuide.ingredient.mixingIngredients.subtitle': {
    ar: 'ما يصلح معاً — وما لا يصلح',
    en: 'What works together — and what doesn’t',
  },
  'mobile.skincareGuide.ingredient.mixingIngredients.tip1': {
    ar: 'فيتامين C + واقي شمس — ثنائي مثالي',
    en: 'Vitamin C + sunscreen — a perfect duo',
  },
  'mobile.skincareGuide.ingredient.mixingIngredients.tip2': {
    ar: 'ريتينول + ببتيدات — مضاد شيخوخة قوي',
    en: 'Retinol + peptides — a powerful anti-aging combo',
  },
  'mobile.skincareGuide.ingredient.mixingIngredients.tip3': {
    ar: 'ريتينول + أحماض — تهيج شديد',
    en: 'Retinol + acids — severe irritation',
  },
  'mobile.skincareGuide.ingredient.mixingIngredients.tip4': {
    ar: 'فيتامين C + أحماض — يبطل مفعولهم',
    en: 'Vitamin C + acids — they cancel each other out',
  },
  'mobile.skincareGuide.ingredient.oxygenFacial.title': {
    ar: 'فيشل الأكسجين',
    en: 'Oxygen Facial',
  },
  'mobile.skincareGuide.ingredient.oxygenFacial.subtitle': {
    ar: 'أكسجين مضغوط — بشرة مشرقة',
    en: 'Pressurized oxygen — radiant skin',
  },
  'mobile.skincareGuide.ingredient.oxygenFacial.tip1': {
    ar: 'يرش الأكسجين — مع سيروم مغذي',
    en: 'Sprays oxygen — with a nourishing serum',
  },
  'mobile.skincareGuide.ingredient.oxygenFacial.tip2': {
    ar: 'ترطيب فوري — بشرة ممتلئة',
    en: 'Instant hydration — plump skin',
  },
  'mobile.skincareGuide.ingredient.oxygenFacial.tip3': {
    ar: '30-45 دقيقة — بدون ألم',
    en: '30-45 minutes — painless',
  },
  'mobile.skincareGuide.ingredient.oxygenFacial.tip4': {
    ar: 'قبل المناسبات — نتيجة فورية',
    en: 'Before occasions — an instant result',
  },
  'mobile.skincareGuide.ingredient.diamondFacial.title': {
    ar: 'فيشل الألماس',
    en: 'Diamond Facial',
  },
  'mobile.skincareGuide.ingredient.diamondFacial.subtitle': {
    ar: 'سنفرة الألماس — بشرة جديدة',
    en: 'Diamond exfoliation — new skin',
  },
  'mobile.skincareGuide.ingredient.diamondFacial.tip1': {
    ar: 'رأس ماسي — يقشر السطح بلطف',
    en: 'Diamond-tipped head — gently exfoliates the surface',
  },
  'mobile.skincareGuide.ingredient.diamondFacial.tip2': {
    ar: 'يحفز الكولاجين — بشرة أنعم',
    en: 'Stimulates collagen — smoother skin',
  },
  'mobile.skincareGuide.ingredient.diamondFacial.tip3': {
    ar: 'يزيل الخلايا الميتة',
    en: 'Removes dead skin cells',
  },
  'mobile.skincareGuide.ingredient.diamondFacial.tip4': {
    ar: 'كل 4-6 أسابيع — نتائج مثالية',
    en: 'Every 4-6 weeks — optimal results',
  },
  'mobile.skincareGuide.ingredient.goldFacial.title': { ar: 'فيشل الذهب', en: 'Gold Facial' },
  'mobile.skincareGuide.ingredient.goldFacial.subtitle': {
    ar: 'ذهب 24 قيراط — ترفيه ملكي',
    en: '24-karat gold — a royal indulgence',
  },
  'mobile.skincareGuide.ingredient.goldFacial.tip1': {
    ar: 'رقائق ذهب حقيقية — على الوجه',
    en: 'Real gold flakes — on the face',
  },
  'mobile.skincareGuide.ingredient.goldFacial.tip2': {
    ar: 'يحسن مرونة البشرة — يبطئ الشيخوخة',
    en: 'Improves skin elasticity — slows aging',
  },
  'mobile.skincareGuide.ingredient.goldFacial.tip3': {
    ar: 'يعكس الضوء — بشرة متوهجة فوراً',
    en: 'Reflects light — instantly glowing skin',
  },
  'mobile.skincareGuide.ingredient.goldFacial.tip4': {
    ar: 'فاخر — للمناسبات الخاصة',
    en: 'Luxurious — for special occasions',
  },
  'mobile.skincareGuide.ingredient.plasmaFacial.title': {
    ar: 'فيشل البلازما',
    en: 'Plasma Facial',
  },
  'mobile.skincareGuide.ingredient.plasmaFacial.subtitle': {
    ar: 'PRP — بلازما دمكِ لجمالكِ',
    en: 'PRP — your blood plasma for your beauty',
  },
  'mobile.skincareGuide.ingredient.plasmaFacial.tip1': {
    ar: 'تسحب عينة دم — تستخلص البلازما',
    en: 'A blood sample is drawn — plasma is extracted',
  },
  'mobile.skincareGuide.ingredient.plasmaFacial.tip2': {
    ar: 'حقن البلازما — تحفز الكولاجين بقوة',
    en: 'Plasma is injected — powerfully stimulates collagen',
  },
  'mobile.skincareGuide.ingredient.plasmaFacial.tip3': {
    ar: 'نتائج طبيعية 100% — من جسمكِ',
    en: '100% natural results — from your own body',
  },
  'mobile.skincareGuide.ingredient.plasmaFacial.tip4': {
    ar: '3-4 جلسات — بينها شهر',
    en: '3-4 sessions — a month apart',
  },
  'mobile.skincareGuide.ingredient.caviarFacial.title': {
    ar: 'فيشل الكافيار',
    en: 'Caviar Facial',
  },
  'mobile.skincareGuide.ingredient.caviarFacial.subtitle': {
    ar: 'كافيار فاخر — تغذية عميقة',
    en: 'Luxurious caviar — deep nourishment',
  },
  'mobile.skincareGuide.ingredient.caviarFacial.tip1': {
    ar: 'غني بالأحماض الأمينية — يغذي بعمق',
    en: 'Rich in amino acids — nourishes deeply',
  },
  'mobile.skincareGuide.ingredient.caviarFacial.tip2': {
    ar: 'أوميغا 3 — يرطب ويجدد',
    en: 'Omega 3 — hydrates and renews',
  },
  'mobile.skincareGuide.ingredient.caviarFacial.tip3': {
    ar: 'يحسن المرونة — يقلل الخطوط',
    en: 'Improves elasticity — reduces lines',
  },
  'mobile.skincareGuide.ingredient.caviarFacial.tip4': {
    ar: 'فاخر — من أفخم علاجات التجميل',
    en: 'Luxurious — one of the finest beauty treatments',
  },
  'mobile.skincareGuide.ingredient.darkCircles.title': {
    ar: 'الهالات السوداء',
    en: 'Dark Circles',
  },
  'mobile.skincareGuide.ingredient.darkCircles.subtitle': {
    ar: 'أسبابها وعلاجها من جذورها',
    en: 'Causes and root treatment',
  },
  'mobile.skincareGuide.ingredient.darkCircles.tip1': {
    ar: 'قلة النوم — السبب الأول',
    en: 'Lack of sleep — the number one cause',
  },
  'mobile.skincareGuide.ingredient.darkCircles.tip2': {
    ar: 'نقص الحديد — سبب شائع',
    en: 'Iron deficiency — a common cause',
  },
  'mobile.skincareGuide.ingredient.darkCircles.tip3': {
    ar: 'وراثة — ميل طبيعي',
    en: 'Genetics — a natural tendency',
  },
  'mobile.skincareGuide.ingredient.darkCircles.tip4': {
    ar: 'جفاف — البشرة رقيقة تحت العين',
    en: 'Dehydration — the skin under the eye is thin',
  },
  'mobile.skincareGuide.ingredient.underEyeBags.title': {
    ar: 'انتفاخ تحت العين',
    en: 'Under-Eye Puffiness',
  },
  'mobile.skincareGuide.ingredient.underEyeBags.subtitle': {
    ar: 'أكياس العين — حلول سريعة',
    en: 'Eye bags — quick solutions',
  },
  'mobile.skincareGuide.ingredient.underEyeBags.tip1': {
    ar: 'كمادات باردة — 10 دقائق صباحاً',
    en: 'Cold compresses — 10 minutes in the morning',
  },
  'mobile.skincareGuide.ingredient.underEyeBags.tip2': {
    ar: 'كافيين موضعي — يضيق الأوعية',
    en: 'Topical caffeine — constricts blood vessels',
  },
  'mobile.skincareGuide.ingredient.underEyeBags.tip3': {
    ar: 'وسادة مرتفعة — تقلل السوائل',
    en: 'An elevated pillow — reduces fluid buildup',
  },
  'mobile.skincareGuide.ingredient.underEyeBags.tip4': {
    ar: 'قللي الملح — يسبب الاحتباس',
    en: 'Cut down on salt — it causes fluid retention',
  },
  'mobile.skincareGuide.ingredient.crowFeet.title': {
    ar: 'خطوط حول العين',
    en: 'Lines Around the Eyes',
  },
  'mobile.skincareGuide.ingredient.crowFeet.subtitle': {
    ar: 'أقدام الغراب — وقاية وعلاج',
    en: 'Crow’s feet — prevention and treatment',
  },
  'mobile.skincareGuide.ingredient.crowFeet.tip1': {
    ar: 'نظارة شمس — تمنع التحديق',
    en: 'Sunglasses — prevent squinting',
  },
  'mobile.skincareGuide.ingredient.crowFeet.tip2': {
    ar: 'تربيت خفيف — لا تفركي',
    en: 'Light patting — don’t rub',
  },
  'mobile.skincareGuide.ingredient.crowFeet.tip3': {
    ar: 'كريم عيون ببتيدات — صباح ومساء',
    en: 'Peptide eye cream — morning and evening',
  },
  'mobile.skincareGuide.ingredient.crowFeet.tip4': {
    ar: 'بوتوكس — للخطوط العميقة',
    en: 'Botox — for deep lines',
  },
  'mobile.skincareGuide.ingredient.eyeMassage.title': { ar: 'مساج العين', en: 'Eye Massage' },
  'mobile.skincareGuide.ingredient.eyeMassage.subtitle': {
    ar: '3 دقائق — لعيون مشرقة',
    en: '3 minutes — for bright eyes',
  },
  'mobile.skincareGuide.ingredient.eyeMassage.tip1': {
    ar: 'البنصر — الأخف للتربيت',
    en: 'Ring finger — the lightest for patting',
  },
  'mobile.skincareGuide.ingredient.eyeMassage.tip2': {
    ar: 'من الداخل للخارج — بحركة دائرية',
    en: 'From the inside out — in circular motions',
  },
  'mobile.skincareGuide.ingredient.eyeMassage.tip3': {
    ar: 'مع كريم أو زيت — لتزلق الأصابع',
    en: 'With cream or oil — so fingers glide',
  },
  'mobile.skincareGuide.ingredient.eyeMassage.tip4': {
    ar: '3 دقائق — صباحاً للانتفاخ',
    en: '3 minutes — in the morning for puffiness',
  },
  'mobile.skincareGuide.ingredient.eyeSerum.title': { ar: 'سيروم العين', en: 'Eye Serum' },
  'mobile.skincareGuide.ingredient.eyeSerum.subtitle': {
    ar: 'دليل اختيار السيروم المناسب',
    en: 'A guide to choosing the right serum',
  },
  'mobile.skincareGuide.ingredient.eyeSerum.tip1': {
    ar: 'كافيين — للهالات والانتفاخ',
    en: 'Caffeine — for dark circles and puffiness',
  },
  'mobile.skincareGuide.ingredient.eyeSerum.tip2': {
    ar: 'ببتيدات — للتجاعيد والخطوط',
    en: 'Peptides — for wrinkles and lines',
  },
  'mobile.skincareGuide.ingredient.eyeSerum.tip3': {
    ar: 'هيالورونيك — للترطيب العميق',
    en: 'Hyaluronic — for deep hydration',
  },
  'mobile.skincareGuide.ingredient.eyeSerum.tip4': {
    ar: 'فيتامين C — لتفتيح الهالات',
    en: 'Vitamin C — to brighten dark circles',
  },
  'mobile.skincareGuide.ingredient.acneScars.title': { ar: 'ندبات الحبوب', en: 'Acne Scars' },
  'mobile.skincareGuide.ingredient.acneScars.subtitle': {
    ar: 'أنواع الندبات وعلاج كل نوع',
    en: 'Scar types and how to treat each',
  },
  'mobile.skincareGuide.ingredient.acneScars.tip1': {
    ar: 'حفر: عميقة — تحتاج ليزر أو فيلر',
    en: 'Pitted: deep — need laser or filler',
  },
  'mobile.skincareGuide.ingredient.acneScars.tip2': {
    ar: 'حمراء: حديثة — تختفي مع الوقت',
    en: 'Red: recent — fade with time',
  },
  'mobile.skincareGuide.ingredient.acneScars.tip3': {
    ar: 'بنية: تصبغات — تقشير وفيتامين C',
    en: 'Brown: pigmentation — exfoliation and vitamin C',
  },
  'mobile.skincareGuide.ingredient.acneScars.tip4': {
    ar: 'بارزة: متضخمة — كورتيزون موضعي',
    en: 'Raised: hypertrophic — topical cortisone',
  },
  'mobile.skincareGuide.ingredient.postAcneMarks.title': {
    ar: 'علامات ما بعد الحبوب',
    en: 'Post-Acne Marks',
  },
  'mobile.skincareGuide.ingredient.postAcneMarks.subtitle': {
    ar: 'PIH و PIE — الفرق والعلاج',
    en: 'PIH vs PIE — the difference and treatment',
  },
  'mobile.skincareGuide.ingredient.postAcneMarks.tip1': {
    ar: 'PIH: بني — فيتامين C وأربيوتين',
    en: 'PIH: brown — vitamin C and arbutin',
  },
  'mobile.skincareGuide.ingredient.postAcneMarks.tip2': {
    ar: 'PIE: احمرار — نيوكسين أزيليك',
    en: 'PIE: redness — niacinamide and azelaic acid',
  },
  'mobile.skincareGuide.ingredient.postAcneMarks.tip3': {
    ar: 'ريتينول — يسرع تجدد الخلايا',
    en: 'Retinol — speeds up cell turnover',
  },
  'mobile.skincareGuide.ingredient.postAcneMarks.tip4': {
    ar: 'SPF يومي — يمنع تفاقم التصبغات',
    en: 'Daily SPF — prevents pigmentation from worsening',
  },
  'mobile.skincareGuide.ingredient.minimizePores.title': {
    ar: 'تصغير المسام',
    en: 'Minimizing Pores',
  },
  'mobile.skincareGuide.ingredient.minimizePores.subtitle': {
    ar: 'لا تغلق — لكن تصغر',
    en: 'They never close — but they do shrink',
  },
  'mobile.skincareGuide.ingredient.minimizePores.tip1': {
    ar: 'BHA — ينظف المسام من الداخل',
    en: 'BHA — cleans pores from within',
  },
  'mobile.skincareGuide.ingredient.minimizePores.tip2': {
    ar: 'نياسيناميد — ينظم الدهون',
    en: 'Niacinamide — regulates oil',
  },
  'mobile.skincareGuide.ingredient.minimizePores.tip3': {
    ar: 'ماء بارد — يقلص مؤقتاً',
    en: 'Cold water — temporarily tightens',
  },
  'mobile.skincareGuide.ingredient.minimizePores.tip4': {
    ar: 'برايمر — يملأ المسام بصرياً',
    en: 'Primer — visually fills pores',
  },
  'mobile.skincareGuide.ingredient.fadeAcneMarks.title': {
    ar: 'تفتيح آثار الحبوب',
    en: 'Fading Acne Marks',
  },
  'mobile.skincareGuide.ingredient.fadeAcneMarks.subtitle': {
    ar: 'روتين لتوحيد لون البشرة',
    en: 'A routine to even skin tone',
  },
  'mobile.skincareGuide.ingredient.fadeAcneMarks.tip1': {
    ar: 'فيتامين C — صباحاً لتفتيح التصبغات',
    en: 'Vitamin C — in the morning to brighten pigmentation',
  },
  'mobile.skincareGuide.ingredient.fadeAcneMarks.tip2': {
    ar: 'أزيليك أسيد — آمن للحوامل',
    en: 'Azelaic acid — pregnancy-safe',
  },
  'mobile.skincareGuide.ingredient.fadeAcneMarks.tip3': {
    ar: 'أحماض ألفا — تقشير كيميائي',
    en: 'Alpha acids — chemical exfoliation',
  },
  'mobile.skincareGuide.ingredient.fadeAcneMarks.tip4': {
    ar: 'الصبر — النتائج 8-12 أسبوعاً',
    en: 'Patience — results in 8-12 weeks',
  },
  'mobile.skincareGuide.ingredient.scarTreatments.title': {
    ar: 'علاجات الندبات',
    en: 'Scar Treatments',
  },
  'mobile.skincareGuide.ingredient.scarTreatments.subtitle': {
    ar: 'من الكريمات للإجراءات',
    en: 'From creams to procedures',
  },
  'mobile.skincareGuide.ingredient.scarTreatments.tip1': {
    ar: 'سيليكون جل — أفضل علاج موضعي',
    en: 'Silicone gel — the best topical treatment',
  },
  'mobile.skincareGuide.ingredient.scarTreatments.tip2': {
    ar: 'مايكرونيدلنغ — كولاجين جديد',
    en: 'Microneedling — new collagen',
  },
  'mobile.skincareGuide.ingredient.scarTreatments.tip3': {
    ar: 'ليزر فراكشنال — يعيد سطح البشرة',
    en: 'Fractional laser — resurfaces the skin',
  },
  'mobile.skincareGuide.ingredient.scarTreatments.tip4': {
    ar: 'العلاج المبكر — أفضل من القديمة',
    en: 'Early treatment — better than for old scars',
  },
  'mobile.skincareGuide.ingredient.maskne.title': { ar: 'حبوب الكمامة', en: 'Maskne' },
  'mobile.skincareGuide.ingredient.maskne.subtitle': {
    ar: 'Mask-Ne — كيف تتعاملين معها',
    en: 'Mask-Ne — how to deal with it',
  },
  'mobile.skincareGuide.ingredient.maskne.tip1': {
    ar: 'غيري الكمامة يومياً',
    en: 'Change your mask daily',
  },
  'mobile.skincareGuide.ingredient.maskne.tip2': {
    ar: 'مرطب خفيف — حاجز حماية',
    en: 'Light moisturizer — a protective barrier',
  },
  'mobile.skincareGuide.ingredient.maskne.tip3': {
    ar: 'تجنبي المكياج تحت الكمامة',
    en: 'Avoid makeup under the mask',
  },
  'mobile.skincareGuide.ingredient.maskne.tip4': {
    ar: 'نظفي وجهك بعد نزعها',
    en: 'Cleanse your face after removing it',
  },
  'mobile.skincareGuide.ingredient.koreanRoutine.title': {
    ar: 'الروتين الكوري',
    en: 'The Korean Routine',
  },
  'mobile.skincareGuide.ingredient.koreanRoutine.subtitle': {
    ar: 'الترتيب الصحيح للعناية',
    en: 'The correct order of care',
  },
  'mobile.skincareGuide.ingredient.koreanRoutine.tip1': {
    ar: 'زيت + غسول — تنظيف مزدوج',
    en: 'Oil + cleanser — double cleansing',
  },
  'mobile.skincareGuide.ingredient.koreanRoutine.tip2': {
    ar: 'مقشر — مرة أسبوعياً',
    en: 'Exfoliant — once a week',
  },
  'mobile.skincareGuide.ingredient.koreanRoutine.tip3': {
    ar: 'تونر — يرطب ويهيئ',
    en: 'Toner — hydrates and preps',
  },
  'mobile.skincareGuide.ingredient.koreanRoutine.tip4': {
    ar: 'إسينس — قلب الروتين الكوري',
    en: 'Essence — the heart of the Korean routine',
  },
  'mobile.skincareGuide.ingredient.japaneseRoutine.title': {
    ar: 'الروتين الياباني',
    en: 'The Japanese Routine',
  },
  'mobile.skincareGuide.ingredient.japaneseRoutine.subtitle': {
    ar: 'جمال هادئ — بشرة كالخزف',
    en: 'Quiet beauty — porcelain-like skin',
  },
  'mobile.skincareGuide.ingredient.japaneseRoutine.tip1': {
    ar: 'طبقات خفيفة — لوشن سيروم كريم',
    en: 'Light layers — lotion, serum, cream',
  },
  'mobile.skincareGuide.ingredient.japaneseRoutine.tip2': {
    ar: 'واقي شمس — أساس الجمال الياباني',
    en: 'Sunscreen — the foundation of Japanese beauty',
  },
  'mobile.skincareGuide.ingredient.japaneseRoutine.tip3': {
    ar: 'مساج الوجه — يومياً',
    en: 'Face massage — daily',
  },
  'mobile.skincareGuide.ingredient.japaneseRoutine.tip4': {
    ar: 'الشاي الأخضر — من الداخل والخارج',
    en: 'Green tea — inside and out',
  },
  // Checkout — MyFatoorah shipping (payments.payCart flow)
  'mobile.checkout.shipping-title': { ar: 'عنوان الشحن', en: 'Shipping Address' },
  'mobile.checkout.shipping-person-name': { ar: 'اسم المستلم', en: 'Recipient name' },
  'mobile.checkout.shipping-mobile': { ar: 'رقم الجوال', en: 'Mobile number' },
  'mobile.checkout.shipping-line-address': { ar: 'العنوان', en: 'Address' },
  'mobile.checkout.shipping-city': { ar: 'المدينة', en: 'City' },
  'mobile.checkout.shipping-city-placeholder': {
    ar: 'ابحثي عن مدينتكِ',
    en: 'Search for your city',
  },
  'mobile.checkout.shipping-postal-code': { ar: 'الرمز البريدي', en: 'Postal code' },
  'mobile.checkout.shipping-country': { ar: 'الدولة', en: 'Country' },
  'mobile.checkout.shipping-method': { ar: 'شركة الشحن', en: 'Shipping courier' },
  'mobile.checkout.shipping-method-dhl': { ar: 'دي إتش إل', en: 'DHL' },
  'mobile.checkout.shipping-method-aramex': { ar: 'أرامكس', en: 'Aramex' },
  'mobile.checkout.shipping-charge': { ar: 'رسوم الشحن', en: 'Shipping' },
  'mobile.checkout.shipping-required': {
    ar: 'أكملي بيانات الشحن للمتابعة',
    en: 'Complete the shipping details to continue',
  },
  'mobile.checkout.redirecting-gateway': {
    ar: 'جارٍ تحويلك إلى بوابة الدفع…',
    en: 'Redirecting you to the payment gateway…',
  },
  'mobile.checkout.payment-pending': {
    ar: 'الدفع قيد المعالجة',
    en: 'Payment is still processing',
  },
  'mobile.checkout.payment-failed': { ar: 'فشلت عملية الدفع', en: 'Payment failed' },
  'mobile.checkout.payment-success': { ar: 'تم الدفع بنجاح', en: 'Payment successful' },
  'mobile.checkout.check-payment-status': {
    ar: 'التحقق من حالة الدفع',
    en: 'Check payment status',
  },

  // ---- personal-care: card content (i18n sweep) ----
  'mobile.personalCare.card.brows.title': { ar: 'عناية بالحواجب', en: 'Eyebrow Care' },
  'mobile.personalCare.card.brows.subtitle': {
    ar: 'حواجب متناسقة — إطار الوجه',
    en: 'Well-groomed brows — the frame of the face',
  },
  'mobile.personalCare.card.brows.tip1': {
    ar: 'تحديد الشكل — لا تتبعي الصيحة اتبعي وجهك',
    en: "Shape selection — don't follow trends, follow your face",
  },
  'mobile.personalCare.card.brows.tip2': {
    ar: 'لا تنتفي كثيراً — الشعر قد لا ينمو مجدداً',
    en: "Don't over-pluck — hair may not grow back",
  },
  'mobile.personalCare.card.brows.tip3': {
    ar: 'تعبئة الفراغات — قلم حواجب بلون مطابق',
    en: 'Fill gaps — a brow pencil in a matching shade',
  },
  'mobile.personalCare.card.brows.tip4': {
    ar: 'زيت الخروع — يساعد على تكثيف الحواجب',
    en: 'Castor oil — helps thicken eyebrows',
  },
  'mobile.personalCare.card.lashes.title': { ar: 'عناية بالرموش', en: 'Lash Care' },
  'mobile.personalCare.card.lashes.subtitle': {
    ar: 'رموش كثيفة وصحية',
    en: 'Thick, healthy lashes',
  },
  'mobile.personalCare.card.lashes.tip1': {
    ar: 'تنظيف لطيف — مزيل مكياج خالٍ من الزيوت',
    en: 'Gentle cleansing — an oil-free makeup remover',
  },
  'mobile.personalCare.card.lashes.tip2': {
    ar: 'زيت الخروع — يطبق ليلاً لتقوية الرموش',
    en: 'Castor oil — apply at night to strengthen lashes',
  },
  'mobile.personalCare.card.lashes.tip3': {
    ar: 'لا تفركي — الفرك يسبب تساقط الرموش',
    en: "Don't rub — rubbing causes lash loss",
  },
  'mobile.personalCare.card.lashes.tip4': {
    ar: 'استراحة — خذي استراحة من الرموش الصناعية',
    en: 'Take a break — give your false lashes a rest',
  },
  'mobile.personalCare.card.body.title': { ar: 'عناية بالجسم', en: 'Body Care' },
  'mobile.personalCare.card.body.subtitle': {
    ar: 'بشرة ناعمة من الرأس للقدمين',
    en: 'Smooth skin from head to toe',
  },
  'mobile.personalCare.card.body.tip1': {
    ar: 'تقشير أسبوعي — يزيل الخلايا الميتة ويجدد البشرة',
    en: 'Weekly exfoliation — removes dead cells and renews the skin',
  },
  'mobile.personalCare.card.body.tip2': {
    ar: 'ترطيب بعد الاستحمام — البشرة تمتص المرطب أفضل',
    en: 'Moisturize after showering — skin absorbs moisturizer better',
  },
  'mobile.personalCare.card.body.tip3': {
    ar: 'واقي للجسم — لا تنسي رقبتك ويديك وقدميك',
    en: "Body sunscreen — don't forget your neck, hands and feet",
  },
  'mobile.personalCare.card.body.tip4': {
    ar: 'شرب الماء — بشرة الجسم تحتاج ترطيب من الداخل',
    en: 'Drink water — body skin needs hydration from within',
  },
  'mobile.personalCare.card.smile.title': { ar: 'ابتسامة مشرقة', en: 'Bright Smile' },
  'mobile.personalCare.card.smile.subtitle': {
    ar: 'عناية بالأسنان لجمال ابتسامتك',
    en: 'Dental care for a beautiful smile',
  },
  'mobile.personalCare.card.smile.tip1': {
    ar: 'تنظيف مرتين — صباحاً ومساءً دقيقتان',
    en: 'Brush twice — morning and evening, two minutes',
  },
  'mobile.personalCare.card.smile.tip2': {
    ar: 'خيط الأسنان — يومياً يمنع التسوس',
    en: 'Dental floss — daily, prevents cavities',
  },
  'mobile.personalCare.card.smile.tip3': {
    ar: 'تبييض طبيعي — فراولة + بيكربونات',
    en: 'Natural whitening — strawberry + baking soda',
  },
  'mobile.personalCare.card.smile.tip4': {
    ar: 'فحص دوري — كل 6 أشهر عند الطبيب',
    en: 'Regular checkup — every 6 months at the dentist',
  },
  'mobile.personalCare.card.moroccanBath.title': { ar: 'حمام مغربي', en: 'Moroccan Bath' },
  'mobile.personalCare.card.moroccanBath.subtitle': {
    ar: 'طقس الجمال التقليدي',
    en: 'The traditional beauty ritual',
  },
  'mobile.personalCare.card.moroccanBath.tip1': {
    ar: 'الصابون البلدي — أساس الحمام المغربي',
    en: 'Beldi soap — the base of the Moroccan bath',
  },
  'mobile.personalCare.card.moroccanBath.tip2': {
    ar: 'الليفة المغربية — تقشير عميق للجسم',
    en: 'Moroccan loofah — deep body exfoliation',
  },
  'mobile.personalCare.card.moroccanBath.tip3': {
    ar: 'طين الغاسول — ينقي ويشد البشرة',
    en: 'Ghassoul clay — purifies and firms the skin',
  },
  'mobile.personalCare.card.moroccanBath.tip4': {
    ar: 'ماء الورد — لإنعاش بعد الحمام',
    en: 'Rose water — a refresher after the bath',
  },
  'mobile.personalCare.card.aromatherapy.title': { ar: 'العلاج بالروائح', en: 'Aromatherapy' },
  'mobile.personalCare.card.aromatherapy.subtitle': {
    ar: 'زيوت عطرية لجمالك وصحتك',
    en: 'Essential oils for your beauty and health',
  },
  'mobile.personalCare.card.aromatherapy.tip1': {
    ar: 'اللافندر — للاسترخاء والنوم العميق',
    en: 'Lavender — for relaxation and deep sleep',
  },
  'mobile.personalCare.card.aromatherapy.tip2': {
    ar: 'الليمون — منعش ومنشط للطاقة',
    en: 'Lemon — refreshing and energizing',
  },
  'mobile.personalCare.card.aromatherapy.tip3': {
    ar: 'الورد — مهدئ للبشرة الحساسة',
    en: 'Rose — soothing for sensitive skin',
  },
  'mobile.personalCare.card.aromatherapy.tip4': {
    ar: 'النعناع — للصداع وتنشيط الدورة',
    en: 'Mint — for headaches and boosting circulation',
  },
  'mobile.personalCare.card.dryBrushing.title': { ar: 'التقشير الجاف', en: 'Dry Brushing' },
  'mobile.personalCare.card.dryBrushing.subtitle': {
    ar: 'تنظيف عميق بدون ماء',
    en: 'Deep cleansing without water',
  },
  'mobile.personalCare.card.dryBrushing.tip1': {
    ar: 'من الأسفل للأعلى — دائماً باتجاه القلب',
    en: 'Bottom to top — always toward the heart',
  },
  'mobile.personalCare.card.dryBrushing.tip2': {
    ar: 'قبل الاستحمام — على بشرة جافة تماماً',
    en: 'Before showering — on completely dry skin',
  },
  'mobile.personalCare.card.dryBrushing.tip3': {
    ar: '2-3 مرات أسبوعياً — لا يومياً',
    en: '2-3 times a week — not daily',
  },
  'mobile.personalCare.card.dryBrushing.tip4': {
    ar: 'بعدها — زيت أو كريم مرطب فوراً',
    en: 'Afterward — oil or moisturizing cream right away',
  },
  'mobile.personalCare.card.iceCubes.title': {
    ar: 'مكعبات الثلج للوجه',
    en: 'Ice Cubes for the Face',
  },
  'mobile.personalCare.card.iceCubes.subtitle': {
    ar: 'سر إشراقة الصباح',
    en: 'The secret to morning radiance',
  },
  'mobile.personalCare.card.iceCubes.tip1': {
    ar: 'يقلص المسام — بشرة أنعم فوراً',
    en: 'Shrinks pores — instantly smoother skin',
  },
  'mobile.personalCare.card.iceCubes.tip2': {
    ar: 'صباحاً — يقلل الانتفاخ تحت العين',
    en: 'In the morning — reduces under-eye puffiness',
  },
  'mobile.personalCare.card.iceCubes.tip3': {
    ar: 'ثلج ماء الورد — مهدئ للبشرة',
    en: 'Rose water ice — soothing for the skin',
  },
  'mobile.personalCare.card.iceCubes.tip4': {
    ar: '30 ثانية لكل منطقة — لا تطيلي',
    en: "30 seconds per area — don't overdo it",
  },
  'mobile.personalCare.card.facialSteam.title': { ar: 'بخار الوجه', en: 'Facial Steam' },
  'mobile.personalCare.card.facialSteam.subtitle': {
    ar: 'سبا منزلي بسيط',
    en: 'A simple home spa',
  },
  'mobile.personalCare.card.facialSteam.tip1': {
    ar: 'أضيفي أعشاب — بابونج أو نعناع أو روزماري',
    en: 'Add herbs — chamomile, mint or rosemary',
  },
  'mobile.personalCare.card.facialSteam.tip2': {
    ar: '5-10 دقائق — مرتين أسبوعياً',
    en: '5-10 minutes — twice a week',
  },
  'mobile.personalCare.card.facialSteam.tip3': {
    ar: 'مسافة آمنة — 30 سم عن الوجه',
    en: 'Safe distance — 30 cm from the face',
  },
  'mobile.personalCare.card.facialSteam.tip4': {
    ar: 'بعد البخار — سيروم أو مرطب فوراً',
    en: 'After steaming — serum or moisturizer right away',
  },
  'mobile.personalCare.card.silkPillow.title': { ar: 'وسادة الحرير', en: 'Silk Pillow' },
  'mobile.personalCare.card.silkPillow.subtitle': {
    ar: 'سر جمالي أثناء النوم',
    en: 'A beauty secret while you sleep',
  },
  'mobile.personalCare.card.silkPillow.tip1': {
    ar: 'يمنع تكسر الشعر — احتكاك أقل من القطن',
    en: 'Prevents hair breakage — less friction than cotton',
  },
  'mobile.personalCare.card.silkPillow.tip2': {
    ar: 'يمنع تجاعيد النوم — بشرة أنعم صباحاً',
    en: 'Prevents sleep wrinkles — smoother skin in the morning',
  },
  'mobile.personalCare.card.silkPillow.tip3': {
    ar: 'يحافظ على ترطيب البشرة — لا يمتص الزيوت',
    en: "Preserves skin moisture — doesn't absorb oils",
  },
  'mobile.personalCare.card.silkPillow.tip4': {
    ar: 'اغسليها كل أسبوع — بماء بارد وصابون لطيف',
    en: 'Wash it weekly — with cold water and gentle soap',
  },
  'mobile.personalCare.card.hairRemoval.title': { ar: 'إزالة الشعر', en: 'Hair Removal' },
  'mobile.personalCare.card.hairRemoval.subtitle': {
    ar: 'أي طريقة تناسبك؟',
    en: 'Which method suits you?',
  },
  'mobile.personalCare.card.hairRemoval.tip1': {
    ar: 'حلاوة — طبيعية ألم أقل من الشمع',
    en: 'Sugaring — natural, with less pain than wax',
  },
  'mobile.personalCare.card.hairRemoval.tip2': {
    ar: 'شمع — نتيجة تدوم 3-4 أسابيع',
    en: 'Wax — results last 3-4 weeks',
  },
  'mobile.personalCare.card.hairRemoval.tip3': {
    ar: 'ليزر — نتيجة شبه دائمة 6 جلسات',
    en: 'Laser — near-permanent results in 6 sessions',
  },
  'mobile.personalCare.card.hairRemoval.tip4': {
    ar: 'فتلة — للوجه دقيقة جداً',
    en: 'Threading — very precise for the face',
  },
  'mobile.personalCare.card.detoxWater.title': { ar: 'ماء الديتوكس', en: 'Detox Water' },
  'mobile.personalCare.card.detoxWater.subtitle': {
    ar: 'مشروبات طبيعية لبشرة متوهجة',
    en: 'Natural drinks for glowing skin',
  },
  'mobile.personalCare.card.detoxWater.tip1': {
    ar: 'ليمون + نعناع — منعش يطرد السموم',
    en: 'Lemon + mint — refreshing, flushes out toxins',
  },
  'mobile.personalCare.card.detoxWater.tip2': {
    ar: 'فراولة + ريحان — مضاد أكسدة بشرة مشرقة',
    en: 'Strawberry + basil — antioxidant for bright skin',
  },
  'mobile.personalCare.card.detoxWater.tip3': {
    ar: 'خيار + زنجبيل — مهدئ يقلل الالتهابات',
    en: 'Cucumber + ginger — soothing, reduces inflammation',
  },
  'mobile.personalCare.card.detoxWater.tip4': {
    ar: 'برتقال + قرفة — فيتامين C كولاجين طبيعي',
    en: 'Orange + cinnamon — vitamin C, natural collagen',
  },
  'mobile.personalCare.card.ledMask.title': { ar: 'قناع LED', en: 'LED Mask' },
  'mobile.personalCare.card.ledMask.subtitle': {
    ar: 'العلاج بالضوء في منزلك',
    en: 'Light therapy at home',
  },
  'mobile.personalCare.card.ledMask.tip1': {
    ar: 'أحمر — كولاجين مضاد للشيخوخة',
    en: 'Red — collagen, anti-aging',
  },
  'mobile.personalCare.card.ledMask.tip2': {
    ar: 'أزرق — يقتل البكتيريا لعلاج الحبوب',
    en: 'Blue — kills bacteria to treat acne',
  },
  'mobile.personalCare.card.ledMask.tip3': {
    ar: 'أصفر — يفتح البقع يقلل التصبغات',
    en: 'Yellow — brightens spots, reduces pigmentation',
  },
  'mobile.personalCare.card.ledMask.tip4': {
    ar: 'أخضر — مهدئ يقلل الاحمرار',
    en: 'Green — soothing, reduces redness',
  },
  'mobile.personalCare.card.guaSha.title': { ar: 'روتين القواشا', en: 'Gua Sha Routine' },
  'mobile.personalCare.card.guaSha.subtitle': {
    ar: 'تدليك يومي — 5 دقائق فقط',
    en: 'Daily massage — just 5 minutes',
  },
  'mobile.personalCare.card.guaSha.tip1': {
    ar: 'زيت أو سيروم — لتزلق الأداة على البشرة',
    en: 'Oil or serum — so the tool glides on the skin',
  },
  'mobile.personalCare.card.guaSha.tip2': {
    ar: 'دائماً للأعلى وللخارج — ضد الجاذبية',
    en: 'Always up and out — against gravity',
  },
  'mobile.personalCare.card.guaSha.tip3': {
    ar: '5 تمريرات لكل منطقة — بلطف وليس بقوة',
    en: '5 passes per area — gently, not forcefully',
  },
  'mobile.personalCare.card.guaSha.tip4': {
    ar: 'خزني الحجر في الثلاجة — لانتعاش إضافي',
    en: 'Store the stone in the fridge — extra freshness',
  },
  'mobile.personalCare.card.microcurrent.title': { ar: 'المايكروكرنت', en: 'Microcurrent' },
  'mobile.personalCare.card.microcurrent.subtitle': {
    ar: 'تيار كهربائي خفيف — شد فوري',
    en: 'A mild electric current — instant lift',
  },
  'mobile.personalCare.card.microcurrent.tip1': {
    ar: 'يحفز العضلات — يشد ملامح الوجه',
    en: 'Stimulates muscles — lifts facial features',
  },
  'mobile.personalCare.card.microcurrent.tip2': {
    ar: 'للأعلى وللخارج — ضد الجاذبية',
    en: 'Up and out — against gravity',
  },
  'mobile.personalCare.card.microcurrent.tip3': {
    ar: '5-10 دقائق — 3-4 مرات أسبوعياً',
    en: '5-10 minutes — 3-4 times a week',
  },
  'mobile.personalCare.card.microcurrent.tip4': {
    ar: 'جل موصل — ضروري لتوصيل التيار',
    en: 'Conductive gel — essential for the current to flow',
  },
  'mobile.personalCare.card.radioFrequency.title': {
    ar: 'الراديو فريكونسي',
    en: 'Radio Frequency',
  },
  'mobile.personalCare.card.radioFrequency.subtitle': {
    ar: 'موجات حرارية — كولاجين جديد',
    en: 'Heat waves — new collagen',
  },
  'mobile.personalCare.card.radioFrequency.tip1': {
    ar: 'يسخن الأدمة — يحفز إنتاج الكولاجين',
    en: 'Heats the dermis — stimulates collagen production',
  },
  'mobile.personalCare.card.radioFrequency.tip2': {
    ar: 'يشد الجلد — يقلل الترهلات والخطوط',
    en: 'Tightens the skin — reduces sagging and lines',
  },
  'mobile.personalCare.card.radioFrequency.tip3': {
    ar: 'جلسة 30-45 دقيقة — مرة شهرياً',
    en: 'A 30-45 minute session — once a month',
  },
  'mobile.personalCare.card.radioFrequency.tip4': {
    ar: 'احمرار مؤقت — يختفي خلال ساعات',
    en: 'Temporary redness — fades within hours',
  },
  'mobile.personalCare.card.cryoStick.title': { ar: 'عصا الكرايو', en: 'Cryo Stick' },
  'mobile.personalCare.card.cryoStick.subtitle': {
    ar: 'تبريد عميق — انتعاش فوري',
    en: 'Deep cooling — instant refreshment',
  },
  'mobile.personalCare.card.cryoStick.tip1': {
    ar: 'يقلص المسام — بشرة أنعم وأكثر إشراقاً',
    en: 'Shrinks pores — smoother, brighter skin',
  },
  'mobile.personalCare.card.cryoStick.tip2': {
    ar: 'تدليك بارد — يقلل الانتفاخ تحت العين',
    en: 'Cold massage — reduces under-eye puffiness',
  },
  'mobile.personalCare.card.cryoStick.tip3': {
    ar: 'صباحاً — ينشط الدورة الدموية',
    en: 'In the morning — boosts blood circulation',
  },
  'mobile.personalCare.card.cryoStick.tip4': {
    ar: '3-5 دقائق — لا تطيلي على منطقة واحدة',
    en: "3-5 minutes — don't linger on one area",
  },
  'mobile.personalCare.card.ultrasonic.title': { ar: 'الموجات فوق الصوتية', en: 'Ultrasound' },
  'mobile.personalCare.card.ultrasonic.subtitle': {
    ar: 'ملعقة تنظيف المسام',
    en: 'A pore-cleaning spatula',
  },
  'mobile.personalCare.card.ultrasonic.tip1': {
    ar: 'اهتزازات عالية — تطرد الرؤوس السوداء',
    en: 'High-frequency vibrations — dislodge blackheads',
  },
  'mobile.personalCare.card.ultrasonic.tip2': {
    ar: 'على بشرة رطبة — أفضل نتائج',
    en: 'On damp skin — best results',
  },
  'mobile.personalCare.card.ultrasonic.tip3': {
    ar: 'حركي للأعلى — بطول المسام',
    en: 'Move upward — along the pores',
  },
  'mobile.personalCare.card.ultrasonic.tip4': {
    ar: 'مرة أسبوعياً — لا تفرطي في الاستخدام',
    en: "Once a week — don't overuse it",
  },
  'mobile.personalCare.card.highFrequency.title': { ar: 'التردد العالي', en: 'High Frequency' },
  'mobile.personalCare.card.highFrequency.subtitle': {
    ar: 'غاز الأرجون — علاج الحبوب',
    en: 'Argon gas — acne treatment',
  },
  'mobile.personalCare.card.highFrequency.tip1': {
    ar: 'يجفف الحبوب — يقتل البكتيريا المسببة',
    en: 'Dries pimples — kills the bacteria causing them',
  },
  'mobile.personalCare.card.highFrequency.tip2': {
    ar: 'يحسن الدورة الدموية — بشرة متوهجة',
    en: 'Improves blood circulation — glowing skin',
  },
  'mobile.personalCare.card.highFrequency.tip3': {
    ar: 'على بشرة جافة — مع شاش واقي',
    en: 'On dry skin — with a protective gauze',
  },
  'mobile.personalCare.card.highFrequency.tip4': {
    ar: '3-5 دقائق — مرتين أسبوعياً',
    en: '3-5 minutes — twice a week',
  },
  'mobile.personalCare.card.cellulite.title': { ar: 'السيلوليت', en: 'Cellulite' },
  'mobile.personalCare.card.cellulite.subtitle': {
    ar: 'علاج مظهر قشر البرتقال',
    en: 'Treating the orange-peel look',
  },
  'mobile.personalCare.card.cellulite.tip1': {
    ar: 'مساج التصريف اللمفاوي — يقلل الاحتباس',
    en: 'Lymphatic drainage massage — reduces retention',
  },
  'mobile.personalCare.card.cellulite.tip2': {
    ar: 'رياضة منتظمة — تحسن الدورة الدموية',
    en: 'Regular exercise — improves circulation',
  },
  'mobile.personalCare.card.cellulite.tip3': {
    ar: 'اشربي ماء — الترطيب يحسن مظهر الجلد',
    en: 'Drink water — hydration improves skin appearance',
  },
  'mobile.personalCare.card.cellulite.tip4': {
    ar: 'كافيين موضعي — كريمات تنشط الدورة',
    en: 'Topical caffeine — creams that boost circulation',
  },
  'mobile.personalCare.card.stretchMarks.title': { ar: 'علامات التمدد', en: 'Stretch Marks' },
  'mobile.personalCare.card.stretchMarks.subtitle': {
    ar: 'علاج وتخفيف الخطوط',
    en: 'Treating and fading the lines',
  },
  'mobile.personalCare.card.stretchMarks.tip1': {
    ar: 'زبدة الكاكاو — ترطيب يومي أثناء الحمل',
    en: 'Cocoa butter — daily moisturizing during pregnancy',
  },
  'mobile.personalCare.card.stretchMarks.tip2': {
    ar: 'زيت ثمر الورد — يحسن مظهر العلامات',
    en: 'Rosehip oil — improves the appearance of marks',
  },
  'mobile.personalCare.card.stretchMarks.tip3': {
    ar: 'مايكرونيدلنغ — لتحفيز الكولاجين',
    en: 'Microneedling — to stimulate collagen',
  },
  'mobile.personalCare.card.stretchMarks.tip4': {
    ar: 'العلاج المبكر — أفضل النتائج',
    en: 'Early treatment — the best results',
  },
  'mobile.personalCare.card.bodySculpting.title': { ar: 'نحت الجسم', en: 'Body Sculpting' },
  'mobile.personalCare.card.bodySculpting.subtitle': {
    ar: 'تقنيات غير جراحية',
    en: 'Non-surgical techniques',
  },
  'mobile.personalCare.card.bodySculpting.tip1': {
    ar: 'تجميد الدهون — كريوليبوليسز',
    en: 'Fat freezing — cryolipolysis',
  },
  'mobile.personalCare.card.bodySculpting.tip2': {
    ar: 'راديو فريكونسي — حرارة تشد الجلد',
    en: 'Radio frequency — heat that tightens the skin',
  },
  'mobile.personalCare.card.bodySculpting.tip3': {
    ar: 'ألتراساوند — موجات تذيب الدهون',
    en: 'Ultrasound — waves that melt fat',
  },
  'mobile.personalCare.card.bodySculpting.tip4': {
    ar: 'حقن — إذابة دهون موضعية',
    en: 'Injections — dissolving localized fat',
  },
  'mobile.personalCare.card.bodyWraps.title': { ar: 'لفافات الجسم', en: 'Body Wraps' },
  'mobile.personalCare.card.bodyWraps.subtitle': {
    ar: 'علاجات سبا للجسم',
    en: 'Spa treatments for the body',
  },
  'mobile.personalCare.card.bodyWraps.tip1': {
    ar: 'طين البحر — ينظف ويزيل السموم',
    en: 'Sea clay — cleanses and removes toxins',
  },
  'mobile.personalCare.card.bodyWraps.tip2': {
    ar: 'شوكولاتة — مضاد أكسدة يرطب وينعم',
    en: 'Chocolate — an antioxidant that hydrates and smooths',
  },
  'mobile.personalCare.card.bodyWraps.tip3': {
    ar: 'أعشاب بحرية — يغذي وينشط البشرة',
    en: 'Seaweed — nourishes and revitalizes the skin',
  },
  'mobile.personalCare.card.bodyWraps.tip4': {
    ar: 'قهوة — كافيين يشد وينشط',
    en: 'Coffee — caffeine that firms and energizes',
  },
  'mobile.personalCare.card.lymphaticDrainage.title': {
    ar: 'التصريف اللمفاوي',
    en: 'Lymphatic Drainage',
  },
  'mobile.personalCare.card.lymphaticDrainage.subtitle': {
    ar: 'مساج لإزالة السموم',
    en: 'A detox massage',
  },
  'mobile.personalCare.card.lymphaticDrainage.tip1': {
    ar: 'حركات خفيفة — باتجاه الغدد اللمفاوية',
    en: 'Light movements — toward the lymph nodes',
  },
  'mobile.personalCare.card.lymphaticDrainage.tip2': {
    ar: 'يقلل احتباس السوائل — جسم أنحف',
    en: 'Reduces fluid retention — a slimmer body',
  },
  'mobile.personalCare.card.lymphaticDrainage.tip3': {
    ar: 'يقوي المناعة — ينشط الجهاز اللمفاوي',
    en: 'Strengthens immunity — activates the lymphatic system',
  },
  'mobile.personalCare.card.lymphaticDrainage.tip4': {
    ar: 'مرة أسبوعياً — أو قبل المناسبات',
    en: 'Once a week — or before occasions',
  },
  'mobile.personalCare.card.makeupStorage.title': { ar: 'تخزين المكياج', en: 'Makeup Storage' },
  'mobile.personalCare.card.makeupStorage.subtitle': {
    ar: 'حافظي على منتجاتك نظيفة',
    en: 'Keep your products clean',
  },
  'mobile.personalCare.card.makeupStorage.tip1': {
    ar: 'مكان بارد وجاف — ليس في الحمام',
    en: 'A cool, dry place — not in the bathroom',
  },
  'mobile.personalCare.card.makeupStorage.tip2': {
    ar: 'منظمات أكريليك شفافة',
    en: 'Clear acrylic organizers',
  },
  'mobile.personalCare.card.makeupStorage.tip3': {
    ar: 'بعيداً عن الشمس — الضوء يدمر المنتجات',
    en: 'Away from sunlight — light damages products',
  },
  'mobile.personalCare.card.makeupStorage.tip4': {
    ar: 'قسميها: يومي — أسبوعي — مناسبات',
    en: 'Sort them: daily — weekly — occasions',
  },
  'mobile.personalCare.card.productShelfLife.title': {
    ar: 'مدة صلاحية المنتجات',
    en: 'Product Shelf Life',
  },
  'mobile.personalCare.card.productShelfLife.subtitle': {
    ar: 'متى تتخلصين من منتجاتك؟',
    en: 'When should you get rid of your products?',
  },
  'mobile.personalCare.card.productShelfLife.tip1': {
    ar: 'ماسكارا: 3-6 أشهر',
    en: 'Mascara: 3-6 months',
  },
  'mobile.personalCare.card.productShelfLife.tip2': {
    ar: 'كريمات: 6-12 شهر بعد الفتح',
    en: 'Creams: 6-12 months after opening',
  },
  'mobile.personalCare.card.productShelfLife.tip3': {
    ar: 'بودرة: سنتان — الأطول عمراً',
    en: 'Powder: two years — the longest lasting',
  },
  'mobile.personalCare.card.productShelfLife.tip4': {
    ar: 'طلاء أظافر: سنة — يسمك مع الوقت',
    en: 'Nail polish: one year — it thickens over time',
  },
  'mobile.personalCare.card.vanityOrganization.title': {
    ar: 'تنظيم التسريحة',
    en: 'Vanity Organization',
  },
  'mobile.personalCare.card.vanityOrganization.subtitle': {
    ar: 'ركن جمالكِ المثالي',
    en: 'Your perfect beauty corner',
  },
  'mobile.personalCare.card.vanityOrganization.tip1': {
    ar: 'إضاءة طبيعية — قرب النافذة',
    en: 'Natural light — near the window',
  },
  'mobile.personalCare.card.vanityOrganization.tip2': {
    ar: 'أدراج مقسمة — كل فئة في درج',
    en: 'Divided drawers — each category in a drawer',
  },
  'mobile.personalCare.card.vanityOrganization.tip3': {
    ar: 'مرآة مكبرة — للتفاصيل الدقيقة',
    en: 'Magnifying mirror — for fine details',
  },
  'mobile.personalCare.card.vanityOrganization.tip4': {
    ar: 'نظفي التسريحة أسبوعياً',
    en: 'Clean the vanity weekly',
  },
  'mobile.personalCare.card.travelBag.title': {
    ar: 'تعبئة حقيبة السفر',
    en: 'Packing the Travel Bag',
  },
  'mobile.personalCare.card.travelBag.subtitle': {
    ar: 'الأساسيات — بدون فوضى',
    en: 'The essentials — without the mess',
  },
  'mobile.personalCare.card.travelBag.tip1': {
    ar: 'عبوات سفر صغيرة — أعيدي تعبئتها',
    en: 'Small travel bottles — refill them',
  },
  'mobile.personalCare.card.travelBag.tip2': {
    ar: 'باليت متعدد — خدود + عيون + هايلايتر',
    en: 'A multi palette — blush + eyes + highlighter',
  },
  'mobile.personalCare.card.travelBag.tip3': {
    ar: 'قائمة أساسيات — لا تنسي شيئاً',
    en: "An essentials list — don't forget anything",
  },
  'mobile.personalCare.card.travelBag.tip4': {
    ar: 'حقيبة شفافة — للمطار',
    en: 'A clear bag — for the airport',
  },
  'mobile.personalCare.card.declutter.title': { ar: 'ترتيب وتنظيف', en: 'Sorting and Cleaning' },
  'mobile.personalCare.card.declutter.subtitle': {
    ar: 'تخلصي من الفوضى',
    en: 'Get rid of the clutter',
  },
  'mobile.personalCare.card.declutter.tip1': {
    ar: 'تخلصي من: تغير لون أو رائحة أو قوام',
    en: 'Discard: changed color, smell or texture',
  },
  'mobile.personalCare.card.declutter.tip2': {
    ar: 'كل 3 أشهر — راجعي مجموعتكِ',
    en: 'Every 3 months — review your collection',
  },
  'mobile.personalCare.card.declutter.tip3': {
    ar: 'احتفظي بما تستخدمينه فعلاً',
    en: 'Keep what you actually use',
  },
  'mobile.personalCare.card.declutter.tip4': {
    ar: 'تبرعي بالجديد غير المستخدم',
    en: 'Donate new, unused items',
  },
  'mobile.personalCare.card.neckCare.title': { ar: 'عناية الرقبة', en: 'Neck Care' },
  'mobile.personalCare.card.neckCare.subtitle': {
    ar: 'لا تهمليها — تظهر العمر قبل الوجه',
    en: "Don't neglect it — it shows age before the face",
  },
  'mobile.personalCare.card.neckCare.tip1': {
    ar: 'مددي منتجات الوجه للرقبة والصدر',
    en: 'Extend face products to the neck and chest',
  },
  'mobile.personalCare.card.neckCare.tip2': {
    ar: 'كريمات مشدودة — ببتيدات وريتينول',
    en: 'Firming creams — peptides and retinol',
  },
  'mobile.personalCare.card.neckCare.tip3': {
    ar: 'واقي شمس — للرقبة أيضاً',
    en: 'Sunscreen — for the neck too',
  },
  'mobile.personalCare.card.neckCare.tip4': {
    ar: 'نامي على الظهر — تجاعيد الجانب',
    en: 'Sleep on your back — side wrinkles',
  },
  'mobile.personalCare.card.chestCare.title': { ar: 'عناية الصدر', en: 'Chest Care' },
  'mobile.personalCare.card.chestCare.subtitle': {
    ar: 'منطقة مهملة — تستحق العناية',
    en: 'A neglected area — it deserves care',
  },
  'mobile.personalCare.card.chestCare.tip1': {
    ar: 'نفس روتين وجهكِ — يمتد للصدر',
    en: 'The same routine as your face — extend it to the chest',
  },
  'mobile.personalCare.card.chestCare.tip2': {
    ar: 'تقشير لطيف — مرة أسبوعياً',
    en: 'Gentle exfoliation — once a week',
  },
  'mobile.personalCare.card.chestCare.tip3': {
    ar: 'ترطيب بعد الاستحمام',
    en: 'Moisturize after showering',
  },
  'mobile.personalCare.card.chestCare.tip4': {
    ar: 'SPF يومي — الصدر معرض للشمس',
    en: 'Daily SPF — the chest is exposed to the sun',
  },
  'mobile.personalCare.card.techNeck.title': { ar: 'تجاعيد الجوال', en: 'Phone Wrinkles' },
  'mobile.personalCare.card.techNeck.subtitle': {
    ar: 'Tech Neck — أثر النظر للأسفل',
    en: 'Tech neck — the effect of looking down',
  },
  'mobile.personalCare.card.techNeck.tip1': {
    ar: 'ارفعي الجوال — لمستوى العين',
    en: 'Raise the phone — to eye level',
  },
  'mobile.personalCare.card.techNeck.tip2': {
    ar: 'وضعية الجلوس — ظهر مستقيم',
    en: 'Sitting posture — a straight back',
  },
  'mobile.personalCare.card.techNeck.tip3': {
    ar: 'تمارين الرقبة — مد وإطالة يومياً',
    en: 'Neck exercises — stretch daily',
  },
  'mobile.personalCare.card.techNeck.tip4': {
    ar: 'كريمات الببتيد — تحفز الكولاجين',
    en: 'Peptide creams — stimulate collagen',
  },
  'mobile.personalCare.card.neckMask.title': { ar: 'قناع الرقبة', en: 'Neck Mask' },
  'mobile.personalCare.card.neckMask.subtitle': {
    ar: 'علاج مكثف للرقبة',
    en: 'An intensive treatment for the neck',
  },
  'mobile.personalCare.card.neckMask.tip1': {
    ar: 'قناع سيليكون — يعاد استخدامه',
    en: 'Silicone mask — reusable',
  },
  'mobile.personalCare.card.neckMask.tip2': {
    ar: 'قناع ورقي للرقبة — مرة أسبوعياً',
    en: 'A sheet neck mask — once a week',
  },
  'mobile.personalCare.card.neckMask.tip3': {
    ar: '20-30 دقيقة — وقت الاسترخاء',
    en: '20-30 minutes — relaxation time',
  },
  'mobile.personalCare.card.neckMask.tip4': {
    ar: 'قبل النوم — البشرة تتجدد ليلاً',
    en: 'Before bed — the skin renews at night',
  },
  'mobile.personalCare.card.neckFirming.title': { ar: 'شد الرقبة', en: 'Neck Firming' },
  'mobile.personalCare.card.neckFirming.subtitle': {
    ar: 'تمارين وكريمات للرقبة المشدودة',
    en: 'Exercises and creams for a firm neck',
  },
  'mobile.personalCare.card.neckFirming.tip1': {
    ar: 'تمرين O —— مددي شفاهكِ — 15 مرة',
    en: 'O exercise — stretch your lips — 15 times',
  },
  'mobile.personalCare.card.neckFirming.tip2': {
    ar: 'مد الرقبة — انظري للسقف 10 ثوانٍ',
    en: 'Neck stretch — look at the ceiling for 10 seconds',
  },
  'mobile.personalCare.card.neckFirming.tip3': {
    ar: 'كريمات الشد — كافيين وببتيدات',
    en: 'Firming creams — caffeine and peptides',
  },
  'mobile.personalCare.card.neckFirming.tip4': {
    ar: 'مساج للأعلى — من الترقوة للذقن',
    en: 'Massage upward — from the collarbone to the chin',
  },
  'mobile.personalCare.card.beautyEmergencyKit.title': {
    ar: 'حقيبة طوارئ الجمال',
    en: 'Beauty Emergency Kit',
  },
  'mobile.personalCare.card.beautyEmergencyKit.subtitle': {
    ar: 'أساسيات في شنطتكِ',
    en: 'Essentials in your bag',
  },
  'mobile.personalCare.card.beautyEmergencyKit.tip1': {
    ar: 'أحمر شفاه — لون محايد',
    en: 'Lipstick — a neutral shade',
  },
  'mobile.personalCare.card.beautyEmergencyKit.tip2': {
    ar: 'ورق نشاف — يزيل اللمعان',
    en: 'Blotting paper — removes shine',
  },
  'mobile.personalCare.card.beautyEmergencyKit.tip3': {
    ar: 'مرآة صغيرة — للمسات السريعة',
    en: 'A small mirror — for quick touch-ups',
  },
  'mobile.personalCare.card.beautyEmergencyKit.tip4': {
    ar: 'لصقة حبوب — للطوارئ',
    en: 'Pimple patch — for emergencies',
  },

  // ---- admin AI features (sweep s3) ----
  'mobile.adminAiFeatures.feature.aiRoutine.name': { ar: 'روتين ذكي', en: 'Smart Routine' },
  'mobile.adminAiFeatures.feature.aiRoutine.desc': {
    ar: 'توليد روتين عناية مخصص',
    en: 'Generate a personalized care routine',
  },
  'mobile.adminAiFeatures.feature.aiAdvisor.name': { ar: 'مستشارة AI', en: 'AI Advisor' },
  'mobile.adminAiFeatures.feature.aiAdvisor.desc': {
    ar: 'محادثات ذكية للإجابة',
    en: 'Smart conversations that answer questions',
  },
  'mobile.adminAiFeatures.feature.aiColor.name': { ar: 'تحليل ألوان AI', en: 'AI Color Analysis' },
  'mobile.adminAiFeatures.feature.aiColor.desc': {
    ar: 'تحليل لون البشرة آلياً',
    en: 'Automatic skin tone analysis',
  },
  'mobile.adminAiFeatures.feature.aiSkin.name': { ar: 'تحليل بشرة AI', en: 'AI Skin Analysis' },
  'mobile.adminAiFeatures.feature.aiSkin.desc': {
    ar: 'تشخيص مشاكل البشرة',
    en: 'Diagnose skin concerns',
  },

  // ---- admin cashback rules (sweep s3) ----
  'mobile.adminCashback.rule.manicureSpa': { ar: 'مانيكير سبا', en: 'Spa Manicure' },
  'mobile.adminCashback.rule.fullMakeup': { ar: 'مكياج كامل', en: 'Full Makeup' },
  'mobile.adminCashback.rule.relaxingMassage': { ar: 'مساج استرخاء', en: 'Relaxing Massage' },
  'mobile.adminCashback.rule.hairColoring': { ar: 'صبغ شعر', en: 'Hair Coloring' },

  // ---- admin flash deals (sweep s3) ----
  'mobile.adminFlashDeals.less-than-hour': { ar: 'أقل من ساعة', en: '< 1h' },
  'mobile.adminFlashDeals.hours-left': { ar: '{hours} ساعة', en: '{hours}h' },

  // ---- accessories guide (sweep s3) ----
  'mobile.accessoriesGuide.card.styling.title': {
    ar: 'تنسيق الإكسسوارات',
    en: 'Accessory Styling',
  },
  'mobile.accessoriesGuide.card.styling.subtitle': {
    ar: 'اللمسة الأخيرة لإطلالتك',
    en: 'The finishing touch for your look',
  },
  'mobile.accessoriesGuide.card.styling.tip1': {
    ar: 'أقراط — طويلة = وجه أنحف',
    en: 'Earrings — long ones slim the face',
  },
  'mobile.accessoriesGuide.card.styling.tip2': {
    ar: 'عقد — يناسب فتحة الرقبة',
    en: 'Necklace — match the neckline',
  },
  'mobile.accessoriesGuide.card.styling.tip3': {
    ar: 'ساعة — كلاسيك لكل مناسبة',
    en: 'Watch — a classic for every occasion',
  },
  'mobile.accessoriesGuide.card.styling.tip4': {
    ar: 'خواتم — 2-3 كحد أقصى',
    en: 'Rings — 2-3 max',
  },
  'mobile.accessoriesGuide.card.beautyBag.title': { ar: 'حقيبة الجمال', en: 'Beauty Bag' },
  'mobile.accessoriesGuide.card.beautyBag.subtitle': {
    ar: 'أساسيات لا تستغني عنها',
    en: 'Essentials you cannot do without',
  },
  'mobile.accessoriesGuide.card.beautyBag.tip1': {
    ar: 'أحمر شفاه — لون ناعم للإطلالة اليومية',
    en: 'Lipstick — a soft shade for everyday looks',
  },
  'mobile.accessoriesGuide.card.beautyBag.tip2': {
    ar: 'مرآة صغيرة — للمسات السريعة',
    en: 'Small mirror — for quick touch-ups',
  },
  'mobile.accessoriesGuide.card.beautyBag.tip3': {
    ar: 'مرطب سفر — حجم صغير للطوارئ',
    en: 'Travel moisturizer — a small size for emergencies',
  },
  'mobile.accessoriesGuide.card.beautyBag.tip4': {
    ar: 'واقي شمس — Mini size للشنطة',
    en: 'Sunscreen — mini size for your bag',
  },
  'mobile.accessoriesGuide.card.hijabElegance.title': { ar: 'أناقة الحجاب', en: 'Hijab Elegance' },
  'mobile.accessoriesGuide.card.hijabElegance.subtitle': {
    ar: 'أفكار لتنسيق حجابك',
    en: 'Ideas for styling your hijab',
  },
  'mobile.accessoriesGuide.card.hijabElegance.tip1': {
    ar: 'ألوان متناسقة — الحجاب مع لون الفستان',
    en: 'Coordinated colors — hijab with the dress color',
  },
  'mobile.accessoriesGuide.card.hijabElegance.tip2': {
    ar: 'تثبيت محكم — دبابيس غير ظاهرة',
    en: 'Secure hold — invisible pins',
  },
  'mobile.accessoriesGuide.card.hijabElegance.tip3': {
    ar: 'بطانة حرير — تحمي الشعر من التكسر',
    en: 'Silk lining — protects hair from breakage',
  },
  'mobile.accessoriesGuide.card.hijabElegance.tip4': {
    ar: 'تغيير الأسلوب — جربي لفات جديدة',
    en: 'Change your style — try new wraps',
  },

  // ---- addresses (sweep s3) ----
  'mobile.addresses.separator': { ar: '،', en: ',' },

  // ---- beauty-academy cards (sweep s4) ----
  'mobile.beautyAcademy.card.encyclopedia.title': {
    ar: 'موسوعة الجمال',
    en: 'Beauty Encyclopedia',
  },
  'mobile.beautyAcademy.card.encyclopedia.subtitle': {
    ar: 'فيتامين سي — دليلك الشامل',
    en: 'Vitamin C — your complete guide',
  },
  'mobile.beautyAcademy.card.encyclopedia.tip1': {
    ar: 'مضاد أكسدة قوي — يفتح البشرة ويوحد لونها',
    en: 'A powerful antioxidant — brightens and evens the skin tone',
  },
  'mobile.beautyAcademy.card.encyclopedia.tip2': {
    ar: 'صباحاً قبل واقي الشمس — نتائج أفضل',
    en: 'In the morning before sunscreen — better results',
  },
  'mobile.beautyAcademy.card.encyclopedia.tip3': {
    ar: 'وقت القراءة: 5 دقائق — معلومات موثقة',
    en: 'Reading time: 5 minutes — verified information',
  },
  'mobile.beautyAcademy.card.encyclopedia.tip4': {
    ar: 'معلومة موثقة — مراجعة من خبراء',
    en: 'Verified information — reviewed by experts',
  },
  'mobile.beautyAcademy.card.skinTest.title': { ar: 'اختبار البشرة', en: 'Skin Quiz' },
  'mobile.beautyAcademy.card.skinTest.subtitle': {
    ar: 'اكتشفي نوع بشرتكِ',
    en: 'Discover your skin type',
  },
  'mobile.beautyAcademy.card.skinTest.tip1': {
    ar: 'كيف تبدو بشرتكِ بعد غسلها؟',
    en: 'How does your skin look after washing it?',
  },
  'mobile.beautyAcademy.card.skinTest.tip2': {
    ar: 'كيف تتصرف في الطقس الحار؟',
    en: 'How does it behave in hot weather?',
  },
  'mobile.beautyAcademy.card.skinTest.tip3': {
    ar: 'هل بشرتكِ حساسة للمنتجات الجديدة؟',
    en: 'Is your skin sensitive to new products?',
  },
  'mobile.beautyAcademy.card.skinTest.tip4': {
    ar: '3 أسئلة — نتيجة فورية لنوع بشرتك',
    en: '3 questions — an instant result for your skin type',
  },
  'mobile.beautyAcademy.card.trivia.title': { ar: 'أسئلة trivia', en: 'Trivia Questions' },
  'mobile.beautyAcademy.card.trivia.subtitle': {
    ar: 'هل تعرفين إجابات الجمال؟',
    en: 'Do you know the beauty answers?',
  },
  'mobile.beautyAcademy.card.trivia.tip1': {
    ar: 'أي فيتامين يسمى فيتامين الجمال؟',
    en: 'Which vitamin is called the beauty vitamin?',
  },
  'mobile.beautyAcademy.card.trivia.tip2': {
    ar: 'ما هو أقوى مضاد أكسدة في العناية؟',
    en: 'What is the strongest antioxidant in skincare?',
  },
  'mobile.beautyAcademy.card.trivia.tip3': {
    ar: 'كم وزن ماء يستطيع حمض الهيالورونيك حمله؟',
    en: 'How much water can hyaluronic acid hold?',
  },
  'mobile.beautyAcademy.card.trivia.tip4': {
    ar: 'أسئلة ممتعة — تعلمي أثناء اللعب',
    en: 'Fun questions — learn while you play',
  },
  'mobile.beautyAcademy.card.myths.title': { ar: 'خرافات الجمال', en: 'Beauty Myths' },
  'mobile.beautyAcademy.card.myths.subtitle': {
    ar: 'الحقيقة العلمية وراء الأساطير',
    en: 'The science behind the legends',
  },
  'mobile.beautyAcademy.card.myths.tip1': {
    ar: '"معجون الأسنان يعالج الحبوب" — خرافة!',
    en: '"Toothpaste cures pimples" — a myth!',
  },
  'mobile.beautyAcademy.card.myths.tip2': {
    ar: '"الشعر يطول أسرع بالقص المتكرر" — غير صحيح',
    en: '"Hair grows faster with frequent trims" — not true',
  },
  'mobile.beautyAcademy.card.myths.tip3': {
    ar: 'كل خرافة مع تفسير علمي مبسط',
    en: 'Every myth with a simple scientific explanation',
  },
  'mobile.beautyAcademy.card.myths.tip4': {
    ar: 'مصادر موثقة — من أطباء جلدية',
    en: 'Verified sources — from dermatologists',
  },
  'mobile.beautyAcademy.card.career.title': { ar: 'المسار الوظيفي', en: 'Career Path' },
  'mobile.beautyAcademy.card.career.subtitle': { ar: 'فنانة مكياج', en: 'Makeup Artist' },
  'mobile.beautyAcademy.card.career.tip1': {
    ar: 'المستوى: مبتدئ — 3 دورات أساسية',
    en: 'Level: beginner — 3 core courses',
  },
  'mobile.beautyAcademy.card.career.tip2': {
    ar: 'شهادة معتمدة — بعد إكمال 8 وحدات',
    en: 'Accredited certificate — after completing 8 modules',
  },
  'mobile.beautyAcademy.card.career.tip3': {
    ar: 'المدة التقريبية: 6 أشهر',
    en: 'Estimated duration: 6 months',
  },
  'mobile.beautyAcademy.card.career.tip4': {
    ar: 'مشروع تخرج — جلسة تصوير كاملة',
    en: 'Graduation project — a full photo shoot',
  },
  'mobile.beautyAcademy.card.recipes.title': { ar: 'وصفات طبيعية', en: 'Natural Recipes' },
  'mobile.beautyAcademy.card.recipes.subtitle': {
    ar: 'قناع الأفوكادو والعسل',
    en: 'Avocado and Honey Mask',
  },
  'mobile.beautyAcademy.card.recipes.tip1': {
    ar: 'المكونات: نصف أفوكادو + ملعقة عسل',
    en: 'Ingredients: half an avocado + a spoon of honey',
  },
  'mobile.beautyAcademy.card.recipes.tip2': {
    ar: 'المدة: 15 دقيقة على البشرة',
    en: 'Duration: 15 minutes on the skin',
  },
  'mobile.beautyAcademy.card.recipes.tip3': {
    ar: 'النتيجة: ترطيب عميق وإشراقة',
    en: 'Result: deep hydration and a glow',
  },
  'mobile.beautyAcademy.card.recipes.tip4': {
    ar: 'مرة أسبوعياً — مناسب للبشرة الجافة',
    en: 'Once a week — suitable for dry skin',
  },
  'mobile.beautyAcademy.card.infographic.title': { ar: 'إنفوجرافيك', en: 'Infographic' },
  'mobile.beautyAcademy.card.infographic.subtitle': {
    ar: 'الحماية من الشمس',
    en: 'Sun Protection',
  },
  'mobile.beautyAcademy.card.infographic.tip1': {
    ar: 'أشعة UVA — 95% تخترق الغيوم والزجاج',
    en: 'UVA rays — 95% penetrate clouds and glass',
  },
  'mobile.beautyAcademy.card.infographic.tip2': {
    ar: 'SPF 30 — 97% نسبة الحماية',
    en: 'SPF 30 — 97% protection rate',
  },
  'mobile.beautyAcademy.card.infographic.tip3': {
    ar: 'المصدر: منظمة الصحة العالمية',
    en: 'Source: World Health Organization',
  },
  'mobile.beautyAcademy.card.infographic.tip4': {
    ar: 'طبقي واقي الشمس يومياً حتى في البيت',
    en: 'Apply sunscreen daily, even at home',
  },
  'mobile.beautyAcademy.card.quickTip.title': { ar: 'نصيحة سريعة', en: 'Quick Tip' },
  'mobile.beautyAcademy.card.quickTip.subtitle': {
    ar: 'طبقي المرطب على بشرة رطبة',
    en: 'Apply moisturizer to damp skin',
  },
  'mobile.beautyAcademy.card.quickTip.tip1': {
    ar: 'التصنيف: ترطيب — الفئة: عناية يومية',
    en: 'Category: hydration — daily care',
  },
  'mobile.beautyAcademy.card.quickTip.tip2': {
    ar: 'بعد الغسول مباشرة — قبل أن تجف البشرة',
    en: 'Right after cleansing — before the skin dries',
  },
  'mobile.beautyAcademy.card.quickTip.tip3': {
    ar: 'المرطب يحبس الرطوبة — بشرة أنعم',
    en: 'Moisturizer locks in hydration — softer skin',
  },
  'mobile.beautyAcademy.card.quickTip.tip4': {
    ar: 'صباح ومساء — للحصول على أفضل نتيجة',
    en: 'Morning and evening — for the best result',
  },
  'mobile.beautyAcademy.card.saudiHeritage.title': { ar: 'التراث السعودي', en: 'Saudi Heritage' },
  'mobile.beautyAcademy.card.saudiHeritage.subtitle': {
    ar: 'الحناء — فن وجمال',
    en: 'Henna — Art and Beauty',
  },
  'mobile.beautyAcademy.card.saudiHeritage.tip1': {
    ar: 'نبات طبيعي — يبرد البشرة ويزينها',
    en: 'A natural plant — cools and adorns the skin',
  },
  'mobile.beautyAcademy.card.saudiHeritage.tip2': {
    ar: 'نقوش سعودية تقليدية — فن عمره قرون',
    en: 'Traditional Saudi patterns — an art centuries old',
  },
  'mobile.beautyAcademy.card.saudiHeritage.tip3': {
    ar: 'مناسبة: الأعراس والأعياد',
    en: 'Occasions: weddings and holidays',
  },
  'mobile.beautyAcademy.card.saudiHeritage.tip4': {
    ar: 'فوائد: تقوية الشعر وتبريد الجسم',
    en: 'Benefits: strengthens hair and cools the body',
  },
  'mobile.beautyAcademy.card.careCertificate.title': {
    ar: 'شهادة العناية',
    en: 'Skincare Certificate',
  },
  'mobile.beautyAcademy.card.careCertificate.subtitle': {
    ar: 'مسار العناية بالبشرة',
    en: 'Skincare Track',
  },
  'mobile.beautyAcademy.card.careCertificate.tip1': {
    ar: '8 وحدات دراسية — من أساسيات إلى متقدم',
    en: '8 study modules — from basics to advanced',
  },
  'mobile.beautyAcademy.card.careCertificate.tip2': {
    ar: 'مكتمل: 3 من 8 — تقدم 38%',
    en: 'Completed: 3 of 8 — 38% progress',
  },
  'mobile.beautyAcademy.card.careCertificate.tip3': {
    ar: 'الوحدة القادمة: التقشير الكيميائي',
    en: 'Next module: chemical peeling',
  },
  'mobile.beautyAcademy.card.careCertificate.tip4': {
    ar: 'شهادة معتمدة عند إكمال المسار',
    en: 'An accredited certificate upon completing the track',
  },

  // ---- beauty-community cards (sweep s5) ----
  // card.riyadhSquad.title reuses community.squadName; card.savingsChallenge.title
  // reuses community.challenge.name (verbatim ar match).
  'mobile.beautyCommunity.card.riyadhSquad.subtitle': {
    ar: '4 عضوات — اللقاء القادم 15 أغسطس',
    en: '4 members — next meetup August 15',
  },
  'mobile.beautyCommunity.card.riyadhSquad.tip1': {
    ar: 'مانيكير جماعي — 15 أغسطس',
    en: 'Group manicure — August 15',
  },
  'mobile.beautyCommunity.card.riyadhSquad.tip2': {
    ar: '4 عضوات — نورة، مها، ريم، سارة',
    en: '4 members — Noura, Maha, Reem, Sara',
  },
  'mobile.beautyCommunity.card.riyadhSquad.tip3': {
    ar: 'خصم المجموعة — 15%',
    en: 'Group discount — 15%',
  },
  'mobile.beautyCommunity.card.riyadhSquad.tip4': {
    ar: 'الهدف: لقاء شهري',
    en: 'Goal: a monthly meetup',
  },
  'mobile.beautyCommunity.card.distinguishedGraduate.title': {
    ar: 'خريجة متميزة',
    en: 'Distinguished Graduate',
  },
  'mobile.beautyCommunity.card.distinguishedGraduate.subtitle': {
    ar: 'نورة — دفعة 2025',
    en: 'Noura — Class of 2025',
  },
  'mobile.beautyCommunity.card.distinguishedGraduate.tip1': {
    ar: 'التخصص: مكياج احترافي — 2025',
    en: 'Specialty: professional makeup — 2025',
  },
  'mobile.beautyCommunity.card.distinguishedGraduate.tip2': {
    ar: 'المنصب: مديرة صالون',
    en: 'Role: salon manager',
  },
  'mobile.beautyCommunity.card.distinguishedGraduate.tip3': {
    ar: 'قصتها: من خبيرة لمالكة في سنة',
    en: 'Her story: from expert to owner in a year',
  },
  'mobile.beautyCommunity.card.distinguishedGraduate.tip4': {
    ar: 'نصيحتها: ثقي بنفسكِ وابدئي صغيراً',
    en: 'Her advice: believe in yourself and start small',
  },
  'mobile.beautyCommunity.card.scholarship.title': {
    ar: 'منحة دراسية',
    en: 'Scholarship',
  },
  'mobile.beautyCommunity.card.scholarship.subtitle': {
    ar: 'دورة مكياج احترافي — 3000 ر.س',
    en: 'Professional makeup course — 3,000 SAR',
  },
  'mobile.beautyCommunity.card.scholarship.tip1': {
    ar: 'قيمة المنحة: 3000 ر.س',
    en: 'Scholarship value: 3,000 SAR',
  },
  'mobile.beautyCommunity.card.scholarship.tip2': {
    ar: 'المقاعد: 50 — آخر موعد 30 سبتمبر',
    en: 'Seats: 50 — deadline September 30',
  },
  'mobile.beautyCommunity.card.scholarship.tip3': {
    ar: 'الشروط: شغف بالتجميل + احتياج مالي',
    en: 'Requirements: a passion for beauty + financial need',
  },
  'mobile.beautyCommunity.card.scholarship.tip4': {
    ar: 'قدمي الآن — الفرصة محدودة',
    en: 'Apply now — limited opportunity',
  },
  'mobile.beautyCommunity.card.discountVoucher.title': {
    ar: 'قسيمة خصم',
    en: 'Discount Voucher',
  },
  'mobile.beautyCommunity.card.discountVoucher.subtitle': {
    ar: 'BEAUTY20 — خصم 20%',
    en: 'BEAUTY20 — 20% off',
  },
  'mobile.beautyCommunity.card.discountVoucher.tip1': {
    ar: 'الكود: BEAUTY20 — خصم 20%',
    en: 'Code: BEAUTY20 — 20% off',
  },
  'mobile.beautyCommunity.card.discountVoucher.tip2': {
    ar: 'الحد الأدنى: 150 ر.س',
    en: 'Minimum: 150 SAR',
  },
  'mobile.beautyCommunity.card.discountVoucher.tip3': {
    ar: 'صالح حتى: 31 ديسمبر 2026',
    en: 'Valid until: December 31, 2026',
  },
  'mobile.beautyCommunity.card.discountVoucher.tip4': {
    ar: 'مرة واحدة لكل عميلة',
    en: 'Once per customer',
  },
  'mobile.beautyCommunity.card.savingsChallenge.subtitle': {
    ar: '3200/5000 ر.س — 28 مشتركة',
    en: '3,200/5,000 SAR — 28 participants',
  },
  'mobile.beautyCommunity.card.savingsChallenge.tip1': {
    ar: 'الهدف: 5000 ر.س — وفرّي 3200',
    en: 'Goal: 5,000 SAR — save 3,200',
  },
  'mobile.beautyCommunity.card.savingsChallenge.tip2': {
    ar: '28 مشتركة — شجعي غيركِ',
    en: '28 participants — encourage others',
  },
  'mobile.beautyCommunity.card.savingsChallenge.tip3': {
    ar: '64% مكتمل — باقي 1800 ر.س',
    en: '64% complete — 1,800 SAR to go',
  },
  'mobile.beautyCommunity.card.savingsChallenge.tip4': {
    ar: 'الجائزة: قسيمة 500 ر.س للفائزة',
    en: 'Prize: a 500 SAR voucher for the winner',
  },
  'mobile.beautyCommunity.card.mentorRequest.title': {
    ar: 'اطلبي مرشداً',
    en: 'Request a Mentor',
  },
  'mobile.beautyCommunity.card.mentorRequest.subtitle': {
    ar: 'تعلمي من الخبيرات',
    en: 'Learn from the experts',
  },
  'mobile.beautyCommunity.card.mentorRequest.tip1': {
    ar: 'اهتماماتكِ: مكياج — إدارة الصالونات',
    en: 'Your interests: makeup — salon management',
  },
  'mobile.beautyCommunity.card.mentorRequest.tip2': {
    ar: 'مرشدة محتملة: م. سارة',
    en: 'Potential mentor: Sarah M.',
  },
  'mobile.beautyCommunity.card.mentorRequest.tip3': {
    ar: 'جلسة أسبوعية — ساعة واحدة',
    en: 'A weekly session — one hour',
  },
  'mobile.beautyCommunity.card.mentorRequest.tip4': {
    ar: 'المدة: 3 أشهر — خطة تطوير شخصية',
    en: 'Duration: 3 months — a personal development plan',
  },
  'mobile.beautyCommunity.card.beautyDictionary.title': {
    ar: 'قاموس الجمال',
    en: 'Beauty Dictionary',
  },
  'mobile.beautyCommunity.card.beautyDictionary.subtitle': {
    ar: 'تعلمي مصطلحات التجميل',
    en: 'Learn beauty terminology',
  },
  'mobile.beautyCommunity.card.beautyDictionary.tip1': {
    ar: 'عربي → English — مصطلحات التجميل',
    en: 'Arabic → English — beauty terminology',
  },
  'mobile.beautyCommunity.card.beautyDictionary.tip2': {
    ar: 'كونتور — Contour',
    en: 'Contour — Contour',
  },
  'mobile.beautyCommunity.card.beautyDictionary.tip3': {
    ar: 'هايلايتر — Highlighter',
    en: 'Highlighter — Highlighter',
  },
  'mobile.beautyCommunity.card.beautyDictionary.tip4': {
    ar: 'كلمة جديدة كل يوم',
    en: 'A new word every day',
  },
  'mobile.beautyCommunity.card.progressPhotos.title': {
    ar: 'صور التقدم',
    en: 'Progress Photos',
  },
  'mobile.beautyCommunity.card.progressPhotos.subtitle': {
    ar: '3 صور — منذ 1 يونيو 2026',
    en: '3 photos — since June 1, 2026',
  },
  'mobile.beautyCommunity.card.progressPhotos.tip1': {
    ar: '3 صور — وثقي رحلتكِ',
    en: '3 photos — document your journey',
  },
  'mobile.beautyCommunity.card.progressPhotos.tip2': {
    ar: 'بداية التوثيق: 1 يونيو 2026',
    en: 'Tracking started: June 1, 2026',
  },
  'mobile.beautyCommunity.card.progressPhotos.tip3': {
    ar: 'لاحظي الفرق — بشرة أكثر إشراقاً',
    en: 'Notice the difference — brighter skin',
  },
  'mobile.beautyCommunity.card.progressPhotos.tip4': {
    ar: 'خاص — لكِ فقط',
    en: 'Private — for you only',
  },
  'mobile.beautyCommunity.card.privacyShield.title': {
    ar: 'درع الخصوصية',
    en: 'Privacy Shield',
  },
  'mobile.beautyCommunity.card.privacyShield.subtitle': {
    ar: 'تحكمي في معلوماتكِ',
    en: 'Control your information',
  },
  'mobile.beautyCommunity.card.privacyShield.tip1': {
    ar: 'اختاري من يرى صورتكِ',
    en: 'Choose who sees your photo',
  },
  'mobile.beautyCommunity.card.privacyShield.tip2': {
    ar: 'تاريخكِ — لكِ وحدكِ',
    en: 'Your history — yours alone',
  },
  'mobile.beautyCommunity.card.privacyShield.tip3': {
    ar: 'مشفرة — أعلى معايير الأمان',
    en: 'Encrypted — the highest security standards',
  },
  'mobile.beautyCommunity.card.privacyShield.tip4': {
    ar: 'موافقة — قبل أي مشاركة',
    en: 'Consent — before any sharing',
  },

  // ---- beauty-discovery (sweep s5) ----
  'mobile.beautyDiscovery.separator': { ar: '،', en: ',' },

  // ---- beauty-extras cards (sweep s5) ----
  // card.beautyVlog.subtitle reuses beautyExtras.dayInNouraLife (verbatim ar match).
  'mobile.beautyExtras.card.timeCapsule.title': { ar: 'كبسولة الزمن', en: 'Time Capsule' },
  'mobile.beautyExtras.card.timeCapsule.subtitle': {
    ar: 'رسالة لنفسكِ المستقبلية',
    en: 'A message to your future self',
  },
  'mobile.beautyExtras.card.timeCapsule.tip1': {
    ar: 'تاريخ الحفظ: 6 أغسطس 2026',
    en: 'Saved on: August 6, 2026',
  },
  'mobile.beautyExtras.card.timeCapsule.tip2': {
    ar: 'تفتح في: 6 أغسطس 2027',
    en: 'Opens on: August 6, 2027',
  },
  'mobile.beautyExtras.card.timeCapsule.tip3': {
    ar: 'رسالة: أهداف جمالكِ للعام القادم',
    en: 'Message: your beauty goals for next year',
  },
  'mobile.beautyExtras.card.timeCapsule.tip4': {
    ar: 'مرفق: صورة بشرتكِ الآن',
    en: 'Attached: a photo of your skin now',
  },
  'mobile.beautyExtras.card.dreamBoard.title': { ar: 'لوحة الأحلام', en: 'Dream Board' },
  'mobile.beautyExtras.card.dreamBoard.subtitle': {
    ar: 'أحلامكِ على لوحة واحدة',
    en: 'Your dreams on one board',
  },
  'mobile.beautyExtras.card.dreamBoard.tip1': {
    ar: 'شعر طويل صحي — هدفي للعام القادم',
    en: 'Healthy long hair — my goal for next year',
  },
  'mobile.beautyExtras.card.dreamBoard.tip2': {
    ar: 'إطلالة زفاف مثالية — حلم العمر',
    en: 'A perfect bridal look — the dream of a lifetime',
  },
  'mobile.beautyExtras.card.dreamBoard.tip3': {
    ar: 'إتقان المكياج — دورة احترافية',
    en: 'Makeup mastery — a professional course',
  },
  'mobile.beautyExtras.card.dreamBoard.tip4': {
    ar: 'روتين عناية يومي — التزام',
    en: 'A daily care routine — commitment',
  },
  'mobile.beautyExtras.card.secretSanta.title': { ar: 'سكرت سانتا', en: 'Secret Santa' },
  'mobile.beautyExtras.card.secretSanta.subtitle': {
    ar: 'تبادل هدايا — عرايس الرياض',
    en: 'Gift exchange — Riyadh Brides',
  },
  'mobile.beautyExtras.card.secretSanta.tip1': {
    ar: 'المجموعة: عرايس الرياض — 12 مشتركة',
    en: 'Group: Riyadh Brides — 12 participants',
  },
  'mobile.beautyExtras.card.secretSanta.tip2': {
    ar: 'الميزانية: 200 ر.س للهدية',
    en: 'Budget: 200 SAR per gift',
  },
  'mobile.beautyExtras.card.secretSanta.tip3': {
    ar: 'القرعة: 15 ديسمبر — تبادل الهدايا',
    en: 'Draw: December 15 — gift exchange',
  },
  'mobile.beautyExtras.card.secretSanta.tip4': {
    ar: 'حفل التبادل: 25 ديسمبر',
    en: 'Exchange party: December 25',
  },
  'mobile.beautyExtras.card.accountabilityPartner.title': {
    ar: 'شريك المساءلة',
    en: 'Accountability Partner',
  },
  'mobile.beautyExtras.card.accountabilityPartner.subtitle': {
    ar: 'نورة — 12 يوم تواصل',
    en: 'Noura — 12 days of check-ins',
  },
  'mobile.beautyExtras.card.accountabilityPartner.tip1': {
    ar: 'الشريك: نورة — روتين عناية يومي',
    en: 'Partner: Noura — a daily care routine',
  },
  'mobile.beautyExtras.card.accountabilityPartner.tip2': {
    ar: '12 يوم متواصل — الهدف 30 يوم',
    en: '12 days in a row — goal is 30 days',
  },
  'mobile.beautyExtras.card.accountabilityPartner.tip3': {
    ar: 'تذكير يومي — الساعة 9 مساءً',
    en: 'A daily reminder — at 9 PM',
  },
  'mobile.beautyExtras.card.accountabilityPartner.tip4': {
    ar: 'المكافأة: خصم 10% عند 30 يوم',
    en: 'Reward: 10% off at 30 days',
  },
  'mobile.beautyExtras.card.gratitudeCircle.title': {
    ar: 'دائرة الامتنان',
    en: 'Gratitude Circle',
  },
  'mobile.beautyExtras.card.gratitudeCircle.subtitle': {
    ar: 'شكراً لكِ — كلمات طيبة',
    en: 'Thank you — kind words',
  },
  'mobile.beautyExtras.card.gratitudeCircle.tip1': {
    ar: 'نورة → مها: شكراً لنصيحة البشرة!',
    en: 'Noura → Maha: thanks for the skincare tip!',
  },
  'mobile.beautyExtras.card.gratitudeCircle.tip2': {
    ar: 'مها → ريم: أنتِ ملهمة دائماً',
    en: 'Maha → Reem: you are always inspiring',
  },
  'mobile.beautyExtras.card.gratitudeCircle.tip3': {
    ar: 'ريم → سارة: شكراً لدعمكِ المتواصل',
    en: 'Reem → Sara: thanks for your constant support',
  },
  'mobile.beautyExtras.card.gratitudeCircle.tip4': {
    ar: 'أرسلي كلمة شكر — تضيء يوم أحد',
    en: 'Send a thank-you — it brightens someone’s day',
  },
  'mobile.beautyExtras.card.affirmations.title': {
    ar: 'توكيدات إيجابية',
    en: 'Positive Affirmations',
  },
  'mobile.beautyExtras.card.affirmations.subtitle': {
    ar: 'أنا جميلة — أنا قوية',
    en: 'I am beautiful — I am strong',
  },
  'mobile.beautyExtras.card.affirmations.tip1': {
    ar: 'أنا أستحق العناية بنفسي كل يوم',
    en: 'I deserve to take care of myself every day',
  },
  'mobile.beautyExtras.card.affirmations.tip2': {
    ar: 'جمالي ينبع من ثقتي بنفسي',
    en: 'My beauty comes from my self-confidence',
  },
  'mobile.beautyExtras.card.affirmations.tip3': {
    ar: 'كل يوم أكون فيه أفضل من الأمس',
    en: 'Every day I am better than yesterday',
  },
  'mobile.beautyExtras.card.affirmations.tip4': {
    ar: 'أحب نفسي كما أنا — وهذه قوتي',
    en: 'I love myself as I am — and that is my strength',
  },
  'mobile.beautyExtras.card.gratitudeJournal.title': {
    ar: 'يوميات الامتنان',
    en: 'Gratitude Journal',
  },
  'mobile.beautyExtras.card.gratitudeJournal.subtitle': {
    ar: '15 تدوينة — استمري',
    en: '15 entries — keep going',
  },
  'mobile.beautyExtras.card.gratitudeJournal.tip1': {
    ar: '15 تدوينة — 15 يوماً من الشكر',
    en: '15 entries — 15 days of gratitude',
  },
  'mobile.beautyExtras.card.gratitudeJournal.tip2': {
    ar: '5 أيام متواصلة',
    en: '5 days in a row',
  },
  'mobile.beautyExtras.card.gratitudeJournal.tip3': {
    ar: 'آخر تدوينة: بشرة مشرقة اليوم',
    en: 'Latest entry: bright skin today',
  },
  'mobile.beautyExtras.card.gratitudeJournal.tip4': {
    ar: 'الهدف: 30 يوم امتنان',
    en: 'Goal: 30 days of gratitude',
  },
  'mobile.beautyExtras.card.beautyVlog.title': { ar: 'فلوق الجمال', en: 'Beauty Vlog' },
  'mobile.beautyExtras.card.beautyVlog.tip1': {
    ar: 'الفئة: مكياج — 8 دقائق',
    en: 'Category: makeup — 8 minutes',
  },
  'mobile.beautyExtras.card.beautyVlog.tip2': {
    ar: 'تقديم: نورة — خبيرة تجميل',
    en: 'Presented by: Noura — beauty expert',
  },
  'mobile.beautyExtras.card.beautyVlog.tip3': { ar: '1,234 مشاهدة', en: '1,234 views' },
  'mobile.beautyExtras.card.beautyVlog.tip4': {
    ar: 'شاهدي الفلوق — تعلمي روتين جديد',
    en: 'Watch the vlog — learn a new routine',
  },

  // ---- beauty-goals (sweep s5) ----
  // goal.glowingSkin reuses beautyDiary.glow-skin (verbatim ar match).
  'mobile.beautyGoals.goal.hairCare': { ar: 'عناية بالشعر', en: 'Hair Care' },
  'mobile.beautyGoals.goal.selfCare': { ar: 'عناية ذاتية', en: 'Self-Care' },
  'mobile.beautyGoals.goal.nails': { ar: 'أظافر مثالية', en: 'Perfect Nails' },

  // ---- beauty-innovation (sweep s6) ----
  // card vlog reuses mobile.beautyExtras.card.beautyVlog.* + beautyInnovation.vlogTitle
  // (verbatim ar matches).
  'mobile.beautyInnovation.card.voiceAssistant.title': { ar: 'مساعد صوتي', en: 'Voice Assistant' },
  'mobile.beautyInnovation.card.voiceAssistant.subtitle': {
    ar: 'اسألي مجرة الجمال — مستشارة جمالك',
    en: 'Ask Galaxy of Beauty — your beauty advisor',
  },
  'mobile.beautyInnovation.card.voiceAssistant.tip1': {
    ar: 'قوائم: اسألي عن روتين، منتج، أو نصيحة',
    en: 'Lists: ask about a routine, a product, or a tip',
  },
  'mobile.beautyInnovation.card.voiceAssistant.tip2': {
    ar: 'تشغيل صوتي — بدون لمس الشاشة',
    en: 'Voice playback — without touching the screen',
  },
  'mobile.beautyInnovation.card.voiceAssistant.tip3': {
    ar: 'بالعربية — تفهم لهجتكِ',
    en: 'In Arabic — understands your dialect',
  },
  'mobile.beautyInnovation.card.voiceAssistant.tip4': {
    ar: 'خصوصية تامة — محادثاتكِ آمنة',
    en: 'Complete privacy — your conversations are safe',
  },
  'mobile.beautyInnovation.card.playlist.title': { ar: 'قائمة تشغيل', en: 'Playlist' },
  'mobile.beautyInnovation.card.playlist.subtitle': {
    ar: 'موسيقى لجلسة عنايتك',
    en: 'Music for your self-care session',
  },
  'mobile.beautyInnovation.card.playlist.tip1': {
    ar: 'موسيقى هادئة — لجلسة المساج',
    en: 'Calm music — for your massage session',
  },
  'mobile.beautyInnovation.card.playlist.tip2': {
    ar: 'أصوات طبيعة — للاسترخاء',
    en: 'Nature sounds — to relax',
  },
  'mobile.beautyInnovation.card.playlist.tip3': {
    ar: 'قوائم جاهزة — حسب المزاج',
    en: 'Ready-made lists — by mood',
  },
  'mobile.beautyInnovation.card.playlist.tip4': {
    ar: 'تحديث أسبوعي — قوائم جديدة',
    en: 'Weekly update — new lists',
  },
  'mobile.beautyInnovation.card.beautyWeather.title': { ar: 'طقس الجمال', en: 'Beauty Weather' },
  'mobile.beautyInnovation.card.beautyWeather.subtitle': {
    ar: 'حار — 42 درجة مئوية',
    en: 'Hot — 42°C',
  },
  'mobile.beautyInnovation.card.beautyWeather.tip1': {
    ar: 'نصيحة: واقي شمس SPF 50+ اليوم',
    en: 'Tip: SPF 50+ sunscreen today',
  },
  'mobile.beautyInnovation.card.beautyWeather.tip2': {
    ar: 'مرطب جل خفيف — مناسب للحر',
    en: 'Light gel moisturizer — suits the heat',
  },
  'mobile.beautyInnovation.card.beautyWeather.tip3': {
    ar: 'مكياج مقاوم للماء — ضروري',
    en: 'Waterproof makeup — essential',
  },
  'mobile.beautyInnovation.card.beautyWeather.tip4': {
    ar: 'سبراي مرطب — للانتعاش',
    en: 'Refreshing mist — for a fresh feel',
  },
  'mobile.beautyInnovation.card.nightOut.title': { ar: 'ليلة في الخارج', en: 'A Night Out' },
  'mobile.beautyInnovation.card.nightOut.subtitle': {
    ar: 'متاح — احجزي الآن',
    en: 'Available — book now',
  },
  'mobile.beautyInnovation.card.nightOut.tip1': {
    ar: 'باقة ليلية — مكياج + شعر',
    en: 'Night package — makeup + hair',
  },
  'mobile.beautyInnovation.card.nightOut.tip2': {
    ar: 'متاح اليوم — قبل 8 مساءً',
    en: 'Available today — before 8 PM',
  },
  'mobile.beautyInnovation.card.nightOut.tip3': {
    ar: 'أظافر سريعة — 30 دقيقة',
    en: 'Quick nails — 30 minutes',
  },
  'mobile.beautyInnovation.card.nightOut.tip4': {
    ar: 'مناسبة خاصة — خدمة VIP',
    en: 'Special occasion — VIP service',
  },
  'mobile.beautyInnovation.card.concierge.title': {
    ar: 'خدمة الكونسيرج',
    en: 'Concierge Service',
  },
  'mobile.beautyInnovation.card.concierge.subtitle': {
    ar: 'مساعدكِ الشخصي للجمال',
    en: 'Your personal beauty assistant',
  },
  'mobile.beautyInnovation.card.concierge.tip1': {
    ar: 'حجز مواعيد — أي صالون',
    en: 'Book appointments — any salon',
  },
  'mobile.beautyInnovation.card.concierge.tip2': {
    ar: 'شراء هدايا — توصيل للمنزل',
    en: 'Buy gifts — home delivery',
  },
  'mobile.beautyInnovation.card.concierge.tip3': {
    ar: 'استشارة — توصيات مخصصة',
    en: 'Consultation — personalized recommendations',
  },
  'mobile.beautyInnovation.card.concierge.tip4': {
    ar: 'خدمة 24/7 — دائماً متاحة',
    en: '24/7 service — always available',
  },
  'mobile.beautyInnovation.card.randomKindness.title': {
    ar: 'عمل طيب عشوائي',
    en: 'Random Act of Kindness',
  },
  'mobile.beautyInnovation.card.randomKindness.subtitle': {
    ar: 'فاجئي شخصاً تحبينه',
    en: 'Surprise someone you love',
  },
  'mobile.beautyInnovation.card.randomKindness.tip1': {
    ar: 'أرسلي باقة ورود — بدون مناسبة',
    en: 'Send a bouquet — no occasion needed',
  },
  'mobile.beautyInnovation.card.randomKindness.tip2': {
    ar: 'بطاقة شكر — بخط اليد',
    en: 'Thank-you card — handwritten',
  },
  'mobile.beautyInnovation.card.randomKindness.tip3': {
    ar: 'هدية صغيرة — لمن تحبين',
    en: 'A small gift — for someone you love',
  },
  'mobile.beautyInnovation.card.randomKindness.tip4': {
    ar: 'أفعلي خيراً — الجمال في العطاء',
    en: 'Do good — beauty lies in giving',
  },

  // ---- beauty-lifestyle (sweep s6) ----
  // card.priceAlerts.title reuses mobile.priceDropAlerts.title (verbatim ar match).
  // card.budgetPlanner.title reuses beautyBudgetPlanner.title (verbatim ar match).
  'mobile.beautyLifestyle.card.rewards.title': { ar: 'مكافآت الجمال', en: 'Beauty Rewards' },
  'mobile.beautyLifestyle.card.rewards.subtitle': {
    ar: '1250 نقطة — المستوى الذهبي',
    en: '1,250 points — Gold tier',
  },
  'mobile.beautyLifestyle.card.rewards.tip1': {
    ar: '1250 نقطة — قابلة للاستبدال',
    en: '1,250 points — redeemable',
  },
  'mobile.beautyLifestyle.card.rewards.tip2': {
    ar: 'المستوى: ذهبي — خصم 15%',
    en: 'Tier: Gold — 15% off',
  },
  'mobile.beautyLifestyle.card.rewards.tip3': {
    ar: 'الهدية القادمة: قناع وجه مجاني',
    en: 'Next gift: a free face mask',
  },
  'mobile.beautyLifestyle.card.rewards.tip4': {
    ar: 'تنتهي النقاط بعد 12 شهراً',
    en: 'Points expire after 12 months',
  },
  'mobile.beautyLifestyle.card.premiumSubscription.title': {
    ar: 'الاشتراك المميز',
    en: 'Premium Subscription',
  },
  'mobile.beautyLifestyle.card.premiumSubscription.subtitle': {
    ar: 'باقة Premium الشهرية',
    en: 'Monthly Premium plan',
  },
  'mobile.beautyLifestyle.card.premiumSubscription.tip1': {
    ar: 'خصم 20% على جميع الخدمات',
    en: '20% off all services',
  },
  'mobile.beautyLifestyle.card.premiumSubscription.tip2': {
    ar: 'حجز أولوية — قبل 48 ساعة',
    en: 'Priority booking — 48 hours ahead',
  },
  'mobile.beautyLifestyle.card.premiumSubscription.tip3': {
    ar: 'هدية شهرية — منتج تجميل',
    en: 'Monthly gift — a beauty product',
  },
  'mobile.beautyLifestyle.card.premiumSubscription.tip4': {
    ar: 'نقاط مضاعفة — x2 على كل ريال',
    en: 'Double points — x2 on every riyal',
  },
  'mobile.beautyLifestyle.card.priceAlerts.subtitle': {
    ar: 'انخفاض في الأسعار',
    en: 'Prices are dropping',
  },
  'mobile.beautyLifestyle.card.priceAlerts.tip1': {
    ar: 'مانيكير سبا — من 150 إلى 99 ر.س',
    en: 'Spa manicure — from 150 to 99 SAR',
  },
  'mobile.beautyLifestyle.card.priceAlerts.tip2': {
    ar: 'مكياج كامل — من 350 إلى 299 ر.س',
    en: 'Full makeup — from 350 to 299 SAR',
  },
  'mobile.beautyLifestyle.card.priceAlerts.tip3': {
    ar: 'فعّلي التنبيهات — لتلقي العروض',
    en: 'Turn on alerts — to receive the offers',
  },
  'mobile.beautyLifestyle.card.priceAlerts.tip4': {
    ar: 'العروض تنتهي خلال 48 ساعة',
    en: 'Offers end within 48 hours',
  },
  'mobile.beautyLifestyle.card.savingsMilestones.title': {
    ar: 'محطات الادخار',
    en: 'Savings Milestones',
  },
  'mobile.beautyLifestyle.card.savingsMilestones.subtitle': {
    ar: '1500 ر.س مدخرة',
    en: '1,500 SAR saved',
  },
  'mobile.beautyLifestyle.card.savingsMilestones.tip1': {
    ar: '500 ر.س — تم التحقيق',
    en: '500 SAR — achieved',
  },
  'mobile.beautyLifestyle.card.savingsMilestones.tip2': {
    ar: '1000 ر.س — تم التحقيق',
    en: '1,000 SAR — achieved',
  },
  'mobile.beautyLifestyle.card.savingsMilestones.tip3': {
    ar: '2000 ر.س — الهدف القادم',
    en: '2,000 SAR — next goal',
  },
  'mobile.beautyLifestyle.card.savingsMilestones.tip4': {
    ar: '5000 ر.س — الهدف النهائي',
    en: '5,000 SAR — final goal',
  },
  'mobile.beautyLifestyle.card.budgetPlanner.subtitle': {
    ar: 'تتبعي إنفاقك على الجمال',
    en: 'Track your beauty spending',
  },
  'mobile.beautyLifestyle.card.budgetPlanner.tip1': {
    ar: 'الميزانية الشهرية: 500 ر.س',
    en: 'Monthly budget: 500 SAR',
  },
  'mobile.beautyLifestyle.card.budgetPlanner.tip2': {
    ar: 'المصروف هذا الشهر: 320 ر.س',
    en: 'Spent this month: 320 SAR',
  },
  'mobile.beautyLifestyle.card.budgetPlanner.tip3': {
    ar: 'المتبقي: 180 ر.س',
    en: 'Remaining: 180 SAR',
  },
  'mobile.beautyLifestyle.card.budgetPlanner.tip4': {
    ar: 'نصيحة: وفرّي 20% للطوارئ',
    en: 'Tip: save 20% for emergencies',
  },
  'mobile.beautyLifestyle.card.beautyVoucher.title': { ar: 'قسيمة الجمال', en: 'Beauty Voucher' },
  'mobile.beautyLifestyle.card.beautyVoucher.subtitle': {
    ar: 'خصم 50 ر.س على خدمتك القادمة',
    en: '50 SAR off your next service',
  },
  'mobile.beautyLifestyle.card.beautyVoucher.tip1': {
    ar: 'الكود: BEAUTY50 — صالح لمرة واحدة',
    en: 'Code: BEAUTY50 — valid once',
  },
  'mobile.beautyLifestyle.card.beautyVoucher.tip2': {
    ar: 'ينتهي: 30 سبتمبر 2026',
    en: 'Expires: September 30, 2026',
  },
  'mobile.beautyLifestyle.card.beautyVoucher.tip3': {
    ar: 'لجميع الخدمات فوق 200 ر.س',
    en: 'For all services above 200 SAR',
  },
  'mobile.beautyLifestyle.card.beautyVoucher.tip4': {
    ar: 'لا يدمج مع عروض أخرى',
    en: 'Cannot be combined with other offers',
  },

  // ---- beauty-mentor (sweep s6) ----
  // week3.title reuses scanner.ingredients (verbatim ar match).
  'mobile.beautyMentor.week1.label': { ar: 'الأسبوع 1', en: 'Week 1' },
  'mobile.beautyMentor.week1.title': { ar: 'أساسيات العناية', en: 'Skincare Basics' },
  'mobile.beautyMentor.week1.desc': {
    ar: 'تعرفي على نوع بشرتكِ والمنتجات المناسبة',
    en: 'Learn your skin type and the right products',
  },
  'mobile.beautyMentor.week2.label': { ar: 'الأسبوع 2', en: 'Week 2' },
  'mobile.beautyMentor.week2.title': { ar: 'روتين يومي', en: 'Daily Routine' },
  'mobile.beautyMentor.week2.desc': {
    ar: 'ابنِي روتين صباحي ومسائي متكامل',
    en: 'Build a complete morning and evening routine',
  },
  'mobile.beautyMentor.week3.label': { ar: 'الأسبوع 3', en: 'Week 3' },
  'mobile.beautyMentor.week3.desc': {
    ar: 'تعلمي قراءة مكونات المنتجات',
    en: 'Learn to read product ingredients',
  },
  'mobile.beautyMentor.week4.label': { ar: 'الأسبوع 4', en: 'Week 4' },
  'mobile.beautyMentor.week4.title': { ar: 'تطبيق عملي', en: 'Hands-On Practice' },
  'mobile.beautyMentor.week4.desc': {
    ar: 'جلسة تطبيقية مع مرشدة خبيرة',
    en: 'A practical session with an expert mentor',
  },

  // ---- beauty-profile (sweep s6) ----
  'mobile.beautyProfile.listSeparator': { ar: '،', en: ',' },

  // ---- beauty-reminders/rescue/rewards/services/tips (sweep s7) ----
  // beauty-rescue
  'mobile.beautyRescue.sos.acne.title': { ar: 'طوارئ الحبوب', en: 'Acne SOS' },
  'mobile.beautyRescue.sos.acne.subtitle': {
    ar: 'ظهور مفاجئ — حل سريع',
    en: 'Sudden breakout — a quick fix',
  },
  'mobile.beautyRescue.sos.acne.tip1': {
    ar: 'كمادة ثلج — 5 دقائق لتقليل الالتهاب',
    en: 'Ice compress — 5 minutes to reduce inflammation',
  },
  'mobile.beautyRescue.sos.acne.tip2': {
    ar: 'لصقة حبوب — تجفف وتحمي من العبث',
    en: 'Pimple patch — dries it out and keeps you from picking',
  },
  'mobile.beautyRescue.sos.acne.tip3': {
    ar: 'لا تضغطي — يزيد الالتهاب ويترك أثراً',
    en: 'Do not squeeze — it worsens inflammation and leaves a mark',
  },
  'mobile.beautyRescue.sos.acne.tip4': {
    ar: 'كريم بنزويل بيروكسايد — للطوارئ',
    en: 'Benzoyl peroxide cream — for emergencies',
  },
  'mobile.beautyRescue.sos.sunburn.title': { ar: 'علاج حروق الشمس', en: 'Sunburn treatment' },
  'mobile.beautyRescue.sos.sunburn.subtitle': {
    ar: 'إسعاف سريع للبشرة المحروقة',
    en: 'Fast first aid for burned skin',
  },
  'mobile.beautyRescue.sos.sunburn.tip1': {
    ar: 'كمادات باردة — 15 دقيقة كل ساعة',
    en: 'Cold compresses — 15 minutes every hour',
  },
  'mobile.beautyRescue.sos.sunburn.tip2': {
    ar: 'جل الألوفيرا — مبرد في الثلاجة',
    en: 'Aloe vera gel — chilled in the fridge',
  },
  'mobile.beautyRescue.sos.sunburn.tip3': {
    ar: 'اشربي ماء كثيراً — الترطيب من الداخل',
    en: 'Drink plenty of water — hydration from within',
  },
  'mobile.beautyRescue.sos.sunburn.tip4': {
    ar: 'لا تقشري — الجلد يتجدد طبيعياً',
    en: 'Do not peel — skin renews itself naturally',
  },
  'mobile.beautyRescue.sos.puffyEyes.title': { ar: 'انتفاخ العيون', en: 'Puffy eyes' },
  'mobile.beautyRescue.sos.puffyEyes.subtitle': {
    ar: 'صباح منتفخ — حل سريع',
    en: 'Puffy morning — a quick fix',
  },
  'mobile.beautyRescue.sos.puffyEyes.tip1': {
    ar: 'ملعقتان باردتان — على الجفون 5 دقائق',
    en: 'Two cold spoons — on the eyelids for 5 minutes',
  },
  'mobile.beautyRescue.sos.puffyEyes.tip2': {
    ar: 'أكياس شاي أخضر — كافيين يقلص الانتفاخ',
    en: 'Green tea bags — caffeine reduces puffiness',
  },
  'mobile.beautyRescue.sos.puffyEyes.tip3': {
    ar: 'وسادة مرتفعة — تقلل تجمع السوائل',
    en: 'A raised pillow — reduces fluid buildup',
  },
  'mobile.beautyRescue.sos.puffyEyes.tip4': {
    ar: 'كريم عيون بكافيين — نتائج فورية',
    en: 'Caffeine eye cream — instant results',
  },
  'mobile.beautyRescue.sos.chappedLips.title': { ar: 'تشقق الشفاه', en: 'Chapped lips' },
  'mobile.beautyRescue.sos.chappedLips.subtitle': {
    ar: 'علاج سريع للشفاه الجافة',
    en: 'A quick fix for dry lips',
  },
  'mobile.beautyRescue.sos.chappedLips.tip1': {
    ar: 'مقشر سكر + عسل — مرة أسبوعياً',
    en: 'Sugar + honey scrub — once a week',
  },
  'mobile.beautyRescue.sos.chappedLips.tip2': {
    ar: 'بلسم بفيتامين E — كل ساعتين',
    en: 'Vitamin E balm — every two hours',
  },
  'mobile.beautyRescue.sos.chappedLips.tip3': {
    ar: 'اشربي ماء — الجفاف يبدأ من الداخل',
    en: 'Drink water — dryness starts from within',
  },
  'mobile.beautyRescue.sos.chappedLips.tip4': {
    ar: 'لا تلعقي شفاهكِ — اللعاب يزيد الجفاف',
    en: 'Do not lick your lips — saliva makes dryness worse',
  },
  'mobile.beautyRescue.sos.redness.title': { ar: 'تهدئة الاحمرار', en: 'Calming redness' },
  'mobile.beautyRescue.sos.redness.subtitle': {
    ar: 'بشرة هادئة في دقائق',
    en: 'Calm skin in minutes',
  },
  'mobile.beautyRescue.sos.redness.tip1': {
    ar: 'ماء بارد — يغسل الوجه ويقلص الأوعية',
    en: 'Cold water — rinses the face and constricts blood vessels',
  },
  'mobile.beautyRescue.sos.redness.tip2': {
    ar: 'جل الألوفيرا — مهدئ طبيعي فوري',
    en: 'Aloe vera gel — an instant natural soother',
  },
  'mobile.beautyRescue.sos.redness.tip3': {
    ar: 'أوقفي المنتجات النشطة — يوم راحة',
    en: 'Stop active products — a rest day',
  },
  'mobile.beautyRescue.sos.redness.tip4': {
    ar: 'مرطب بسيط — بدون عطور أو أحماض',
    en: 'A simple moisturizer — no fragrance or acids',
  },
  'mobile.beautyRescue.aftercare.botox.title': { ar: 'بعد البوتوكس', en: 'After Botox' },
  'mobile.beautyRescue.aftercare.botox.subtitle': {
    ar: 'تعليمات ما بعد الحقن',
    en: 'Post-injection instructions',
  },
  'mobile.beautyRescue.aftercare.botox.tip1': {
    ar: 'لا تلمسي — لا تدلكي 24 ساعة',
    en: 'Do not touch — no massaging for 24 hours',
  },
  'mobile.beautyRescue.aftercare.botox.tip2': {
    ar: 'ابقِ رأسك مرفوعاً — 4 ساعات',
    en: 'Keep your head elevated — 4 hours',
  },
  'mobile.beautyRescue.aftercare.botox.tip3': {
    ar: 'لا رياضة — 24 ساعة',
    en: 'No exercise — 24 hours',
  },
  'mobile.beautyRescue.aftercare.botox.tip4': {
    ar: 'النتيجة النهائية — 10-14 يوم',
    en: 'Final result — 10-14 days',
  },
  'mobile.beautyRescue.aftercare.filler.title': { ar: 'بعد الفيلر', en: 'After filler' },
  'mobile.beautyRescue.aftercare.filler.subtitle': {
    ar: 'عناية ما بعد التعبئة',
    en: 'Post-filler care',
  },
  'mobile.beautyRescue.aftercare.filler.tip1': {
    ar: 'كمادات باردة — لتقليل التورم',
    en: 'Cold compresses — to reduce swelling',
  },
  'mobile.beautyRescue.aftercare.filler.tip2': {
    ar: 'تجنبي الضغط — لا تنامي على الوجه',
    en: 'Avoid pressure — do not sleep on your face',
  },
  'mobile.beautyRescue.aftercare.filler.tip3': {
    ar: 'لا مكياج — 24 ساعة',
    en: 'No makeup — 24 hours',
  },
  'mobile.beautyRescue.aftercare.filler.tip4': {
    ar: 'النتيجة النهائية — بعد أسبوعين',
    en: 'Final result — after two weeks',
  },
  'mobile.beautyRescue.aftercare.laser.title': { ar: 'بعد الليزر', en: 'After laser' },
  'mobile.beautyRescue.aftercare.laser.subtitle': {
    ar: 'عناية خاصة بعد جلسة الليزر',
    en: 'Special care after a laser session',
  },
  'mobile.beautyRescue.aftercare.laser.tip1': {
    ar: 'تجنبي الشمس — أسبوع كامل',
    en: 'Avoid the sun — a full week',
  },
  'mobile.beautyRescue.aftercare.laser.tip2': {
    ar: 'SPF 50+ — ضرورة مطلقة',
    en: 'SPF 50+ — an absolute must',
  },
  'mobile.beautyRescue.aftercare.laser.tip3': {
    ar: 'لا تقشري — 5 أيام',
    en: 'Do not exfoliate — 5 days',
  },
  'mobile.beautyRescue.aftercare.laser.tip4': {
    ar: 'مرطب لطيف — ألوفيرا أو بانثينول',
    en: 'A gentle moisturizer — aloe vera or panthenol',
  },
  'mobile.beautyRescue.aftercare.peel.title': { ar: 'بعد التقشير', en: 'After a peel' },
  'mobile.beautyRescue.aftercare.peel.subtitle': {
    ar: 'روتين ما بعد التقشير الكيميائي',
    en: 'Post chemical peel routine',
  },
  'mobile.beautyRescue.aftercare.peel.tip1': {
    ar: 'ترطيب مكثف — كريمات مهدئة',
    en: 'Intensive hydration — soothing creams',
  },
  'mobile.beautyRescue.aftercare.peel.tip2': {
    ar: 'لا تقشري الجلد — اتركيه يسقط',
    en: 'Do not exfoliate the skin — let it flake off',
  },
  'mobile.beautyRescue.aftercare.peel.tip3': {
    ar: 'SPF 50+ — البشرة حساسة جداً',
    en: 'SPF 50+ — the skin is very sensitive',
  },
  'mobile.beautyRescue.aftercare.peel.tip4': {
    ar: 'لا ريتينول — لمدة أسبوع',
    en: 'No retinol — for one week',
  },
  'mobile.beautyRescue.aftercare.hairRemoval.title': {
    ar: 'بعد إزالة الشعر',
    en: 'After hair removal',
  },
  'mobile.beautyRescue.aftercare.hairRemoval.subtitle': {
    ar: 'بشرة ناعمة — بدون التهاب',
    en: 'Smooth skin — without irritation',
  },
  'mobile.beautyRescue.aftercare.hairRemoval.tip1': {
    ar: 'كريم مهدئ — ألوفيرا أو بانثينول',
    en: 'A soothing cream — aloe vera or panthenol',
  },
  'mobile.beautyRescue.aftercare.hairRemoval.tip2': {
    ar: 'لا تعرقي — 24 ساعة بدون رياضة',
    en: 'Do not sweat — 24 hours without exercise',
  },
  'mobile.beautyRescue.aftercare.hairRemoval.tip3': {
    ar: 'ملابس قطنية واسعة — للتهوية',
    en: 'Loose cotton clothing — for ventilation',
  },
  'mobile.beautyRescue.aftercare.hairRemoval.tip4': {
    ar: 'تقشير لطيف — بعد 3 أيام',
    en: 'Gentle exfoliation — after 3 days',
  },
  // beauty-rewards
  'mobile.beautyRewards.loyalty.title': { ar: 'أرباح الولاء', en: 'Loyalty earnings' },
  'mobile.beautyRewards.loyalty.subtitle': {
    ar: '4500 ر.س إنفاق سنوي',
    en: 'SAR 4,500 annual spending',
  },
  'mobile.beautyRewards.loyalty.tip1': {
    ar: 'نسبة الاسترداد: 5% — 225 ر.س سنوياً',
    en: 'Cashback rate: 5% — SAR 225 a year',
  },
  'mobile.beautyRewards.loyalty.tip2': {
    ar: 'المستوى: ذهبي — نسبة أعلى',
    en: 'Tier: Gold — a higher rate',
  },
  'mobile.beautyRewards.loyalty.tip3': {
    ar: 'تضاف للمحفظة — تلقائياً',
    en: 'Added to the wallet — automatically',
  },
  'mobile.beautyRewards.loyalty.tip4': {
    ar: 'تصرف في أي وقت — لا حد أدنى',
    en: 'Redeem anytime — no minimum',
  },
  'mobile.beautyRewards.anniversary.title': { ar: 'ذكرى الانضمام', en: 'Join anniversary' },
  'mobile.beautyRewards.anniversary.subtitle': {
    ar: 'سنتان — أغسطس 2024',
    en: 'Two years — August 2024',
  },
  'mobile.beautyRewards.anniversary.tip1': {
    ar: 'عضوة منذ: أغسطس 2024',
    en: 'Member since: August 2024',
  },
  'mobile.beautyRewards.anniversary.tip2': {
    ar: '48 حجز — في سنتين',
    en: '48 bookings — in two years',
  },
  'mobile.beautyRewards.anniversary.tip3': {
    ar: 'هدية الذكرى: خصم 50 ر.س',
    en: 'Anniversary gift: SAR 50 off',
  },
  'mobile.beautyRewards.anniversary.tip4': {
    ar: 'شكراً لكونكِ جزءاً من عائلتنا',
    en: 'Thank you for being part of our family',
  },
  'mobile.beautyRewards.leaderboard.subtitle': {
    ar: 'المركز الخامس — 3 إحالات',
    en: 'Fifth place — 3 referrals',
  },
  'mobile.beautyRewards.leaderboard.tip1': {
    ar: 'نورة: 12 إحالة — المركز الأول',
    en: 'Noura: 12 referrals — first place',
  },
  'mobile.beautyRewards.leaderboard.tip2': {
    ar: 'مها: 8 إحالات — المركز الثاني',
    en: 'Maha: 8 referrals — second place',
  },
  'mobile.beautyRewards.leaderboard.tip3': {
    ar: 'ريم: 5 إحالات — المركز الثالث',
    en: 'Reem: 5 referrals — third place',
  },
  'mobile.beautyRewards.leaderboard.tip4': {
    ar: 'أنتِ: 3 إحالات — المركز الخامس',
    en: 'You: 3 referrals — fifth place',
  },
  'mobile.beautyRewards.student.title': { ar: 'خصم الطالبات', en: 'Student discount' },
  'mobile.beautyRewards.student.subtitle': {
    ar: '15% — للطالبات الجامعيات',
    en: '15% — for university students',
  },
  'mobile.beautyRewards.student.tip1': {
    ar: 'لطالبات الجامعة — undergraduate',
    en: 'For university students — undergraduate',
  },
  'mobile.beautyRewards.student.tip2': {
    ar: 'خصم 15% — على جميع الخدمات',
    en: '15% off — on all services',
  },
  'mobile.beautyRewards.student.tip3': {
    ar: 'إثبات: البطاقة الجامعية',
    en: 'Proof: university ID card',
  },
  'mobile.beautyRewards.group.title': { ar: 'خصم المجموعات', en: 'Group discount' },
  'mobile.beautyRewards.group.subtitle': {
    ar: 'احجزوا معاً — وفروا أكثر',
    en: 'Book together — save more',
  },
  'mobile.beautyRewards.group.tip1': { ar: '3+ أشخاص — خصم 10%', en: '3+ people — 10% off' },
  'mobile.beautyRewards.group.tip2': { ar: '5+ أشخاص — خصم 15%', en: '5+ people — 15% off' },
  'mobile.beautyRewards.group.tip3': { ar: '8+ أشخاص — خصم 20%', en: '8+ people — 20% off' },
  'mobile.beautyRewards.group.tip4': {
    ar: 'مناسبات خاصة — باقة VIP',
    en: 'Special occasions — a VIP package',
  },
  'mobile.beautyRewards.kindness.title': { ar: 'نقاط الطيبة', en: 'Kindness points' },
  'mobile.beautyRewards.kindness.subtitle': {
    ar: 'أفعلي خيراً — اكسبي نقاطاً',
    en: 'Do good — earn points',
  },
  'mobile.beautyRewards.kindness.tip1': {
    ar: 'ساعدي صديقة — 50 نقطة',
    en: 'Help a friend — 50 points',
  },
  'mobile.beautyRewards.kindness.tip2': {
    ar: 'اكتبي تقييماً — 25 نقطة',
    en: 'Write a review — 25 points',
  },
  'mobile.beautyRewards.kindness.tip3': {
    ar: 'أحلي هدية — 100 نقطة',
    en: 'Buy a gift — 100 points',
  },
  'mobile.beautyRewards.kindness.tip4': {
    ar: 'كوني لطيفة — الجمال في العطاء',
    en: 'Be kind — beauty is in giving',
  },
  // beauty-services
  'mobile.beautyServices.sunAdvice.title': { ar: 'نصيحة جمال', en: 'Beauty advice' },
  'mobile.beautyServices.sunAdvice.subtitle': {
    ar: 'ضعي واقي الشمس كل ساعتين',
    en: 'Apply sunscreen every two hours',
  },
  'mobile.beautyServices.sunAdvice.tip1': {
    ar: 'SPF 50+ — للوجه والرقبة واليدين',
    en: 'SPF 50+ — for face, neck and hands',
  },
  'mobile.beautyServices.sunAdvice.tip2': {
    ar: 'جدديه كل ساعتين — تحت الشمس المباشرة',
    en: 'Reapply every two hours — in direct sunlight',
  },
  'mobile.beautyServices.sunAdvice.tip3': {
    ar: 'حتى في البيت — الأشعة تخترق الزجاج',
    en: 'Even at home — rays pass through glass',
  },
  'mobile.beautyServices.sunAdvice.tip4': {
    ar: '365 يوم — صيفاً وشتاءً',
    en: '365 days — summer and winter',
  },
  'mobile.beautyServices.emergency.title': { ar: 'طوارئ الجمال', en: 'Beauty emergencies' },
  'mobile.beautyServices.emergency.subtitle': {
    ar: 'مساعدة فورية — 24 ساعة',
    en: 'Instant help — 24 hours',
  },
  'mobile.beautyServices.emergency.tip1': {
    ar: 'اتصلي: 9200 — خط الطوارئ',
    en: 'Call: 9200 — the emergency line',
  },
  'mobile.beautyServices.emergency.tip2': {
    ar: 'وصول خلال 30 دقيقة',
    en: 'Arrival within 30 minutes',
  },
  'mobile.beautyServices.emergency.tip3': {
    ar: 'خدمة منزلية — للطوارئ',
    en: 'At-home service — for emergencies',
  },
  'mobile.beautyServices.emergency.tip4': {
    ar: 'استشارة طبية — عند الحاجة',
    en: 'Medical consultation — when needed',
  },
  'mobile.beautyServices.facilities.title': { ar: 'مرافق الصالون', en: 'Salon facilities' },
  'mobile.beautyServices.facilities.subtitle': {
    ar: 'واي فاي — مواقف — قهوة',
    en: 'Wi-Fi — parking — coffee',
  },
  'mobile.beautyServices.facilities.tip1': {
    ar: 'واي فاي مجاني — ابقي متصلة',
    en: 'Free Wi-Fi — stay connected',
  },
  'mobile.beautyServices.facilities.tip2': { ar: 'مواقف سيارات — مجانية', en: 'Parking — free' },
  'mobile.beautyServices.facilities.tip3': {
    ar: 'ضيافة — قهوة وشاي',
    en: 'Refreshments — coffee and tea',
  },
  'mobile.beautyServices.facilities.tip4': {
    ar: 'ركن أطفال — العبي بأمان',
    en: 'Kids corner — play safely',
  },
  'mobile.beautyServices.prayerRoom.title': { ar: 'غرفة الصلاة', en: 'Prayer room' },
  'mobile.beautyServices.prayerRoom.subtitle': {
    ar: 'سجادات — عباءات — قبلة',
    en: 'Prayer mats — abayas — qibla',
  },
  'mobile.beautyServices.prayerRoom.tip1': {
    ar: 'سجادات صلاة — نظيفة ومعطرة',
    en: 'Prayer mats — clean and scented',
  },
  'mobile.beautyServices.prayerRoom.tip2': {
    ar: 'عباءات — متوفرة للصلاة',
    en: 'Abayas — available for prayer',
  },
  'mobile.beautyServices.prayerRoom.tip3': {
    ar: 'اتجاه القبلة — محدد بوضوح',
    en: 'Qibla direction — clearly marked',
  },
  'mobile.beautyServices.prayerRoom.tip4': {
    ar: 'مكان وضوء — مجهز بالكامل',
    en: 'Wudu area — fully equipped',
  },
  'mobile.beautyServices.productCompare.subtitle': {
    ar: 'كريم A vs كريم B',
    en: 'Cream A vs Cream B',
  },
  'mobile.beautyServices.productCompare.tip1': {
    ar: 'كريم A: 120 ر.س — ترطيب 24 ساعة (4.5)',
    en: 'Cream A: SAR 120 — 24-hour hydration (4.5)',
  },
  'mobile.beautyServices.productCompare.tip2': {
    ar: 'كريم B: 80 ر.س — خفيف وسريع (4.0)',
    en: 'Cream B: SAR 80 — light and fast (4.0)',
  },
  'mobile.beautyServices.productCompare.tip3': {
    ar: 'الأفضل: كريم A — ترطيب عميق',
    en: 'Best: Cream A — deep hydration',
  },
  'mobile.beautyServices.productCompare.tip4': {
    ar: 'الأوفر: كريم B — قيمة ممتازة',
    en: 'Best value: Cream B — excellent value',
  },
  'mobile.beautyServices.premium.subtitle': {
    ar: 'باقة Premium — خصم 20%',
    en: 'Premium package — 20% off',
  },
  // beauty-tips
  'mobile.beautyTips.makeup.title': { ar: 'نصائح المكياج', en: 'Makeup tips' },
  'mobile.beautyTips.makeup.subtitle': { ar: 'لإطلالة تدوم طويلاً', en: 'For a long-lasting look' },
  'mobile.beautyTips.makeup.tip1': {
    ar: 'الترطيب أولاً — بشرة مرطبة = مكياج أجمل',
    en: 'Moisturize first — hydrated skin = prettier makeup',
  },
  'mobile.beautyTips.makeup.tip2': {
    ar: 'نظفي فرشك — أسبوعياً البكتيريا تتراكم',
    en: 'Clean your brushes — bacteria build up weekly',
  },
  'mobile.beautyTips.makeup.tip3': {
    ar: 'تاريخ الصلاحية — جددِي مكياجك كل 6-12 شهر',
    en: 'Expiry date — renew your makeup every 6-12 months',
  },
  'mobile.beautyTips.makeup.tip4': {
    ar: 'أزيلي المكياج — لا تنامي أبداً بالمكياج',
    en: 'Remove your makeup — never sleep in makeup',
  },
  'mobile.beautyTips.spring.title': { ar: 'تذكير الربيع', en: 'Spring reminder' },
  'mobile.beautyTips.spring.subtitle': {
    ar: 'روتينكِ يتغير مع الفصول',
    en: 'Your routine changes with the seasons',
  },
  'mobile.beautyTips.spring.tip1': {
    ar: 'جددي روتين التقشير — بشرة أنعم',
    en: 'Refresh your exfoliation routine — smoother skin',
  },
  'mobile.beautyTips.spring.tip2': {
    ar: 'انتقلي لمرطب أخف — مع ارتفاع الحرارة',
    en: 'Switch to a lighter moisturizer — as it warms up',
  },
  'mobile.beautyTips.spring.tip3': {
    ar: 'اهتمي بالحماية من الشمس مبكراً',
    en: 'Start sun protection early',
  },
  'mobile.beautyTips.spring.tip4': {
    ar: 'جربي ألوان باستيل — منعشة وناعمة',
    en: 'Try pastel colors — fresh and soft',
  },
  'mobile.beautyTips.summer.title': { ar: 'تذكير الصيف', en: 'Summer reminder' },
  'mobile.beautyTips.summer.subtitle': { ar: 'حماية وانتعاش', en: 'Protection and freshness' },
  'mobile.beautyTips.summer.tip1': {
    ar: 'SPF 50+ يومياً — حتى في الظل',
    en: 'SPF 50+ daily — even in the shade',
  },
  'mobile.beautyTips.summer.tip2': {
    ar: 'مرطب جل خفيف — بدل الكريم الثقيل',
    en: 'A light gel moisturizer — instead of heavy cream',
  },
  'mobile.beautyTips.summer.tip3': {
    ar: 'اشربي ماء كثيراً — 8 أكواب يومياً',
    en: 'Drink plenty of water — 8 cups a day',
  },
  'mobile.beautyTips.summer.tip4': {
    ar: 'تجنبي المكياج الثقيل — خففي الطبقات',
    en: 'Avoid heavy makeup — lighten the layers',
  },
  'mobile.beautyTips.winter.title': { ar: 'تذكير الشتاء', en: 'Winter reminder' },
  'mobile.beautyTips.winter.subtitle': { ar: 'ترطيب وحماية', en: 'Hydration and protection' },
  'mobile.beautyTips.winter.tip1': {
    ar: 'مرطب غني — يحمي من الهواء الجاف',
    en: 'A rich moisturizer — protects from dry air',
  },
  'mobile.beautyTips.winter.tip2': {
    ar: 'بلسم شفاه — ضروري في الشتاء',
    en: 'Lip balm — a must in winter',
  },
  'mobile.beautyTips.winter.tip3': {
    ar: 'قناع ترطيب أسبوعي — بشرة نضرة',
    en: 'A weekly hydrating mask — radiant skin',
  },
  'mobile.beautyTips.winter.tip4': {
    ar: 'احمي بشرتكِ من الهواء البارد',
    en: 'Protect your skin from cold air',
  },
  'mobile.beautyTips.trending.title': { ar: 'رائج الآن', en: 'Trending now' },
  'mobile.beautyTips.trending.subtitle': {
    ar: 'أحدث صيحات الجمال',
    en: 'The latest beauty trends',
  },
  'mobile.beautyTips.trending.tip1': {
    ar: 'البشرة الزجاجية — الترطيب قبل المكياج',
    en: 'Glass skin — hydrate before makeup',
  },
  'mobile.beautyTips.trending.tip2': {
    ar: 'ألوان الباستيل — ناعمة وأنثوية',
    en: 'Pastel colors — soft and feminine',
  },
  'mobile.beautyTips.trending.tip3': {
    ar: 'العناية بالشفاه — تينت طبيعي',
    en: 'Lip care — a natural tint',
  },
  'mobile.beautyTips.trending.tip4': {
    ar: 'المكياج الطبيعي — بشرة أولى',
    en: 'Natural makeup — skin first',
  },
  'mobile.beautyTips.hyaluronic.subtitle': {
    ar: 'مرطب A+ يحمل 1000 ضعف وزنه ماء',
    en: 'An A+ moisturizer that holds 1000x its weight in water',
  },
  'mobile.beautyTips.hyaluronic.tip1': {
    ar: 'يوجد طبيعياً في البشرة — آمن تماماً',
    en: 'Found naturally in the skin — completely safe',
  },
  'mobile.beautyTips.hyaluronic.tip2': {
    ar: 'مناسب لجميع أنواع البشرة',
    en: 'Suitable for all skin types',
  },
  'mobile.beautyTips.hyaluronic.tip3': {
    ar: 'يدمج مع جميع المكونات — ثنائي رائع',
    en: 'Pairs with all ingredients — a wonderful duo',
  },
  'mobile.beautyTips.style.title': { ar: 'تحليل الأسلوب', en: 'Style analysis' },
  'mobile.beautyTips.style.tip1': {
    ar: 'كلاسيكي — أنيق وخالد 92%',
    en: 'Classic — elegant and timeless 92%',
  },
  'mobile.beautyTips.style.tip2': {
    ar: 'عصري — متجدد وجريء 78%',
    en: 'Modern — renewed and bold 78%',
  },
  'mobile.beautyTips.style.tip3': {
    ar: 'بوهيمي — ناعم وطبيعي 65%',
    en: 'Bohemian — soft and natural 65%',
  },
  'mobile.beautyTips.style.tip4': {
    ar: 'فاخر — فخم ومتكامل 55%',
    en: 'Luxurious — opulent and complete 55%',
  },
  'mobile.beautyTips.hydration.subtitle': {
    ar: 'تحدي 5 دقائق يومياً',
    en: 'A 5-minute daily challenge',
  },
  'mobile.beautyTips.hydration.tip1': {
    ar: 'الصباح — مرطب + واقي شمس',
    en: 'Morning — moisturizer + sunscreen',
  },
  'mobile.beautyTips.hydration.tip2': {
    ar: 'طوال اليوم — 8 أكواب ماء',
    en: 'All day — 8 cups of water',
  },
  'mobile.beautyTips.hydration.tip3': {
    ar: 'المساء — سيروم + مرطب ليلي',
    en: 'Evening — serum + night moisturizer',
  },
  'mobile.beautyTips.hydration.tip4': {
    ar: 'أسبوعياً — قناع ترطيب',
    en: 'Weekly — a hydrating mask',
  },
  'mobile.beautyTips.humid.title': { ar: 'عناية في الرطوبة', en: 'Care in humidity' },
  'mobile.beautyTips.humid.subtitle': {
    ar: 'بشرة منتعشة في الجو الرطب',
    en: 'Fresh skin in humid weather',
  },
  'mobile.beautyTips.humid.tip1': {
    ar: 'مرطب جل — خفيف وليس كريمي',
    en: 'A gel moisturizer — light, not creamy',
  },
  'mobile.beautyTips.humid.tip2': {
    ar: 'ورق نشاف — لإزالة اللمعان',
    en: 'Blotting paper — to remove shine',
  },
  'mobile.beautyTips.humid.tip3': {
    ar: 'مكياج خفيف — بدون طبقات ثقيلة',
    en: 'Light makeup — no heavy layers',
  },
  'mobile.beautyTips.humid.tip4': {
    ar: 'تونر مات — يقلل إفراز الدهون',
    en: 'A mattifying toner — reduces oil production',
  },
  'mobile.beautyTips.dryClimate.title': { ar: 'عناية في الجفاف', en: 'Care in dryness' },
  'mobile.beautyTips.dryClimate.subtitle': {
    ar: 'بشرة مرطبة في المناخ الجاف',
    en: 'Hydrated skin in a dry climate',
  },
  'mobile.beautyTips.dryClimate.tip1': {
    ar: 'مرطب كثيف — كريم غني وليس جل',
    en: 'A thick moisturizer — a rich cream, not a gel',
  },
  'mobile.beautyTips.dryClimate.tip2': {
    ar: 'سيروم هيالورونيك — قبل المرطب',
    en: 'Hyaluronic serum — before moisturizer',
  },
  'mobile.beautyTips.dryClimate.tip3': {
    ar: 'مرطب جو — أثناء النوم',
    en: 'A humidifier — while you sleep',
  },
  'mobile.beautyTips.dryClimate.tip4': {
    ar: 'سيراميد — يقوي حاجز البشرة',
    en: 'Ceramides — strengthen the skin barrier',
  },
  'mobile.beautyTips.heat.title': { ar: 'عناية في الحر', en: 'Care in the heat' },
  'mobile.beautyTips.heat.subtitle': {
    ar: 'بشرة محمية في الصيف الحار',
    en: 'Protected skin in the hot summer',
  },
  'mobile.beautyTips.heat.tip1': {
    ar: 'SPF 50+ — جدديه كل ساعتين',
    en: 'SPF 50+ — reapply every two hours',
  },
  'mobile.beautyTips.heat.tip3': {
    ar: 'قبعة ونظارة — حماية إضافية',
    en: 'A hat and sunglasses — extra protection',
  },
  'mobile.beautyTips.heat.tip4': {
    ar: 'جل الألوفيرا مبرد — بعد الشمس',
    en: 'Chilled aloe vera gel — after sun exposure',
  },
  'mobile.beautyTips.cold.title': { ar: 'عناية في البرد', en: 'Care in the cold' },
  'mobile.beautyTips.cold.subtitle': {
    ar: 'بشرة محمية في الشتاء القارس',
    en: 'Protected skin in the harsh winter',
  },
  'mobile.beautyTips.cold.tip1': {
    ar: 'بلسم منظف — بدل الجل القاسي',
    en: 'A cleansing balm — instead of harsh gel',
  },
  'mobile.beautyTips.cold.tip2': {
    ar: 'كريم سميك قبل الخروج',
    en: 'A thick cream before going out',
  },
  'mobile.beautyTips.cold.tip3': {
    ar: 'وشاح — يحمي الوجه من الرياح',
    en: 'A scarf — protects the face from wind',
  },
  'mobile.beautyTips.cold.tip4': {
    ar: 'زيت وجه — طبقة إضافية ليلاً',
    en: 'Face oil — an extra layer at night',
  },
  'mobile.beautyTips.travel.title': { ar: 'عناية المسافرة', en: 'Traveler care' },
  'mobile.beautyTips.travel.subtitle': {
    ar: 'بشرتكِ بين المناخات',
    en: 'Your skin between climates',
  },
  'mobile.beautyTips.travel.tip1': {
    ar: 'منتجات متعددة — ترطب وتحمي',
    en: 'Multi-purpose products — hydrate and protect',
  },
  'mobile.beautyTips.travel.tip2': { ar: 'اشربي ماء في الطائرة', en: 'Drink water on the plane' },
  'mobile.beautyTips.travel.tip3': {
    ar: 'قناع ورقي — ترطيب فوري',
    en: 'A sheet mask — instant hydration',
  },
  'mobile.beautyTips.travel.tip4': {
    ar: 'عدلي روتينك حسب مناخ وجهتك',
    en: 'Adjust your routine to your destination climate',
  },
  'mobile.beautyTips.careMistakes.title': { ar: 'أخطاء العناية', en: 'Skincare mistakes' },
  'mobile.beautyTips.careMistakes.subtitle': { ar: 'توقفي عنها فوراً', en: 'Stop them right away' },
  'mobile.beautyTips.careMistakes.tip1': {
    ar: 'غسل الوجه بماء ساخن — يجرد البشرة',
    en: 'Washing your face with hot water — strips the skin',
  },
  'mobile.beautyTips.careMistakes.tip2': {
    ar: 'تخطي المرطب — حتى الدهنية تحتاج ترطيب',
    en: 'Skipping moisturizer — even oily skin needs hydration',
  },
  'mobile.beautyTips.careMistakes.tip3': {
    ar: 'عدم استخدام واقي شمس — سبب الشيخوخة',
    en: 'Not using sunscreen — a cause of aging',
  },
  'mobile.beautyTips.careMistakes.tip4': {
    ar: 'تغيير المنتجات كل أسبوع — 6-8 أسابيع',
    en: 'Changing products every week — give each 6-8 weeks',
  },
  'mobile.beautyTips.makeupMistakes.title': { ar: 'أخطاء المكياج', en: 'Makeup mistakes' },
  'mobile.beautyTips.makeupMistakes.subtitle': {
    ar: 'أخطاء شائعة — حلول بسيطة',
    en: 'Common mistakes — simple solutions',
  },
  'mobile.beautyTips.makeupMistakes.tip1': {
    ar: 'فاونديشن أفتح — جربي على خط الفك',
    en: 'Foundation that is too light — test on the jawline',
  },
  'mobile.beautyTips.makeupMistakes.tip2': {
    ar: 'عدم تنظيف الفرش — بكتيريا تسبب الحبوب',
    en: 'Not cleaning brushes — bacteria cause breakouts',
  },
  'mobile.beautyTips.makeupMistakes.tip3': {
    ar: 'تحديد الشفاه بلون أغمق بكثير',
    en: 'Lining lips with a much darker color',
  },
  'mobile.beautyTips.makeupMistakes.tip4': {
    ar: 'عيون ثقيلة + شفاه ثقيلة — اختاري واحداً',
    en: 'Heavy eyes + heavy lips — pick one',
  },
  'mobile.beautyTips.hairMistakes.title': { ar: 'أخطاء الشعر', en: 'Hair mistakes' },
  'mobile.beautyTips.hairMistakes.subtitle': {
    ar: 'توقفي عنها — شعركِ سيشكركِ',
    en: 'Stop them — your hair will thank you',
  },
  'mobile.beautyTips.hairMistakes.tip1': {
    ar: 'حرارة بدون واقي — تلف دائم للشعر',
    en: 'Heat without protection — permanent hair damage',
  },
  'mobile.beautyTips.hairMistakes.tip2': {
    ar: 'بلسم على الجذور — يسد ويثقل الشعر',
    en: 'Conditioner on the roots — clogs and weighs hair down',
  },
  'mobile.beautyTips.hairMistakes.tip3': {
    ar: 'تمشيط الشعر المبلل بقوة — يتكسر',
    en: 'Brushing wet hair roughly — it breaks',
  },
  'mobile.beautyTips.hairMistakes.tip4': {
    ar: 'النوم بشعر مبلل — فطريات وتقصف',
    en: 'Sleeping with wet hair — fungus and split ends',
  },
  'mobile.beautyTips.overExfoliation.title': { ar: 'الإفراط في التقشير', en: 'Over-exfoliation' },
  'mobile.beautyTips.overExfoliation.subtitle': {
    ar: 'علامات التحذير والحل',
    en: 'Warning signs and the fix',
  },
  'mobile.beautyTips.overExfoliation.tip1': {
    ar: 'علامات: احمرار حرقان لمعان حساسية',
    en: 'Signs: redness, burning, shine, sensitivity',
  },
  'mobile.beautyTips.overExfoliation.tip2': {
    ar: 'توقفي فوراً — كل المنتجات النشطة',
    en: 'Stop immediately — all active products',
  },
  'mobile.beautyTips.overExfoliation.tip3': {
    ar: 'العلاج: مرطب بسيط + سيراميد فقط',
    en: 'The fix: a simple moisturizer + ceramides only',
  },
  'mobile.beautyTips.overExfoliation.tip4': {
    ar: 'أسبوعين راحة — ثم عودي تدريجياً',
    en: 'Two weeks of rest — then return gradually',
  },
  'mobile.beautyTips.productOverload.title': { ar: 'تحميل المنتجات', en: 'Product overload' },
  'mobile.beautyTips.productOverload.subtitle': {
    ar: 'كثرة المنتجات — ضرر أكثر',
    en: 'Too many products — more harm',
  },
  'mobile.beautyTips.productOverload.tip1': {
    ar: 'لا تخلطي أكثر من 3 منتجات نشطة',
    en: 'Do not mix more than 3 active products',
  },
  'mobile.beautyTips.productOverload.tip2': {
    ar: 'منتج فعال واحد صباحاً وآخر مساءً',
    en: 'One active product in the morning and another at night',
  },
  'mobile.beautyTips.productOverload.tip3': {
    ar: 'نظام التدوير: ريتينول — تقشير — راحة',
    en: 'A rotation system: retinol — exfoliation — rest',
  },
  'mobile.beautyTips.productOverload.tip4': {
    ar: 'البشرة تفضل البساطة — الأقل هو الأكثر',
    en: 'Skin prefers simplicity — less is more',
  },
  'mobile.beautyTips.eidGlow.title': { ar: 'إشراقة العيد', en: 'Eid glow' },
  'mobile.beautyTips.eidGlow.subtitle': {
    ar: 'خطة جمالية متكاملة للعيد',
    en: 'A complete beauty plan for Eid',
  },
  'mobile.beautyTips.eidGlow.tip1': {
    ar: 'قبل بأسبوع: فيشل + حواجب + مانيكير',
    en: 'A week before: facial + brows + manicure',
  },
  'mobile.beautyTips.eidGlow.tip2': {
    ar: 'ليلة العيد: حمام زيت + مرطب + نوم',
    en: 'Eid night: hair oil treatment + moisturizer + sleep',
  },
  'mobile.beautyTips.eidGlow.tip3': {
    ar: 'صباح العيد: مكياج ناعم + عطر',
    en: 'Eid morning: soft makeup + perfume',
  },
  'mobile.beautyTips.eidGlow.tip4': {
    ar: 'صوري إطلالتك — ذكريات العيد',
    en: 'Photograph your look — Eid memories',
  },
  'mobile.beautyTips.eidHair.title': { ar: 'تسريحة العيد', en: 'Eid hairstyle' },
  'mobile.beautyTips.eidHair.subtitle': {
    ar: 'تسريحات تناسب عباءة العيد',
    en: 'Styles that suit the Eid abaya',
  },
  'mobile.beautyTips.eidHair.tip1': {
    ar: 'كعكة منخفضة — أنيقة مع الطرحة',
    en: 'A low bun — elegant with the tarha',
  },
  'mobile.beautyTips.eidHair.tip2': {
    ar: 'ويفي ناعم — مع لفّة حجاب',
    en: 'Soft waves — with a hijab wrap',
  },
  'mobile.beautyTips.eidHair.tip3': {
    ar: 'ضفيرة جانبية — عصرية ومريحة',
    en: 'A side braid — modern and comfortable',
  },
  'mobile.beautyTips.eidHair.tip4': {
    ar: 'حمام زيت قبلها بيوم — لمعان',
    en: 'A hair oil treatment the day before — shine',
  },
  'mobile.beautyTips.eidNails.title': { ar: 'أظافر العيد', en: 'Eid nails' },
  'mobile.beautyTips.eidNails.subtitle': {
    ar: 'ألوان وتصاميم تناسب العيد',
    en: 'Colors and designs for Eid',
  },
  'mobile.beautyTips.eidNails.tip1': {
    ar: 'ألوان باستيل — وردي لافندر بيج',
    en: 'Pastel colors — pink, lavender, beige',
  },
  'mobile.beautyTips.eidNails.tip2': {
    ar: 'جليتر خفيف — لمسة احتفالية',
    en: 'Light glitter — a festive touch',
  },
  'mobile.beautyTips.eidNails.tip3': {
    ar: 'هلال ذهبي — تصميم العيد',
    en: 'A golden crescent — the Eid design',
  },
  'mobile.beautyTips.eidNails.tip4': {
    ar: 'قبل العيد بيومين — لتكون مثالية',
    en: 'Two days before Eid — to be perfect',
  },
  'mobile.beautyTips.eidPerfume.title': { ar: 'عطر العيد', en: 'Eid perfume' },
  'mobile.beautyTips.eidPerfume.subtitle': {
    ar: 'العطر المثالي ليوم العيد',
    en: 'The perfect perfume for Eid day',
  },
  'mobile.beautyTips.eidPerfume.tip1': {
    ar: 'عود وورد — كلاسيكية العيد',
    en: 'Oud and rose — an Eid classic',
  },
  'mobile.beautyTips.eidPerfume.tip2': {
    ar: 'طبقات — قاعدة + قلب + نفحة',
    en: 'Layering — base + heart + top notes',
  },
  'mobile.beautyTips.eidPerfume.tip3': {
    ar: 'قبل الخروج بساعة — ليثبت',
    en: 'An hour before going out — so it lasts',
  },
  'mobile.beautyTips.eidPerfume.tip4': {
    ar: 'عطر جديد للعيد — تقليد جميل',
    en: 'A new perfume for Eid — a lovely tradition',
  },

  // ── sweep slice 8: wishlist-gifts / booking-checklist / bookings create+reschedule ──
  'mobile.beautyWishlistGifts.gift-swedish-massage': {
    ar: 'جلسة مساج سويدي',
    en: 'Swedish massage session',
  },
  'mobile.beautyWishlistGifts.gift-gel-manicure': { ar: 'مانيكير جل', en: 'Gel manicure' },
  'mobile.beautyWishlistGifts.gift-skincare-session': {
    ar: 'جلسة عناية بالبشرة',
    en: 'Skincare session',
  },
  'mobile.beautyWishlistGifts.priority-high': { ar: 'أولوية', en: 'Priority' },
  'mobile.beautyWishlistGifts.priority-medium': { ar: 'مهم', en: 'Important' },
  'mobile.beautyWishlistGifts.priority-low': { ar: 'جميل', en: 'Nice' },
  'mobile.bookingChecklist.item-confirm-booking': {
    ar: 'تأكيد موعد الحجز',
    en: 'Confirm the booking appointment',
  },
  'mobile.bookingChecklist.item-prepare-space': { ar: 'تجهيز المكان', en: 'Prepare the space' },
  'mobile.bookingChecklist.item-remove-old-makeup': {
    ar: 'إزالة المكياج القديم',
    en: 'Remove old makeup',
  },
  'mobile.bookingChecklist.item-drink-water': { ar: 'شرب الماء', en: 'Drink water' },
  'mobile.bookingChecklist.item-relax-before': {
    ar: 'الاسترخاء قبل الموعد',
    en: 'Relax before the appointment',
  },
  'mobile.bookingsCreate.look-note': {
    ar: 'لوك التجربة: {type} {colorHex}',
    en: 'Try-on look: {type} {colorHex}',
  },
  'mobile.bookingsReschedule.reason': {
    ar: 'طلب تعديل الموعد',
    en: 'Request to change the appointment',
  },

  // ── sweep slice 9: family-beauty / gift-card-market / gift-registry / group-bookings / hair-care-guide ──
  'mobile.familyBeauty.mommyAndMe.subtitle': {
    ar: 'نورة وابنتها سارة (8 سنوات)',
    en: 'Noura and her daughter Sara (8 years old)',
  },
  'mobile.familyBeauty.mommyAndMe.tip1': {
    ar: 'التجربة: ميني فيشل — 250 ر.س',
    en: 'Experience: mini facial — 250 SAR',
  },
  'mobile.familyBeauty.mommyAndMe.tip2': {
    ar: 'الأم: نورة — عناية بالبشرة',
    en: 'Mother: Noura — skincare',
  },
  'mobile.familyBeauty.mommyAndMe.tip3': {
    ar: 'الابنة: سارة — 8 سنوات',
    en: 'Daughter: Sara — 8 years old',
  },
  'mobile.familyBeauty.mommyAndMe.tip4': {
    ar: 'علاج لطيف — مناسب للأطفال',
    en: 'Gentle treatment — suitable for children',
  },
  'mobile.familyBeauty.threeGenerations.title': {
    ar: 'ثلاثة أجيال',
    en: 'Three Generations',
  },
  'mobile.familyBeauty.threeGenerations.subtitle': {
    ar: 'الجدة، الأم، والحفيدة',
    en: 'Grandmother, mother, and granddaughter',
  },
  'mobile.familyBeauty.threeGenerations.tip1': {
    ar: 'الجدة: أم خالد — مساج واسترخاء',
    en: 'Grandmother: Umm Khalid — massage and relaxation',
  },
  'mobile.familyBeauty.threeGenerations.tip2': {
    ar: 'الأم: نورة — عناية كاملة',
    en: 'Mother: Noura — full care',
  },
  'mobile.familyBeauty.threeGenerations.tip3': {
    ar: 'الحفيدة: سارة — ميني مانيكير',
    en: 'Granddaughter: Sara — mini manicure',
  },
  'mobile.familyBeauty.threeGenerations.tip4': {
    ar: 'باقة عائلية — 3 خدمات بسعر مخفض',
    en: 'Family package — 3 services at a discount',
  },
  'mobile.familyBeauty.teenBeauty.title': {
    ar: 'جمال المراهقات',
    en: 'Teen Beauty',
  },
  'mobile.familyBeauty.teenBeauty.subtitle': {
    ar: 'أول درس مكياج (12-15 سنة)',
    en: 'First makeup lesson (12-15 years)',
  },
  'mobile.familyBeauty.teenBeauty.tip1': {
    ar: 'الخدمة: أول درس مكياج — 150 ر.س',
    en: 'Service: first makeup lesson — 150 SAR',
  },
  'mobile.familyBeauty.teenBeauty.tip2': {
    ar: 'المحتوى: تنظيف، ترطيب، مكياج خفيف',
    en: 'Content: cleansing, moisturizing, light makeup',
  },
  'mobile.familyBeauty.teenBeauty.tip3': {
    ar: 'بإشراف الأم — إلزامي',
    en: 'Supervised by the mother — mandatory',
  },
  'mobile.familyBeauty.teenBeauty.tip4': {
    ar: 'نصائح آمنة — مناسبة للعمر',
    en: 'Safe tips — age-appropriate',
  },
  'mobile.familyBeauty.firstFacial.title': {
    ar: 'أول فيشل',
    en: 'First Facial',
  },
  'mobile.familyBeauty.firstFacial.subtitle': {
    ar: 'مناسب من 14 سنة',
    en: 'Suitable from age 14',
  },
  'mobile.familyBeauty.firstFacial.tip1': {
    ar: 'العمر: 14 سنة — بشرة مختلطة',
    en: 'Age: 14 — combination skin',
  },
  'mobile.familyBeauty.firstFacial.tip2': {
    ar: 'الأم: نورة — مرافقة',
    en: 'Mother: Noura — accompanying',
  },
  'mobile.familyBeauty.firstFacial.tip3': {
    ar: 'منتجات لطيفة — خالية من العطور',
    en: 'Gentle products — fragrance-free',
  },
  'mobile.familyBeauty.firstFacial.tip4': {
    ar: 'استشارة قبل الجلسة — تحديد الاحتياج',
    en: 'Consultation before the session — identifying needs',
  },
  'mobile.familyBeauty.bridalTribe.title': {
    ar: 'قبيلة العروس',
    en: 'The Bride Tribe',
  },
  'mobile.familyBeauty.bridalTribe.subtitle': {
    ar: 'سارة — 15 مارس 2027',
    en: 'Sara — 15 March 2027',
  },
  'mobile.familyBeauty.bridalTribe.tip1': {
    ar: 'العروس: سارة — باقة عروس كاملة',
    en: 'Bride: Sara — full bridal package',
  },
  'mobile.familyBeauty.bridalTribe.tip2': {
    ar: 'الوصيفات: نورة، مها، ريم',
    en: 'Bridesmaids: Noura, Maha, Reem',
  },
  'mobile.familyBeauty.bridalTribe.tip3': {
    ar: '3 وصيفات — مكياج + شعر',
    en: '3 bridesmaids — makeup + hair',
  },
  'mobile.familyBeauty.bridalTribe.tip4': {
    ar: 'يوم الزفاف — خدمة منزلية',
    en: 'Wedding day — home service',
  },
  'mobile.familyBeauty.babyShower.subtitle': {
    ar: '12 ضيفة — للأم المنتظرة',
    en: '12 guests — for the expectant mother',
  },
  'mobile.familyBeauty.babyShower.tip1': {
    ar: 'للأم: نورة — عناية بالأم المنتظرة',
    en: 'For the mother: Noura — care for the expectant mother',
  },
  'mobile.familyBeauty.babyShower.tip2': {
    ar: '12 ضيفة — مناسبة خاصة',
    en: '12 guests — a special occasion',
  },
  'mobile.familyBeauty.babyShower.tip3': {
    ar: 'مساج استرخاء — آمن للحمل',
    en: 'Relaxing massage — pregnancy-safe',
  },
  'mobile.familyBeauty.babyShower.tip4': {
    ar: 'هدية — باقة عناية للأم',
    en: 'Gift — a care package for the mother',
  },
  'mobile.familyBeauty.valentine.title': {
    ar: 'قالنتاين',
    en: "Valentine's",
  },
  'mobile.familyBeauty.valentine.subtitle': {
    ar: '13 فبراير — خصم 20%',
    en: '13 February — 20% off',
  },
  'mobile.familyBeauty.valentine.tip1': {
    ar: 'الصديقات: نورة، مها — 450 ر.س',
    en: 'Friends: Noura, Maha — 450 SAR',
  },
  'mobile.familyBeauty.valentine.tip2': {
    ar: 'مانيكير + باديكير — للجميع',
    en: 'Manicure + pedicure — for everyone',
  },
  'mobile.familyBeauty.valentine.tip3': {
    ar: 'شاي وقهوة — ضيافة مميزة',
    en: 'Tea and coffee — a special treat',
  },
  'mobile.familyBeauty.valentine.tip4': {
    ar: 'هدية — لكل صديقة',
    en: 'Gift — for every friend',
  },
  'mobile.familyBeauty.newMomSupport.title': {
    ar: 'دعم الأم الجديدة',
    en: 'New Mom Support',
  },
  'mobile.familyBeauty.newMomSupport.subtitle': {
    ar: 'نورة — طفلها شهرين',
    en: 'Noura — her baby is two months old',
  },
  'mobile.familyBeauty.newMomSupport.tip1': {
    ar: 'مساج استرخاء — بعد الولادة',
    en: 'Relaxing massage — postpartum',
  },
  'mobile.familyBeauty.newMomSupport.tip2': {
    ar: 'عناية بالبشرة — للتغيرات الهرمونية',
    en: 'Skincare — for hormonal changes',
  },
  'mobile.familyBeauty.newMomSupport.tip3': {
    ar: 'جلسة سريعة — ساعة واحدة',
    en: 'Quick session — one hour',
  },
  'mobile.familyBeauty.newMomSupport.tip4': {
    ar: 'خدمة منزلية — راحة للأم',
    en: 'Home service — for the mother’s comfort',
  },
  'mobile.familyBeauty.bridalSkin.title': {
    ar: 'بشرة العروس',
    en: 'Bridal Skin',
  },
  'mobile.familyBeauty.bridalSkin.subtitle': {
    ar: 'خطة 6 أشهر لبشرة الزفاف',
    en: 'A 6-month plan for wedding-day skin',
  },
  'mobile.familyBeauty.bridalSkin.tip1': {
    ar: '6 أشهر: بدء روتين + واقي شمس يومي',
    en: '6 months: start a routine + daily sunscreen',
  },
  'mobile.familyBeauty.bridalSkin.tip2': {
    ar: '3 أشهر: أول جلسة فيشل + تحديد المشاكل',
    en: '3 months: first facial + identifying issues',
  },
  'mobile.familyBeauty.bridalSkin.tip3': {
    ar: 'شهر واحد: آخر تقشير — لا تجارب جديدة',
    en: 'One month: last exfoliation — no new experiments',
  },
  'mobile.familyBeauty.bridalSkin.tip4': {
    ar: 'أسبوع الزفاف: ترطيب مكثف',
    en: 'Wedding week: intensive hydration',
  },
  'mobile.familyBeauty.bridalBody.title': {
    ar: 'جسم العروس',
    en: 'Bridal Body',
  },
  'mobile.familyBeauty.bridalBody.subtitle': {
    ar: 'عناية شاملة قبل الزفاف',
    en: 'Complete care before the wedding',
  },
  'mobile.familyBeauty.bridalBody.tip1': {
    ar: 'تقشير الجسم — مرة أسبوعياً',
    en: 'Body scrub — once a week',
  },
  'mobile.familyBeauty.bridalBody.tip2': {
    ar: 'مساج استرخاء — يخفف التوتر',
    en: 'Relaxing massage — relieves tension',
  },
  'mobile.familyBeauty.bridalBody.tip3': {
    ar: 'إزالة الشعر — قبل الزفاف بـ 3-5 أيام',
    en: 'Hair removal — 3-5 days before the wedding',
  },
  'mobile.familyBeauty.bridalBody.tip4': {
    ar: 'تان لطيف — قبل الزفاف بيومين',
    en: 'Gentle tan — two days before the wedding',
  },
  'mobile.familyBeauty.bridalEmergency.title': {
    ar: 'طوارئ العروس',
    en: 'Bridal Emergency',
  },
  'mobile.familyBeauty.bridalEmergency.subtitle': {
    ar: 'طقم إنقاذ يوم الزفاف',
    en: 'Wedding-day rescue kit',
  },
  'mobile.familyBeauty.bridalEmergency.tip1': {
    ar: 'حبة حساسية — لأي تحسس مفاجئ',
    en: 'Allergy pill — for any sudden reaction',
  },
  'mobile.familyBeauty.bridalEmergency.tip2': {
    ar: 'لصقات — للكعب من الحذاء',
    en: 'Band-aids — for heels from shoes',
  },
  'mobile.familyBeauty.bridalEmergency.tip4': {
    ar: 'أحمر شفاه — للمسات سريعة',
    en: 'Lipstick — for quick touch-ups',
  },
  'mobile.familyBeauty.bridalTrial.title': {
    ar: 'تجربة العروس',
    en: 'Bridal Trial',
  },
  'mobile.familyBeauty.bridalTrial.subtitle': {
    ar: 'بروفة المكياج والشعر',
    en: 'Makeup and hair rehearsal',
  },
  'mobile.familyBeauty.bridalTrial.tip1': {
    ar: 'قبل الزفاف بشهر — الوقت المثالي',
    en: 'One month before the wedding — the ideal time',
  },
  'mobile.familyBeauty.bridalTrial.tip2': {
    ar: 'صوري الإطلالة — لتقييمها لاحقاً',
    en: 'Photograph the look — to evaluate it later',
  },
  'mobile.familyBeauty.bridalTrial.tip3': {
    ar: 'ارتدي أبيض — للتناسق مع الفستان',
    en: 'Wear white — to match the dress',
  },
  'mobile.familyBeauty.bridalTrial.tip4': {
    ar: 'كوني صريحة — هذه تجربتكِ',
    en: 'Be honest — this is your trial',
  },
  'mobile.familyBeauty.bridalGlow.title': {
    ar: 'إشراقة العروس',
    en: 'Bridal Glow',
  },
  'mobile.familyBeauty.bridalGlow.subtitle': {
    ar: 'توهجي في يومكِ الكبير',
    en: 'Shine on your big day',
  },
  'mobile.familyBeauty.bridalGlow.tip1': {
    ar: '8 أكواب ماء — لمدة شهر قبل الزفاف',
    en: '8 glasses of water — for a month before the wedding',
  },
  'mobile.familyBeauty.bridalGlow.tip2': {
    ar: 'غذاء صحي — أفوكادو سلمون مكسرات',
    en: 'Healthy food — avocado, salmon, nuts',
  },
  'mobile.familyBeauty.bridalGlow.tip3': {
    ar: '8 ساعات نوم — أهم سر للبشرة',
    en: '8 hours of sleep — the most important skin secret',
  },
  'mobile.familyBeauty.bridalGlow.tip4': {
    ar: 'تأمل 10 دقائق — هدوء وثقة',
    en: 'Meditate for 10 minutes — calm and confidence',
  },
  'mobile.familyBeauty.pregnancyGlow.title': {
    ar: 'إشراقة الحامل',
    en: 'Pregnancy Glow',
  },
  'mobile.familyBeauty.pregnancyGlow.subtitle': {
    ar: 'بشرة متوهجة أثناء الحمل',
    en: 'Glowing skin during pregnancy',
  },
  'mobile.familyBeauty.pregnancyGlow.tip1': {
    ar: 'الهرمونات تزيد تدفق الدم — بشرة وردية',
    en: 'Hormones increase blood flow — rosy skin',
  },
  'mobile.familyBeauty.pregnancyGlow.tip2': {
    ar: 'زيت الورد أو اللوز — لترطيب البطن',
    en: 'Rose or almond oil — to moisturize the belly',
  },
  'mobile.familyBeauty.pregnancyGlow.tip3': {
    ar: 'نامي جيداً — الإرهاق يظهر على بشرتكِ',
    en: 'Sleep well — fatigue shows on your skin',
  },
  'mobile.familyBeauty.pregnancyGlow.tip4': {
    ar: 'تغذية صحية — فيتامينات الحمل',
    en: 'Healthy nutrition — prenatal vitamins',
  },
  'mobile.familyBeauty.pregnancyMassage.title': {
    ar: 'مساج الحامل',
    en: 'Pregnancy Massage',
  },
  'mobile.familyBeauty.pregnancyMassage.subtitle': {
    ar: 'آمن — بعد الشهر الثالث',
    en: 'Safe — after the third month',
  },
  'mobile.familyBeauty.pregnancyMassage.tip1': {
    ar: 'الاستلقاء على الجانب — ليس على البطن',
    en: 'Lie on your side — not on your stomach',
  },
  'mobile.familyBeauty.pregnancyMassage.tip2': {
    ar: 'بعد الشهر الثالث — بأمان',
    en: 'After the third month — safely',
  },
  'mobile.familyBeauty.pregnancyMassage.tip3': {
    ar: 'تجنبي الزيوت القوية',
    en: 'Avoid strong oils',
  },
  'mobile.familyBeauty.pregnancyMassage.tip4': {
    ar: 'يخفف آلام الظهر — ويحسن النوم',
    en: 'Relieves back pain — and improves sleep',
  },
  'mobile.familyBeauty.nursingBeauty.title': {
    ar: 'جمال المرضعة',
    en: 'Nursing Beauty',
  },
  'mobile.familyBeauty.nursingBeauty.subtitle': {
    ar: 'عناية آمنة أثناء الرضاعة',
    en: 'Safe care while breastfeeding',
  },
  'mobile.familyBeauty.nursingBeauty.tip1': {
    ar: 'اشربي ماء أكثر — الرضاعة تجفف الجسم',
    en: 'Drink more water — breastfeeding dehydrates the body',
  },
  'mobile.familyBeauty.nursingBeauty.tip2': {
    ar: 'كريمات آمنة — بدون ريتينول',
    en: 'Safe creams — without retinol',
  },
  'mobile.familyBeauty.nursingBeauty.tip3': {
    ar: 'شعركِ قد يتساقط — فيتامينات',
    en: 'Your hair may shed — vitamins',
  },
  'mobile.familyBeauty.nursingBeauty.tip4': {
    ar: 'روتين سريع — 5 دقائق تكفي',
    en: 'A quick routine — 5 minutes is enough',
  },
  'mobile.familyBeauty.postpartumCare.title': {
    ar: 'عناية ما بعد الولادة',
    en: 'Postpartum Care',
  },
  'mobile.familyBeauty.postpartumCare.subtitle': {
    ar: 'نفسكِ مهمة — مثل طفلكِ',
    en: 'You matter too — just like your baby',
  },
  'mobile.familyBeauty.postpartumCare.tip1': {
    ar: '5 دقائق لكِ — غسل وجه وتنفس عميق',
    en: '5 minutes for you — wash your face and breathe deeply',
  },
  'mobile.familyBeauty.postpartumCare.tip2': {
    ar: 'لا تنعزلي — تحدثي مع صديقة',
    en: 'Do not isolate yourself — talk to a friend',
  },
  'mobile.familyBeauty.postpartumCare.tip3': {
    ar: 'اكتئاب ما بعد الولادة — ليس ضعفاً',
    en: 'Postpartum depression — not a weakness',
  },
  'mobile.familyBeauty.postpartumCare.tip4': {
    ar: 'أنتِ أم رائعة — لا تقسي على نفسكِ',
    en: 'You are a wonderful mother — do not be hard on yourself',
  },
  'mobile.hairCareGuide.washing.title': {
    ar: 'غسيل الشعر',
    en: 'Hair Washing',
  },
  'mobile.hairCareGuide.washing.subtitle': {
    ar: 'الطريقة الصحيحة',
    en: 'The right way',
  },
  'mobile.hairCareGuide.washing.tip1': {
    ar: 'بللي الشعر تماماً — 1-2 دقيقة',
    en: 'Soak your hair completely — 1-2 minutes',
  },
  'mobile.hairCareGuide.washing.tip2': {
    ar: 'الشامبو لفروة الرأس فقط',
    en: 'Shampoo for the scalp only',
  },
  'mobile.hairCareGuide.washing.tip3': {
    ar: 'البلسم للأطراف فقط — وليس الجذور',
    en: 'Conditioner for the ends only — not the roots',
  },
  'mobile.hairCareGuide.washing.tip4': {
    ar: 'اشطفي بماء بارد — يغلق البشرة ويضيف لمعان',
    en: 'Rinse with cold water — closes the cuticle and adds shine',
  },
  'mobile.hairCareGuide.hairMask.title': {
    ar: 'ماسك الشعر',
    en: 'Hair Mask',
  },
  'mobile.hairCareGuide.hairMask.subtitle': {
    ar: 'وصفات طبيعية للشعر',
    en: 'Natural recipes for hair',
  },
  'mobile.hairCareGuide.hairMask.tip1': {
    ar: 'أفوكادو + عسل — للشعر الجاف',
    en: 'Avocado + honey — for dry hair',
  },
  'mobile.hairCareGuide.hairMask.tip2': {
    ar: 'بيض + زيت زيتون — للشعر الضعيف',
    en: 'Egg + olive oil — for weak hair',
  },
  'mobile.hairCareGuide.hairMask.tip3': {
    ar: 'موز + زبادي — للشعر التالف',
    en: 'Banana + yogurt — for damaged hair',
  },
  'mobile.hairCareGuide.hairMask.tip4': {
    ar: 'خل تفاح — لمعان وتنظيف الفروة',
    en: 'Apple cider vinegar — shine and scalp cleansing',
  },
  'mobile.hairCareGuide.hairOils.title': {
    ar: 'زيوت الشعر',
    en: 'Hair Oils',
  },
  'mobile.hairCareGuide.hairOils.subtitle': {
    ar: 'أي زيت لشعرك؟',
    en: 'Which oil for your hair?',
  },
  'mobile.hairCareGuide.hairOils.tip1': {
    ar: 'جوز الهند — يخترق الشعرة ترطيب عميق',
    en: 'Coconut — penetrates the hair shaft for deep moisture',
  },
  'mobile.hairCareGuide.hairOils.tip2': {
    ar: 'الأرغان — ذهبي للمعان وتغذية',
    en: 'Argan — golden for shine and nourishment',
  },
  'mobile.hairCareGuide.hairOils.tip3': {
    ar: 'إكليل الجبل — يحفز نمو الشعر',
    en: 'Rosemary — stimulates hair growth',
  },
  'mobile.hairCareGuide.hairOils.tip4': {
    ar: 'الجوجوبا — يشبه زيوت فروة الرأس',
    en: 'Jojoba — resembles the scalp’s natural oils',
  },
  'mobile.hairCareGuide.heatProtection.title': {
    ar: 'حماية من الحرارة',
    en: 'Heat Protection',
  },
  'mobile.hairCareGuide.heatProtection.subtitle': {
    ar: 'احمي شعرك من التلف',
    en: 'Protect your hair from damage',
  },
  'mobile.hairCareGuide.heatProtection.tip1': {
    ar: 'واقي حراري — دائماً قبل المجفف أو المكواة',
    en: 'Heat protectant — always before the dryer or straightener',
  },
  'mobile.hairCareGuide.heatProtection.tip2': {
    ar: 'حرارة متوسطة — لا القصوى',
    en: 'Medium heat — not the maximum',
  },
  'mobile.hairCareGuide.heatProtection.tip3': {
    ar: 'لا تمرري المكواة على نفس الخصلة مرتين',
    en: 'Do not run the straightener over the same strand twice',
  },
  'mobile.hairCareGuide.heatProtection.tip4': {
    ar: 'يوم بدون حرارة في الأسبوع',
    en: 'One heat-free day a week',
  },
  'mobile.hairCareGuide.scalp.title': {
    ar: 'فروة الرأس',
    en: 'The Scalp',
  },
  'mobile.hairCareGuide.scalp.subtitle': {
    ar: 'بشرة صحية = شعر صحي',
    en: 'A healthy scalp = healthy hair',
  },
  'mobile.hairCareGuide.scalp.tip1': {
    ar: 'تقشير فروة الرأس — مرة شهرياً',
    en: 'Scalp exfoliation — once a month',
  },
  'mobile.hairCareGuide.scalp.tip2': {
    ar: 'تدليك يومي — 5 دقائق بزيت دافئ',
    en: 'Daily massage — 5 minutes with warm oil',
  },
  'mobile.hairCareGuide.scalp.tip3': {
    ar: 'ماء فاتر — ليس ساخناً',
    en: 'Lukewarm water — not hot',
  },
  'mobile.hairCareGuide.scalp.tip4': {
    ar: 'سيروم لفروة الرأس — قبل النوم',
    en: 'Scalp serum — before bed',
  },
  'mobile.hairCareGuide.hairColor.title': {
    ar: 'صبغ الشعر',
    en: 'Hair Coloring',
  },
  'mobile.hairCareGuide.hairColor.subtitle': {
    ar: 'نصائح قبل الصبغة',
    en: 'Tips before dyeing',
  },
  'mobile.hairCareGuide.hairColor.tip1': {
    ar: 'لا تغسلي شعرك 48 ساعة قبل الصبغة',
    en: 'Do not wash your hair for 48 hours before dyeing',
  },
  'mobile.hairCareGuide.hairColor.tip2': {
    ar: 'استخدمي شامبو وبلسم للشعر المصبوغ',
    en: 'Use shampoo and conditioner for colored hair',
  },
  'mobile.hairCareGuide.hairColor.tip3': {
    ar: 'احمي شعرك من الشمس بعد الصبغة',
    en: 'Protect your hair from the sun after dyeing',
  },
  'mobile.hairCareGuide.hairColor.tip4': {
    ar: 'جديدي الصبغة كل 4-6 أسابيع',
    en: 'Refresh the color every 4-6 weeks',
  },
  'mobile.hairCareGuide.hairstyling.title': {
    ar: 'تسريحة الشعر',
    en: 'Hairstyling',
  },
  'mobile.hairCareGuide.hairstyling.subtitle': {
    ar: 'حسب نوع شعرك',
    en: 'According to your hair type',
  },
  'mobile.hairCareGuide.hairstyling.tip1': {
    ar: 'الشعر المجعد — كريم ليف ان بعد الغسيل',
    en: 'Curly hair — leave-in cream after washing',
  },
  'mobile.hairCareGuide.hairstyling.tip2': {
    ar: 'الشعر الناعم — موس رفع الجذور',
    en: 'Fine hair — root-lifting mousse',
  },
  'mobile.hairCareGuide.hairstyling.tip3': {
    ar: 'الشعر المموج — سبراي ملح البحر',
    en: 'Wavy hair — sea salt spray',
  },
  'mobile.hairCareGuide.hairstyling.tip4': {
    ar: 'الشعر المتعرج — زبدة شعر + ضفائر',
    en: 'Coily hair — hair butter + braids',
  },
  'mobile.hairCareGuide.bridalHair.title': {
    ar: 'شعر العروس',
    en: 'Bridal Hair',
  },
  'mobile.hairCareGuide.bridalHair.subtitle': {
    ar: 'تحضير للعرس',
    en: 'Preparation for the wedding',
  },
  'mobile.hairCareGuide.bridalHair.tip1': {
    ar: 'ابدئي العناية 6 أشهر قبل الزفاف',
    en: 'Start the care 6 months before the wedding',
  },
  'mobile.hairCareGuide.bridalHair.tip2': {
    ar: 'آخر قصة قبل الزفاف بأسبوعين',
    en: 'Last cut two weeks before the wedding',
  },
  'mobile.hairCareGuide.bridalHair.tip3': {
    ar: 'آخر صبغة قبل الزفاف بأسبوع',
    en: 'Last dye one week before the wedding',
  },
  'mobile.hairCareGuide.bridalHair.tip4': {
    ar: 'حمام زيت أسبوعياً في الشهر الأخير',
    en: 'An oil bath weekly in the final month',
  },
  'mobile.hairCareGuide.summerHair.title': {
    ar: 'شعر الصيف',
    en: 'Summer Hair',
  },
  'mobile.hairCareGuide.summerHair.subtitle': {
    ar: 'حماية من الشمس والبحر',
    en: 'Protection from the sun and sea',
  },
  'mobile.hairCareGuide.summerHair.tip1': {
    ar: 'قبعة أو وشاح — حماية من الأشعة',
    en: 'A hat or scarf — protection from UV rays',
  },
  'mobile.hairCareGuide.summerHair.tip2': {
    ar: 'بللي شعرك بماء عذب قبل البحر',
    en: 'Wet your hair with fresh water before the sea',
  },
  'mobile.hairCareGuide.summerHair.tip3': {
    ar: 'سبراي حماية من الشمس للشعر',
    en: 'Sunscreen spray for hair',
  },
  'mobile.hairCareGuide.summerHair.tip4': {
    ar: 'اشطفي فوراً بعد المسبح',
    en: 'Rinse immediately after the pool',
  },
  'mobile.hairCareGuide.hijabHair.title': {
    ar: 'شعر المحجبة',
    en: 'Hijab Hair',
  },
  'mobile.hairCareGuide.hijabHair.subtitle': {
    ar: 'عناية خاصة تحت الحجاب',
    en: 'Special care under the hijab',
  },
  'mobile.hairCareGuide.hijabHair.tip1': {
    ar: 'غطاء قطني تحت الحجاب — يمتص العرق',
    en: 'A cotton cap under the hijab — absorbs sweat',
  },
  'mobile.hairCareGuide.hijabHair.tip2': {
    ar: 'فكي شعرك 15 دقيقة يومياً للتهوية',
    en: 'Loosen your hair 15 minutes a day for ventilation',
  },
  'mobile.hairCareGuide.hijabHair.tip3': {
    ar: 'رطبي شعرك جيداً قبل لبس الحجاب',
    en: 'Moisturize your hair well before wearing the hijab',
  },
  'mobile.hairCareGuide.hijabHair.tip4': {
    ar: 'تجنبي ربط الشعر بشدة تحت الحجاب',
    en: 'Avoid tying your hair tightly under the hijab',
  },
  'mobile.hairCareGuide.balayage.title': {
    ar: 'البلياج',
    en: 'Balayage',
  },
  'mobile.hairCareGuide.balayage.subtitle': {
    ar: 'تقنية فرنسية — لون طبيعي',
    en: 'A French technique — natural color',
  },
  'mobile.hairCareGuide.balayage.tip1': {
    ar: 'تلوين يدوي — خصل مرسومة بالفرشاة',
    en: 'Hand-painted — strands painted with a brush',
  },
  'mobile.hairCareGuide.balayage.tip2': {
    ar: 'مظهر طبيعي — جذور أغمق وأطراف أفتح',
    en: 'A natural look — darker roots, lighter ends',
  },
  'mobile.hairCareGuide.balayage.tip3': {
    ar: 'يدوم 3-4 أشهر — نمو الجذور غير ملحوظ',
    en: 'Lasts 3-4 months — root growth is unnoticeable',
  },
  'mobile.hairCareGuide.balayage.tip4': {
    ar: 'أغلى من الصبغة — لكن صيانة أقل',
    en: 'More expensive than dye — but less maintenance',
  },
  'mobile.hairCareGuide.hairGloss.title': {
    ar: 'غلوس الشعر',
    en: 'Hair Gloss',
  },
  'mobile.hairCareGuide.hairGloss.subtitle': {
    ar: 'لمعان فوري — بدون أمونيا',
    en: 'Instant shine — ammonia-free',
  },
  'mobile.hairCareGuide.hairGloss.tip1': {
    ar: 'لمعان زجاجي — يعكس الضوء بشكل جميل',
    en: 'Glass-like shine — reflects light beautifully',
  },
  'mobile.hairCareGuide.hairGloss.tip2': {
    ar: 'شفاف أو ملون — ينعش لون شعركِ',
    en: 'Clear or tinted — refreshes your hair color',
  },
  'mobile.hairCareGuide.hairGloss.tip3': {
    ar: '20 دقيقة — في الصالون أو في البيت',
    en: '20 minutes — at the salon or at home',
  },
  'mobile.hairCareGuide.hairGloss.tip4': {
    ar: 'كل 4-6 أسابيع — للحفاظ على اللمعان',
    en: 'Every 4-6 weeks — to maintain the shine',
  },
  'mobile.hairCareGuide.bondRepair.title': {
    ar: 'ترميم روابط الشعر',
    en: 'Hair Bond Repair',
  },
  'mobile.hairCareGuide.bondRepair.subtitle': {
    ar: 'إصلاح من الداخل',
    en: 'Repair from within',
  },
  'mobile.hairCareGuide.bondRepair.tip1': {
    ar: 'يصلح الروابط المكسورة — داخل الشعرة',
    en: 'Repairs broken bonds — inside the hair',
  },
  'mobile.hairCareGuide.bondRepair.tip2': {
    ar: 'للشعر المصبوغ والمعالج حرارياً',
    en: 'For colored and heat-treated hair',
  },
  'mobile.hairCareGuide.bondRepair.tip3': {
    ar: 'علاج أسبوعي — 10 دقائق قبل الشامبو',
    en: 'A weekly treatment — 10 minutes before shampoo',
  },
  'mobile.hairCareGuide.bondRepair.tip4': {
    ar: 'نتائج فورية — شعر أنعم وأقوى',
    en: 'Instant results — softer, stronger hair',
  },
  'mobile.hairCareGuide.heatlessCurls.title': {
    ar: 'تمويج بدون حرارة',
    en: 'Heatless Curls',
  },
  'mobile.hairCareGuide.heatlessCurls.subtitle': {
    ar: 'شعر مموج — بدون ضرر',
    en: 'Wavy hair — without damage',
  },
  'mobile.hairCareGuide.heatlessCurls.tip1': {
    ar: 'الجوارب — طريقة سهلة لفات ناعمة',
    en: 'Socks — an easy way to soft curls',
  },
  'mobile.hairCareGuide.heatlessCurls.tip2': {
    ar: 'الروبن — شريط طويل تموجات مثالية',
    en: 'The robe belt — a long strip for perfect waves',
  },
  'mobile.hairCareGuide.heatlessCurls.tip3': {
    ar: 'لفات القماش — طرية للنوم مريحة',
    en: 'Fabric curlers — soft and comfortable for sleeping',
  },
  'mobile.hairCareGuide.heatlessCurls.tip4': {
    ar: 'قبل النوم — تصفيفة الليل = شعر الصباح',
    en: 'Before bed — the night style = morning hair',
  },
  'mobile.hairCareGuide.hairLoss.title': {
    ar: 'تساقط الشعر',
    en: 'Hair Loss',
  },
  'mobile.hairCareGuide.hairLoss.subtitle': {
    ar: 'أسباب وحلول لتساقط الشعر',
    en: 'Causes and solutions for hair loss',
  },
  'mobile.hairCareGuide.hairLoss.tip1': {
    ar: 'راجعي الطبيب — فقر دم غدة أو هرمونات',
    en: 'See a doctor — anemia, thyroid, or hormones',
  },
  'mobile.hairCareGuide.hairLoss.tip2': {
    ar: 'تدليك الفروة — 5 دقائق يومياً بزيت دافئ',
    en: 'Scalp massage — 5 minutes daily with warm oil',
  },
  'mobile.hairCareGuide.hairLoss.tip3': {
    ar: 'تغذية — بروتين حديد زنك فيتامين D',
    en: 'Nutrition — protein, iron, zinc, vitamin D',
  },
  'mobile.hairCareGuide.hairLoss.tip4': {
    ar: 'مينوكسيديل — العلاج المثبت علمياً',
    en: 'Minoxidil — the scientifically proven treatment',
  },
  'mobile.leadership.card.sheLeads.title': { ar: 'برنامج She Leads', en: 'She Leads Program' },
  'mobile.leadership.card.sheLeads.subtitle': {
    ar: 'تمكين المرأة في قطاع التجميل',
    en: 'Empowering women in the beauty industry',
  },
  'mobile.leadership.card.sheLeads.tip1': {
    ar: 'تدريب: مهارات القيادة والإدارة',
    en: 'Training: leadership and management skills',
  },
  'mobile.leadership.card.sheLeads.tip2': {
    ar: 'دعم: قروض صغيرة لبدء مشروعكِ',
    en: 'Support: microloans to start your business',
  },
  'mobile.leadership.card.sheLeads.tip3': {
    ar: 'شبكة: تواصلي مع رائدات أعمال',
    en: 'Network: connect with women entrepreneurs',
  },
  'mobile.leadership.card.sheLeads.tip4': {
    ar: 'شهادة: اعتماد مهني في القيادة',
    en: 'Certificate: professional leadership accreditation',
  },
  'mobile.leadership.card.entrepreneur.title': { ar: 'رائدة أعمال', en: 'Entrepreneur' },
  'mobile.leadership.card.entrepreneur.subtitle': {
    ar: 'ابدئي مشروعكِ في التجميل',
    en: 'Start your beauty business',
  },
  'mobile.leadership.card.entrepreneur.tip1': {
    ar: 'خطة عمل — نساعدكِ في كتابتها',
    en: 'Business plan — we help you write it',
  },
  'mobile.leadership.card.entrepreneur.tip2': {
    ar: 'تمويل — حتى 100,000 ر.س',
    en: 'Funding — up to 100,000 SAR',
  },
  'mobile.leadership.card.entrepreneur.tip3': {
    ar: 'موقع — دعم إيجار أول 6 أشهر',
    en: 'Location — rent support for the first 6 months',
  },
  'mobile.leadership.card.entrepreneur.tip4': {
    ar: 'إرشاد — مرشد شخصي لمدة سنة',
    en: 'Mentorship — a personal mentor for one year',
  },
  'mobile.leadership.card.successStories.title': { ar: 'قصص نجاح', en: 'Success Stories' },
  'mobile.leadership.card.successStories.subtitle': {
    ar: 'نماذج ملهمة من مجتمعنا',
    en: 'Inspiring examples from our community',
  },
  'mobile.leadership.card.successStories.tip1': {
    ar: 'نورة — افتتحت صالونها بعد 6 أشهر',
    en: 'Noura — opened her salon after 6 months',
  },
  'mobile.leadership.card.successStories.tip2': {
    ar: 'مها — 3 فروع في سنتين',
    en: 'Maha — 3 branches in two years',
  },
  'mobile.leadership.card.successStories.tip3': {
    ar: 'ريم — من عاملة لصاحبة علامة تجارية',
    en: 'Reem — from employee to brand owner',
  },
  'mobile.leadership.card.successStories.tip4': {
    ar: 'أنتِ القصة القادمة!',
    en: 'You are the next story!',
  },
  'mobile.leadership.card.leadershipGoals.title': { ar: 'أهداف القيادة', en: 'Leadership Goals' },
  'mobile.leadership.card.leadershipGoals.subtitle': {
    ar: 'خططي لمستقبلكِ المهني',
    en: 'Plan your professional future',
  },
  'mobile.leadership.card.leadershipGoals.tip1': {
    ar: 'قصير المدى: دورة قيادة (3 أشهر)',
    en: 'Short term: leadership course (3 months)',
  },
  'mobile.leadership.card.leadershipGoals.tip2': {
    ar: 'متوسط المدى: مشروع صغير (سنة)',
    en: 'Mid term: small business (one year)',
  },
  'mobile.leadership.card.leadershipGoals.tip3': {
    ar: 'طويل المدى: 3 فروع (3 سنوات)',
    en: 'Long term: 3 branches (3 years)',
  },
  'mobile.leadership.card.leadershipGoals.tip4': {
    ar: 'الرؤية: علامة تجارية سعودية عالمية',
    en: 'Vision: a Saudi brand with global reach',
  },
  'mobile.lifeEvents.card.lifeStages.subtitle': {
    ar: '28 سنة — لكل مرحلة جمالها',
    en: 'Age 28 — every stage has its beauty',
  },
  'mobile.lifeEvents.card.lifeStages.tip1': {
    ar: 'العمر: 28 سنة — مرحلة الشباب',
    en: 'Age: 28 — the youth stage',
  },
  'mobile.lifeEvents.card.lifeStages.tip2': {
    ar: 'التركيز: وقاية وترطيب وروتين ثابت',
    en: 'Focus: prevention, hydration, and a consistent routine',
  },
  'mobile.lifeEvents.card.lifeStages.tip3': {
    ar: 'النصيحة: ابدئي بالريتينول تدريجياً',
    en: 'Tip: start retinol gradually',
  },
  'mobile.lifeEvents.card.lifeStages.tip4': {
    ar: 'أساسيات: واقي شمس، مرطب، سيروم فيتامين سي',
    en: 'Basics: sunscreen, moisturizer, vitamin C serum',
  },
  'mobile.lifeEvents.card.brideJourney.title': { ar: 'رحلة العروس', en: 'Bridal Journey' },
  'mobile.lifeEvents.card.brideJourney.subtitle': {
    ar: 'الزفاف: 15 يونيو 2027',
    en: 'Wedding: June 15, 2027',
  },
  'mobile.lifeEvents.card.brideJourney.tip1': {
    ar: 'قبل 6 أشهر: بدء روتين العناية — تم',
    en: '6 months before: start your care routine — done',
  },
  'mobile.lifeEvents.card.brideJourney.tip2': {
    ar: 'قبل 5 أشهر: علاجات البشرة — تم',
    en: '5 months before: skin treatments — done',
  },
  'mobile.lifeEvents.card.brideJourney.tip3': {
    ar: 'قبل 4 أشهر: تجربة المكياج — قادم',
    en: '4 months before: makeup trial — upcoming',
  },
  'mobile.lifeEvents.card.brideJourney.tip4': {
    ar: 'قبل 3 أشهر: جلسة شعر تجريبية — قادم',
    en: '3 months before: hair trial — upcoming',
  },
  'mobile.lifeEvents.card.goldenBeauty.title': { ar: 'الجمال الذهبي', en: 'Golden Beauty' },
  'mobile.lifeEvents.card.goldenBeauty.subtitle': { ar: 'للمرأة فوق 50', en: 'For women over 50' },
  'mobile.lifeEvents.card.goldenBeauty.tip1': {
    ar: 'تركيز على الترطيب العميق والتغذية',
    en: 'Focus on deep hydration and nourishment',
  },
  'mobile.lifeEvents.card.goldenBeauty.tip2': {
    ar: 'منتجات غنية بالسيراميد والببتيدات',
    en: 'Products rich in ceramides and peptides',
  },
  'mobile.lifeEvents.card.goldenBeauty.tip4': {
    ar: 'الجمال الحقيقي — الثقة والراحة',
    en: 'True beauty — confidence and comfort',
  },
  'mobile.lifeEvents.card.careerBeauty.title': { ar: 'جمال المهنة', en: 'Career Beauty' },
  'mobile.lifeEvents.card.careerBeauty.subtitle': {
    ar: 'للمرأة العاملة',
    en: 'For the working woman',
  },
  'mobile.lifeEvents.card.careerBeauty.tip1': {
    ar: 'روتين سريع — 10 دقائق صباحاً',
    en: 'Quick routine — 10 minutes in the morning',
  },
  'mobile.lifeEvents.card.careerBeauty.tip2': {
    ar: 'مكياج عملي — BB كريم + ماسكارا + بلسم',
    en: 'Practical makeup — BB cream + mascara + balm',
  },
  'mobile.lifeEvents.card.careerBeauty.tip3': {
    ar: 'سبراي مرطب — للانتعاش طوال اليوم',
    en: 'Hydrating spray — freshness all day',
  },
  'mobile.lifeEvents.card.careerBeauty.tip4': {
    ar: 'جلسة أسبوعية — للعناية المركزة',
    en: 'Weekly session — intensive care',
  },
  'mobile.lifeEvents.card.postpartumRecovery.subtitle': {
    ar: 'للأم الجديدة',
    en: 'For the new mother',
  },
  'mobile.lifeEvents.card.postpartumRecovery.tip3': {
    ar: 'جلسات قصيرة — 45 دقيقة',
    en: 'Short sessions — 45 minutes',
  },
  'mobile.lifeEvents.card.postpartumRecovery.tip4': {
    ar: 'خدمة منزلية — لراحة الأم',
    en: 'Home service — for the comfort of the mother',
  },
  'mobile.lifeEvents.card.teenSkin.title': { ar: 'دليل بشرة المراهقات', en: 'Teen Skin Guide' },
  'mobile.lifeEvents.card.teenSkin.subtitle': { ar: '12-18 سنة', en: 'Ages 12-18' },
  'mobile.lifeEvents.card.teenSkin.tip1': {
    ar: 'أساسيات: غسول لطيف + مرطب + واقي شمس',
    en: 'Basics: gentle cleanser + moisturizer + sunscreen',
  },
  'mobile.lifeEvents.card.teenSkin.tip2': {
    ar: 'تجنبي: المنتجات القاسية والمقشرات',
    en: 'Avoid: harsh products and scrubs',
  },
  'mobile.lifeEvents.card.teenSkin.tip3': { ar: 'نصيحة: الأقل هو الأكثر', en: 'Tip: less is more' },
  'mobile.lifeEvents.card.teenSkin.tip4': {
    ar: 'دائماً: استشيري مختصة قبل أي علاج',
    en: 'Always: consult a specialist before any treatment',
  },
  'mobile.lifeEvents.card.twenties.title': { ar: 'العناية في العشرينات', en: 'Care in Your 20s' },
  'mobile.lifeEvents.card.twenties.subtitle': {
    ar: 'أساس قوي لمستقبل بشرتك',
    en: 'A strong foundation for the future of your skin',
  },
  'mobile.lifeEvents.card.twenties.tip1': {
    ar: 'واقي شمس يومي — أهم استثمار لبشرتك',
    en: 'Daily sunscreen — the best investment for your skin',
  },
  'mobile.lifeEvents.card.twenties.tip2': {
    ar: 'روتين أساسي — منظف مرطب واقي شمس',
    en: 'Basic routine — cleanser, moisturizer, sunscreen',
  },
  'mobile.lifeEvents.card.twenties.tip3': {
    ar: 'فيتامين C — ابدئي مبكراً',
    en: 'Vitamin C — start early',
  },
  'mobile.lifeEvents.card.twenties.tip4': {
    ar: 'لا ريبتينول بعد — بشرتك تنتجه طبيعياً',
    en: 'No retinol yet — your skin produces it naturally',
  },
  'mobile.lifeEvents.card.thirties.title': { ar: 'العناية في الثلاثينات', en: 'Care in Your 30s' },
  'mobile.lifeEvents.card.thirties.subtitle': {
    ar: 'وقاية وعلاج — بشرة متوازنة',
    en: 'Prevention and treatment — balanced skin',
  },
  'mobile.lifeEvents.card.thirties.tip1': {
    ar: 'ابدئي الريتينول — الكولاجين ينخفض',
    en: 'Start retinol — collagen is declining',
  },
  'mobile.lifeEvents.card.thirties.tip2': {
    ar: 'كريم عيون — أولى الخطوط الرفيعة',
    en: 'Eye cream — the first fine lines',
  },
  'mobile.lifeEvents.card.thirties.tip3': {
    ar: 'تقشير منتظم — مرة أسبوعياً AHA/BHA',
    en: 'Regular exfoliation — weekly AHA/BHA',
  },
  'mobile.lifeEvents.card.thirties.tip4': {
    ar: 'سيروم هيالورونيك — ترطيب مكثف',
    en: 'Hyaluronic serum — intense hydration',
  },
  'mobile.lifeEvents.card.forties.title': { ar: 'العناية في الأربعينات', en: 'Care in Your 40s' },
  'mobile.lifeEvents.card.forties.subtitle': {
    ar: 'تجديد وتقوية — بشرة ناضجة',
    en: 'Renewal and firming — mature skin',
  },
  'mobile.lifeEvents.card.forties.tip1': {
    ar: 'ببتيدات — تحفز الكولاجين وتشد البشرة',
    en: 'Peptides — boost collagen and firm the skin',
  },
  'mobile.lifeEvents.card.forties.tip3': {
    ar: 'مساج وجه — يحسن الدورة ويرفع البشرة',
    en: 'Face massage — improves circulation and lifts the skin',
  },
  'mobile.lifeEvents.card.forties.tip4': {
    ar: 'علاجات احترافية — ميكرونيدلنغ أو ليزر',
    en: 'Professional treatments — microneedling or laser',
  },
  'mobile.lifeEvents.card.fifties.title': { ar: 'العناية في الخمسينات', en: 'Care in Your 50s' },
  'mobile.lifeEvents.card.fifties.subtitle': {
    ar: 'جمال ناضج — عناية فاخرة',
    en: 'Mature beauty — luxurious care',
  },
  'mobile.lifeEvents.card.fifties.tip1': {
    ar: 'زيوت غنية — سكوالين أرغان ثمر الورد',
    en: 'Rich oils — squalane, argan, rosehip',
  },
  'mobile.lifeEvents.card.fifties.tip2': {
    ar: 'مرطبات كثيفة — كريمات وليس جل',
    en: 'Thick moisturizers — creams, not gels',
  },
  'mobile.lifeEvents.card.fifties.tip3': {
    ar: 'فحوصات هرمونية — الجمال بعد انقطاع الطمث',
    en: 'Hormone checks — beauty after menopause',
  },
  'mobile.lifeEvents.card.fifties.tip4': {
    ar: 'الجمال الحقيقي — الثقة والعناية الذاتية',
    en: 'True beauty — confidence and self-care',
  },
  'mobile.lifeEvents.card.sixties.title': { ar: 'العناية في الستينات', en: 'Care in Your 60s' },
  'mobile.lifeEvents.card.sixties.subtitle': {
    ar: 'بشرة جميلة في كل عمر',
    en: 'Beautiful skin at every age',
  },
  'mobile.lifeEvents.card.sixties.tip1': {
    ar: 'ترطيب مكثف — كريمات غنية بالسيراميد',
    en: 'Intense hydration — ceramide-rich creams',
  },
  'mobile.lifeEvents.card.sixties.tip2': {
    ar: 'مساج دوري — يحسن مرونة البشرة',
    en: 'Regular massage — improves skin elasticity',
  },
  'mobile.lifeEvents.card.sixties.tip3': {
    ar: 'حماية دائمة — البشرة الرقيقة تحتاج عناية',
    en: 'Constant protection — thin skin needs care',
  },
  'mobile.lifeEvents.card.sixties.tip4': {
    ar: 'الجمال من الداخل — تغذية نوم سعادة',
    en: 'Beauty from within — nutrition, sleep, happiness',
  },
  'mobile.lifeEvents.card.pcos.title': { ar: 'تكيس المبايض', en: 'PCOS' },
  'mobile.lifeEvents.card.pcos.subtitle': {
    ar: 'بشرة جميلة رغم الهرمونات',
    en: 'Beautiful skin despite hormones',
  },
  'mobile.lifeEvents.card.pcos.tip1': {
    ar: 'منتجات خالية من الزيوت — للبشرة الدهنية',
    en: 'Oil-free products — for oily skin',
  },
  'mobile.lifeEvents.card.pcos.tip2': {
    ar: 'نياسيناميد وزنك — لتنظيم الدهون',
    en: 'Niacinamide and zinc — to regulate oil',
  },
  'mobile.lifeEvents.card.pcos.tip3': {
    ar: 'تغذية منخفضة السكر — تقلل الالتهابات',
    en: 'Low-sugar nutrition — reduces inflammation',
  },
  'mobile.lifeEvents.card.pcos.tip4': {
    ar: 'استشيري طبيبك — بعض العلاجات تحتاج وصفة',
    en: 'Consult your doctor — some treatments need a prescription',
  },
  'mobile.lifeEvents.card.pregnancySafe.title': { ar: 'الآمن للحامل', en: 'Pregnancy-Safe' },
  'mobile.lifeEvents.card.pregnancySafe.subtitle': {
    ar: 'منتجات آمنة لكِ ولطفلكِ',
    en: 'Safe products for you and your baby',
  },
  'mobile.lifeEvents.card.pregnancySafe.tip1': {
    ar: 'مسموح: فيتامين C أزيليك هيالورونيك',
    en: 'Allowed: vitamin C, azelaic acid, hyaluronic acid',
  },
  'mobile.lifeEvents.card.pregnancySafe.tip2': {
    ar: 'بحذر: حمض الساليسيليك أقل من 2%',
    en: 'With caution: salicylic acid under 2%',
  },
  'mobile.lifeEvents.card.pregnancySafe.tip3': {
    ar: 'ممنوع: ريتينول هيدروكينون بوتوكس',
    en: 'Forbidden: retinol, hydroquinone, Botox',
  },
  'mobile.lifeEvents.card.pregnancySafe.tip4': {
    ar: 'اسألي طبيبتك قبل أي منتج جديد',
    en: 'Ask your doctor before any new product',
  },
  'mobile.lifeEvents.card.postpartumHair.title': {
    ar: 'شعر ما بعد الولادة',
    en: 'Postpartum Hair',
  },
  'mobile.lifeEvents.card.postpartumHair.subtitle': {
    ar: 'تساقط طبيعي — لا تقلقي',
    en: 'Natural shedding — do not worry',
  },
  'mobile.lifeEvents.card.postpartumHair.tip1': {
    ar: 'يبدأ بعد 3-6 أشهر — يستمر 3-6 أشهر',
    en: 'Starts after 3-6 months — lasts 3-6 months',
  },
  'mobile.lifeEvents.card.postpartumHair.tip2': {
    ar: 'تدليك الفروة — يحفز نمو شعر جديد',
    en: 'Scalp massage — stimulates new hair growth',
  },
  'mobile.lifeEvents.card.postpartumHair.tip3': {
    ar: 'فيتامينات ما بعد الولادة — حديد وزنك',
    en: 'Postpartum vitamins — iron and zinc',
  },
  'mobile.lifeEvents.card.postpartumHair.tip4': {
    ar: 'قصة أقصر — تخفف الثقل وتشجع النمو',
    en: 'A shorter cut — reduces weight and encourages growth',
  },
  'mobile.lifeEvents.card.menopause.title': { ar: 'حول انقطاع الطمث', en: 'About Menopause' },
  'mobile.lifeEvents.card.menopause.subtitle': {
    ar: 'جمالكِ في مرحلة التغيير',
    en: 'Your beauty through the change',
  },
  'mobile.lifeEvents.card.menopause.tip1': {
    ar: 'جفاف البشرة — انتقلي لكريمات أغنى',
    en: 'Dry skin — switch to richer creams',
  },
  'mobile.lifeEvents.card.menopause.tip2': {
    ar: 'احمرار وهبات — منتجات مهدئة',
    en: 'Redness and hot flashes — soothing products',
  },
  'mobile.lifeEvents.card.menopause.tip3': {
    ar: 'الكولاجين يقل — ببتيدات وسيراميد',
    en: 'Collagen declines — peptides and ceramides',
  },
  'mobile.lifeEvents.card.menopause.tip4': {
    ar: 'SPF ضروري — التصبغات تزيد',
    en: 'SPF is essential — pigmentation increases',
  },
  'mobile.lifeEvents.card.hormonalAcne.title': { ar: 'حبوب هرمونية', en: 'Hormonal Acne' },
  'mobile.lifeEvents.card.hormonalAcne.subtitle': {
    ar: 'علاج حبوب الذقن والفك',
    en: 'Treating chin and jaw acne',
  },
  'mobile.lifeEvents.card.hormonalAcne.tip1': {
    ar: 'مكانها: الذقن والفك — علامة هرمونية',
    en: 'Location: chin and jaw — a hormonal sign',
  },
  'mobile.lifeEvents.card.hormonalAcne.tip2': {
    ar: 'علاج: بنزويل بيروكسايد أو ساليسيليك',
    en: 'Treatment: benzoyl peroxide or salicylic acid',
  },
  'mobile.lifeEvents.card.hormonalAcne.tip3': {
    ar: 'قللي السكر والألبان — تزيد الالتهاب',
    en: 'Cut back on sugar and dairy — they increase inflammation',
  },
  'mobile.lifeEvents.card.hormonalAcne.tip4': {
    ar: 'إذا استمرت — راجعي طبيبة للهرمونات',
    en: 'If it persists — see a doctor about hormones',
  },
  'mobile.makeupGuide.card.base.title': { ar: 'أساس المكياج', en: 'Makeup Base' },
  'mobile.makeupGuide.card.base.subtitle': { ar: 'primer + foundation', en: 'primer + foundation' },
  'mobile.makeupGuide.card.base.tip1': {
    ar: 'برايمر — يملأ المسام ويثبت المكياج',
    en: 'Primer — fills pores and sets makeup',
  },
  'mobile.makeupGuide.card.base.tip2': {
    ar: 'بشرة رطبة — المرطب قبل البرايمر',
    en: 'Moisturized skin — moisturizer before primer',
  },
  'mobile.makeupGuide.card.base.tip3': {
    ar: 'فاونديشن — طبقة رقيقة',
    en: 'Foundation — a thin layer',
  },
  'mobile.makeupGuide.card.base.tip4': {
    ar: 'ادمجي بالإسفنجة — وليس الأصابع',
    en: 'Blend with a sponge — not your fingers',
  },
  'mobile.makeupGuide.card.brushes.title': { ar: 'فرش المكياج', en: 'Makeup Brushes' },
  'mobile.makeupGuide.card.brushes.subtitle': {
    ar: 'دليل التنظيف والاستخدام',
    en: 'Cleaning and usage guide',
  },
  'mobile.makeupGuide.card.brushes.tip1': {
    ar: 'نظفي الفرش أسبوعياً — بشامبو أطفال',
    en: 'Clean brushes weekly — with baby shampoo',
  },
  'mobile.makeupGuide.card.brushes.tip2': {
    ar: 'جففيها أفقياً — لا عمودياً',
    en: 'Dry them flat — not upright',
  },
  'mobile.makeupGuide.card.brushes.tip3': {
    ar: 'استبدلي الفرش كل 6-12 شهر',
    en: 'Replace brushes every 6-12 months',
  },
  'mobile.makeupGuide.card.brushes.tip4': {
    ar: 'لا تشاركي فرشك مع أحد',
    en: 'Never share your brushes',
  },
  'mobile.makeupGuide.card.eyes.title': { ar: 'مكياج العيون', en: 'Eye Makeup' },
  'mobile.makeupGuide.card.eyes.subtitle': { ar: 'تقنيات أساسية', en: 'Essential techniques' },
  'mobile.makeupGuide.card.eyes.tip1': {
    ar: 'اللون الفاتح — على كامل الجفن',
    en: 'Light shade — across the whole lid',
  },
  'mobile.makeupGuide.card.eyes.tip2': {
    ar: 'اللون المتوسط — على الثنية',
    en: 'Medium shade — on the crease',
  },
  'mobile.makeupGuide.card.eyes.tip3': {
    ar: 'اللون اللامع — في الزاوية الداخلية',
    en: 'Shimmer shade — in the inner corner',
  },
  'mobile.makeupGuide.card.eyes.tip4': {
    ar: 'ادمجي جيداً — لا خطوط قاسية',
    en: 'Blend well — no harsh lines',
  },
  'mobile.makeupGuide.card.lips.title': { ar: 'مكياج الشفاه', en: 'Lip Makeup' },
  'mobile.makeupGuide.card.lips.subtitle': { ar: 'لون يدوم طويلاً', en: 'Long-lasting color' },
  'mobile.makeupGuide.card.lips.tip1': {
    ar: 'قشري الشفاه — سكر + عسل',
    en: 'Exfoliate lips — sugar + honey',
  },
  'mobile.makeupGuide.card.lips.tip2': {
    ar: 'رطبي قبل 10 دقائق من اللون',
    en: 'Moisturize 10 minutes before color',
  },
  'mobile.makeupGuide.card.lips.tip3': {
    ar: 'حددي الشفاه — يمنع التطاير',
    en: 'Line your lips — prevents bleeding',
  },
  'mobile.makeupGuide.card.lips.tip4': {
    ar: 'طبقتان — وامسحي الزائد بمنديل',
    en: 'Two layers — blot the excess with a tissue',
  },
  'mobile.makeupGuide.card.contour.title': { ar: 'الكونتور', en: 'Contour' },
  'mobile.makeupGuide.card.contour.subtitle': { ar: 'نحت الوجه', en: 'Face sculpting' },
  'mobile.makeupGuide.card.contour.tip1': {
    ar: 'داكن — تحت عظمة الخد',
    en: 'Dark — under the cheekbone',
  },
  'mobile.makeupGuide.card.contour.tip2': {
    ar: 'فاتح — فوق عظمة الخد',
    en: 'Light — above the cheekbone',
  },
  'mobile.makeupGuide.card.contour.tip3': {
    ar: 'امزجي جيداً — لا خطوط ظاهرة',
    en: 'Blend well — no visible lines',
  },
  'mobile.makeupGuide.card.contour.tip4': {
    ar: 'الكريمي أسهل من البودرة للمبتدئات',
    en: 'Cream is easier than powder for beginners',
  },
  'mobile.makeupGuide.card.blush.title': { ar: 'أحمر الخدود', en: 'Blush' },
  'mobile.makeupGuide.card.blush.subtitle': { ar: 'لمسة حيوية', en: 'A touch of radiance' },
  'mobile.makeupGuide.card.blush.tip1': {
    ar: 'ضعيه على تفاحة الخد',
    en: 'Apply to the apple of the cheek',
  },
  'mobile.makeupGuide.card.blush.tip2': {
    ar: 'امزجي للأعلى نحو الصدغ',
    en: 'Blend upward toward the temple',
  },
  'mobile.makeupGuide.card.blush.tip3': {
    ar: 'الكريمي — للبشرة الجافة',
    en: 'Cream — for dry skin',
  },
  'mobile.makeupGuide.card.blush.tip4': {
    ar: 'البودرة — للبشرة الدهنية',
    en: 'Powder — for oily skin',
  },
  'mobile.makeupGuide.card.bridal.title': { ar: 'مكياج العروس', en: 'Bridal Makeup' },
  'mobile.makeupGuide.card.bridal.subtitle': { ar: 'إطلالة الزفاف', en: 'The wedding look' },
  'mobile.makeupGuide.card.bridal.tip1': {
    ar: 'جلسة تجريبية قبل الزفاف بشهر',
    en: 'A trial session one month before the wedding',
  },
  'mobile.makeupGuide.card.bridal.tip2': {
    ar: 'رطبي بشرتك جيداً أسبوع الزفاف',
    en: 'Hydrate your skin well the week of the wedding',
  },
  'mobile.makeupGuide.card.bridal.tip3': {
    ar: 'ابدئي المكياج 3 ساعات قبل الحفل',
    en: 'Start makeup 3 hours before the ceremony',
  },
  'mobile.makeupGuide.card.bridal.tip4': {
    ar: 'مكياج دائم — للصور والفيديو',
    en: 'Long-wear makeup — for photos and video',
  },
  'mobile.makeupGuide.card.naturalLook.subtitle': {
    ar: 'إطلالة يومية خفيفة',
    en: 'A light everyday look',
  },
  'mobile.makeupGuide.card.naturalLook.tip1': {
    ar: 'BB كريم — بدل الفاونديشن الثقيل',
    en: 'BB cream — instead of heavy foundation',
  },
  'mobile.makeupGuide.card.naturalLook.tip2': {
    ar: 'هايلايتر — على عظمة الخد فقط',
    en: 'Highlighter — on the cheekbone only',
  },
  'mobile.makeupGuide.card.naturalLook.tip3': {
    ar: 'ماسكارا بنية — طبيعية أكثر',
    en: 'Brown mascara — more natural',
  },
  'mobile.makeupGuide.card.naturalLook.tip4': {
    ar: 'تينت شفاه — لون طبيعي خفيف',
    en: 'Lip tint — a light natural color',
  },
  'mobile.makeupGuide.card.glam.title': { ar: 'مكياج لامع', en: 'Glam Makeup' },
  'mobile.makeupGuide.card.glam.subtitle': {
    ar: 'للمناسبات والسهرات',
    en: 'For occasions and evenings',
  },
  'mobile.makeupGuide.card.glam.tip1': {
    ar: 'جليتر — على الجفن فقط',
    en: 'Glitter — on the lid only',
  },
  'mobile.makeupGuide.card.glam.tip2': {
    ar: 'برايمر جليتر — يثبت اللمعان',
    en: 'Glitter primer — sets the sparkle',
  },
  'mobile.makeupGuide.card.glam.tip3': {
    ar: 'هايلايتر على عظمة الترقوة',
    en: 'Highlighter on the collarbone',
  },
  'mobile.makeupGuide.card.glam.tip4': {
    ar: 'منطقة واحدة لامعة — ليس الوجه كله',
    en: 'One shiny area — not the whole face',
  },
  'mobile.makeupGuide.card.removal.title': { ar: 'إزالة المكياج', en: 'Makeup Removal' },
  'mobile.makeupGuide.card.removal.subtitle': {
    ar: 'خطوة لا تهمليها',
    en: 'A step you must not skip',
  },
  'mobile.makeupGuide.card.removal.tip1': {
    ar: 'ماء ميسيلار — للوجه والعيون',
    en: 'Micellar water — for face and eyes',
  },
  'mobile.makeupGuide.card.removal.tip2': {
    ar: 'زيت تنظيف — يذيب المكياج المقاوم',
    en: 'Cleansing oil — dissolves stubborn makeup',
  },
  'mobile.makeupGuide.card.removal.tip3': {
    ar: 'اغسلي بعد المزيل — خطوتين دائماً',
    en: 'Wash after removing — always two steps',
  },
  'mobile.makeupGuide.card.removal.tip4': {
    ar: 'لا تنامي أبداً بالمكياج',
    en: 'Never sleep in makeup',
  },
  'mobile.makeupGuide.card.faceShapes.title': { ar: 'أشكال الوجه', en: 'Face Shapes' },
  'mobile.makeupGuide.card.faceShapes.subtitle': {
    ar: 'حددي شكل وجهكِ',
    en: 'Determine your face shape',
  },
  'mobile.makeupGuide.card.faceShapes.tip1': {
    ar: 'بيضاوي — متناسق يناسبه كل شيء',
    en: 'Oval — balanced, suits everything',
  },
  'mobile.makeupGuide.card.faceShapes.tip2': {
    ar: 'قلب — جبهة عريضة ذقن مدبب',
    en: 'Heart — wide forehead, pointed chin',
  },
  'mobile.makeupGuide.card.faceShapes.tip3': {
    ar: 'دائري — خدود ممتلئة متساوي',
    en: 'Round — full, even cheeks',
  },
  'mobile.makeupGuide.card.faceShapes.tip4': {
    ar: 'مربع — فك عريض زوايا واضحة',
    en: 'Square — wide jaw, defined angles',
  },
  'mobile.makeupGuide.card.contourGuide.title': { ar: 'دليل الكونتور', en: 'Contour Guide' },
  'mobile.makeupGuide.card.contourGuide.subtitle': {
    ar: 'نحت الوجه حسب الشكل',
    en: 'Face sculpting by shape',
  },
  'mobile.makeupGuide.card.contourGuide.tip1': {
    ar: 'بيضاوي: خفيف تحت عظمة الخد',
    en: 'Oval: light under the cheekbone',
  },
  'mobile.makeupGuide.card.contourGuide.tip2': {
    ar: 'دائري: تحت الخد بكثافة',
    en: 'Round: heavily under the cheek',
  },
  'mobile.makeupGuide.card.contourGuide.tip3': {
    ar: 'مربع: زوايا الفك — لتحديد وتنعيم',
    en: 'Square: jaw angles — to define and soften',
  },
  'mobile.makeupGuide.card.contourGuide.tip4': {
    ar: 'قلب: الذقن — لتقليصه بصرياً',
    en: 'Heart: the chin — to visually shorten it',
  },
  'mobile.makeupGuide.card.blushPlacement.title': { ar: 'موضع البلاشر', en: 'Blush Placement' },
  'mobile.makeupGuide.card.blushPlacement.subtitle': {
    ar: 'ارفعي — لا تنزلي',
    en: 'Lift up — do not drag down',
  },
  'mobile.makeupGuide.card.blushPlacement.tip1': {
    ar: 'بيضاوي: على تفاحة الخد للأعلى',
    en: 'Oval: on the apple of the cheek, upward',
  },
  'mobile.makeupGuide.card.blushPlacement.tip2': {
    ar: 'دائري: أعلى الخد بزاوية حادة',
    en: 'Round: high on the cheek at a sharp angle',
  },
  'mobile.makeupGuide.card.blushPlacement.tip3': {
    ar: 'مربع: مركز الخد دائري لتليين',
    en: 'Square: round the center of the cheek to soften',
  },
  'mobile.makeupGuide.card.blushPlacement.tip4': {
    ar: 'قلب: منخفض تحت تفاحة الخد',
    en: 'Heart: low, under the apple of the cheek',
  },
  'mobile.makeupGuide.card.brows.title': { ar: 'شكل الحواجب', en: 'Eyebrow Shape' },
  'mobile.makeupGuide.card.brows.subtitle': {
    ar: 'الحاجب المناسب لوجهكِ',
    en: 'The brow that suits your face',
  },
  'mobile.makeupGuide.card.brows.tip1': {
    ar: 'بيضاوي: طبيعية — قوس ناعم',
    en: 'Oval: natural — soft arch',
  },
  'mobile.makeupGuide.card.brows.tip2': {
    ar: 'دائري: قوس مرتفع — يطيل الوجه',
    en: 'Round: high arch — lengthens the face',
  },
  'mobile.makeupGuide.card.brows.tip3': {
    ar: 'مربع: زوايا حادة — توازن الفك',
    en: 'Square: sharp angles — balances the jaw',
  },
  'mobile.makeupGuide.card.brows.tip4': {
    ar: 'قلب: مقوسة — تلطف الجبهة',
    en: 'Heart: curved — softens the forehead',
  },
  'mobile.makeupGuide.card.lipLiner.title': { ar: 'تحديد الشفاه', en: 'Lip Lining' },
  'mobile.makeupGuide.card.lipLiner.subtitle': {
    ar: 'تقنيات لشفاه أجمل',
    en: 'Techniques for prettier lips',
  },
  'mobile.makeupGuide.card.lipLiner.tip1': {
    ar: 'تحديد فوق الخط الطبيعي بقليل',
    en: 'Line slightly above the natural line',
  },
  'mobile.makeupGuide.card.lipLiner.tip2': {
    ar: 'هايلايتر فوق قوس كيوبيد',
    en: 'Highlighter above the cupid bow',
  },
  'mobile.makeupGuide.card.lipLiner.tip3': {
    ar: 'لونين — فاتح بالوسط داكن بالأطراف',
    en: 'Two shades — light in the center, dark at the edges',
  },
  'mobile.makeupGuide.card.lipLiner.tip4': {
    ar: 'غلوس على المركز — عمق بصري',
    en: 'Gloss in the center — visual depth',
  },
  'mobile.makeupGuide.card.partyPrep.title': { ar: 'تحضير الحفلة', en: 'Party Prep' },
  'mobile.makeupGuide.card.partyPrep.subtitle': {
    ar: 'خطة جمالية قبل المناسبة',
    en: 'A beauty plan before the occasion',
  },
  'mobile.makeupGuide.card.partyPrep.tip1': {
    ar: 'قبل بأسبوع: فيشل + حواجب + إزالة شعر',
    en: 'A week before: facial + brows + hair removal',
  },
  'mobile.makeupGuide.card.partyPrep.tip2': {
    ar: 'قبل بيوم: عناية — نامي 8 ساعات',
    en: 'A day before: self-care — sleep 8 hours',
  },
  'mobile.makeupGuide.card.partyPrep.tip3': {
    ar: 'يوم الحفلة: مكياج قبلها بـ 3 ساعات',
    en: 'Party day: makeup 3 hours before',
  },
  'mobile.makeupGuide.card.partyPrep.tip4': {
    ar: 'حقيبة طوارئ: روج + ورق نشاف',
    en: 'Emergency kit: lipstick + blotting paper',
  },
  'mobile.makeupGuide.card.interview.title': { ar: 'إطلالة المقابلة', en: 'Interview Look' },
  'mobile.makeupGuide.card.interview.subtitle': {
    ar: 'ثقة — واحترافية',
    en: 'Confidence — and professionalism',
  },
  'mobile.makeupGuide.card.interview.tip1': {
    ar: 'مكياج طبيعي — BB كريم + ماسكارا',
    en: 'Natural makeup — BB cream + mascara',
  },
  'mobile.makeupGuide.card.interview.tip2': {
    ar: 'أظافر محايدة — Nude أو فرنسي',
    en: 'Neutral nails — nude or French',
  },
  'mobile.makeupGuide.card.interview.tip3': {
    ar: 'تسريحة مرتبة — كعكة منخفضة',
    en: 'Neat hairstyle — a low bun',
  },
  'mobile.makeupGuide.card.interview.tip4': {
    ar: 'عطر خفيف — منعش وغير قوي',
    en: 'Light perfume — fresh, not overpowering',
  },
  'mobile.makeupGuide.card.graduation.title': { ar: 'إطلالة التخرج', en: 'Graduation Look' },
  'mobile.makeupGuide.card.graduation.subtitle': {
    ar: 'صور تدوم — إطلالة تبقى',
    en: 'Photos that last — a look that stays',
  },
  'mobile.makeupGuide.card.graduation.tip1': {
    ar: 'مكياج ثابت — الصور تبقى للأبد',
    en: 'Long-wear makeup — photos last forever',
  },
  'mobile.makeupGuide.card.graduation.tip2': {
    ar: 'أحمر شفاه مات — لا ينتقل للشهادة',
    en: 'Matte lipstick — will not transfer to the certificate',
  },
  'mobile.makeupGuide.card.graduation.tip3': {
    ar: 'تسريحة تتحمل القبعة',
    en: 'A hairstyle that survives the cap',
  },
  'mobile.makeupGuide.card.graduation.tip4': {
    ar: 'واقي شمس — الحفل في النهار',
    en: 'Sunscreen — the ceremony is in daylight',
  },
  'mobile.makeupGuide.card.dateNight.title': { ar: 'إطلالة الموعد', en: 'Date Look' },
  'mobile.makeupGuide.card.dateNight.subtitle': {
    ar: 'جاذبية — بدون مبالغة',
    en: 'Alluring — without exaggeration',
  },
  'mobile.makeupGuide.card.dateNight.tip1': {
    ar: 'بشرة متوهجة — هايلايتر على الخد',
    en: 'Glowing skin — highlighter on the cheek',
  },
  'mobile.makeupGuide.card.dateNight.tip2': {
    ar: 'عيون سموكي ناعمة — ألوان دافئة',
    en: 'Soft smoky eyes — warm tones',
  },
  'mobile.makeupGuide.card.dateNight.tip3': {
    ar: 'شفاه طبيعية — تينت شفاف',
    en: 'Natural lips — a sheer tint',
  },
  'mobile.makeupGuide.card.dateNight.tip4': {
    ar: 'عطر على نقاط النبض',
    en: 'Perfume on pulse points',
  },
  'mobile.makeupGuide.card.photoReady.title': { ar: 'جاهزة للصور', en: 'Photo Ready' },
  'mobile.makeupGuide.card.photoReady.subtitle': {
    ar: 'مكياج جميل في الكاميرا',
    en: 'Makeup that looks beautiful on camera',
  },
  'mobile.makeupGuide.card.photoReady.tip1': {
    ar: 'تجنبي SPF العالي — وميض في الفلاش',
    en: 'Avoid high SPF — flashback in photos',
  },
  'mobile.makeupGuide.card.photoReady.tip2': {
    ar: 'هايلايتر بودرة — وليس كريمي',
    en: 'Powder highlighter — not cream',
  },
  'mobile.makeupGuide.card.photoReady.tip3': {
    ar: 'ألوان معتدلة — الفلاش يفتح الألوان',
    en: 'Moderate colors — flash brightens shades',
  },
  'mobile.makeupGuide.card.photoReady.tip4': {
    ar: 'بخاخ تثبيت — آخر خطوة قبل الصور',
    en: 'Setting spray — the last step before photos',
  },
  'mobile.makeupGuide.card.fairSkin.title': { ar: 'البشرة الفاتحة', en: 'Fair Skin' },
  'mobile.makeupGuide.card.fairSkin.subtitle': {
    ar: 'عناية خاصة بالبشرة الفاتحة',
    en: 'Special care for fair skin',
  },
  'mobile.makeupGuide.card.fairSkin.tip1': {
    ar: 'SPF 50+ — البشرة الفاتحة تحترق بسرعة',
    en: 'SPF 50+ — fair skin burns quickly',
  },
  'mobile.makeupGuide.card.fairSkin.tip2': {
    ar: 'ميل للاحمرار — منتجات مهدئة',
    en: 'Prone to redness — soothing products',
  },
  'mobile.makeupGuide.card.fairSkin.tip3': {
    ar: 'ألوان: وردي خوخي بيج فاتح',
    en: 'Colors: pink, peach, light beige',
  },
  'mobile.makeupGuide.card.fairSkin.tip4': {
    ar: 'هايلايتر شمباني — وليس ذهبي',
    en: 'Champagne highlighter — not gold',
  },
  'mobile.makeupGuide.card.mediumSkin.title': { ar: 'البشرة المتوسطة', en: 'Medium Skin' },
  'mobile.makeupGuide.card.mediumSkin.subtitle': {
    ar: 'البشرة الزيتونية والقمحية',
    en: 'Olive and wheat-toned skin',
  },
  'mobile.makeupGuide.card.mediumSkin.tip1': {
    ar: 'SPF 30-50 — الميلانين يحمي جزئياً',
    en: 'SPF 30-50 — melanin protects partially',
  },
  'mobile.makeupGuide.card.mediumSkin.tip2': {
    ar: 'ميل للتصبغات — فيتامين C أساسي',
    en: 'Prone to pigmentation — vitamin C is essential',
  },
  'mobile.makeupGuide.card.mediumSkin.tip3': {
    ar: 'ألوان: برونزي خوخي تيراكوتا',
    en: 'Colors: bronze, peach, terracotta',
  },
  'mobile.makeupGuide.card.mediumSkin.tip4': {
    ar: 'هايلايتر ذهبي — للأندرتون الدافئ',
    en: 'Gold highlighter — for warm undertones',
  },
  'mobile.makeupGuide.card.darkSkin.title': { ar: 'البشرة الداكنة', en: 'Dark Skin' },
  'mobile.makeupGuide.card.darkSkin.subtitle': { ar: 'غنية بالميلانين', en: 'Rich in melanin' },
  'mobile.makeupGuide.card.darkSkin.tip1': {
    ar: 'ميل للجفاف — ترطيب بزبدة الشيا',
    en: 'Prone to dryness — hydrate with shea butter',
  },
  'mobile.makeupGuide.card.darkSkin.tip2': {
    ar: 'تصبغات — فيتامين C وهيالورونيك',
    en: 'Pigmentation — vitamin C and hyaluronic acid',
  },
  'mobile.makeupGuide.card.darkSkin.tip3': {
    ar: 'ألوان: برقوقي عنابي ذهبي',
    en: 'Colors: plum, burgundy, gold',
  },
  'mobile.makeupGuide.card.darkSkin.tip4': {
    ar: 'SPF 30+ — حماية ضرورية',
    en: 'SPF 30+ — essential protection',
  },
  'mobile.makeupGuide.card.undertone.title': { ar: 'الأندرتون', en: 'Undertone' },
  'mobile.makeupGuide.card.undertone.subtitle': {
    ar: 'اعرفي أندرتونكِ — تناسق',
    en: 'Know your undertone — harmony',
  },
  'mobile.makeupGuide.card.undertone.tip1': {
    ar: 'دافئ: عروق خضراء — الذهب يناسبك',
    en: 'Warm: green veins — gold suits you',
  },
  'mobile.makeupGuide.card.undertone.tip2': {
    ar: 'بارد: عروق زرقاء — الفضة تناسبك',
    en: 'Cool: blue veins — silver suits you',
  },
  'mobile.makeupGuide.card.undertone.tip3': {
    ar: 'محايد: مزيج — الذهب والفضة',
    en: 'Neutral: a mix — gold and silver',
  },
  'mobile.makeupGuide.card.undertone.tip4': {
    ar: 'اختبار: ورقة بيضاء — قارني',
    en: 'Test: a white sheet — compare',
  },
  'mobile.makeupGuide.card.shadeMatch.title': { ar: 'مطابقة الألوان', en: 'Shade Matching' },
  'mobile.makeupGuide.card.shadeMatch.subtitle': {
    ar: 'اختاري الدرجة المثالية',
    en: 'Choose the perfect shade',
  },
  'mobile.makeupGuide.card.shadeMatch.tip1': {
    ar: 'جربي على خط الفك — ليس اليد',
    en: 'Try it on the jawline — not your hand',
  },
  'mobile.makeupGuide.card.shadeMatch.tip2': {
    ar: 'ضوء طبيعي — الإضاءة تخدع',
    en: 'Natural light — indoor lighting deceives',
  },
  'mobile.makeupGuide.card.shadeMatch.tip3': {
    ar: 'انتظري 5 دقائق — اللون يتغير',
    en: 'Wait 5 minutes — the color changes',
  },
  'mobile.makeupGuide.card.shadeMatch.tip4': {
    ar: 'درجتين: صيف أغمق — شتاء أفتح',
    en: 'Two shades: darker in summer — lighter in winter',
  },
  'mobile.makeupGuide.card.glasses.title': { ar: 'مكياج النظارات', en: 'Glasses Makeup' },
  'mobile.makeupGuide.card.glasses.subtitle': {
    ar: 'إطلالة جميلة مع النظارة',
    en: 'A pretty look with glasses',
  },
  'mobile.makeupGuide.card.glasses.tip1': {
    ar: 'رموش مرفوعة — لا تلمس العدسات',
    en: 'Curled lashes — keep off the lenses',
  },
  'mobile.makeupGuide.card.glasses.tip2': {
    ar: 'هايلايتر تحت الحاجب — يبرز العين',
    en: 'Highlighter under the brow — highlights the eye',
  },
  'mobile.makeupGuide.card.glasses.tip3': {
    ar: 'ظلال مات — ليس لامعاً',
    en: 'Matte shadows — not shimmery',
  },
  'mobile.makeupGuide.card.glasses.tip4': {
    ar: 'حاجبين مرتبين — الإطار يبرزهما',
    en: 'Neat brows — the frame draws attention to them',
  },
  'mobile.makeupGuide.card.lenses.title': { ar: 'العدسات والمكياج', en: 'Lenses and Makeup' },
  'mobile.makeupGuide.card.lenses.subtitle': {
    ar: 'عناية آمنة لعيون جميلة',
    en: 'Safe care for beautiful eyes',
  },
  'mobile.makeupGuide.card.lenses.tip1': {
    ar: 'العدسات أولاً — ثم المكياج',
    en: 'Lenses first — then makeup',
  },
  'mobile.makeupGuide.card.lenses.tip2': {
    ar: 'قطرات مرطبة — قبل وبعد المكياج',
    en: 'Moisturizing drops — before and after makeup',
  },
  'mobile.makeupGuide.card.lenses.tip3': {
    ar: 'تجنبي الجليتر — يسقط في العين',
    en: 'Avoid glitter — it falls into the eye',
  },
  'mobile.makeupGuide.card.lenses.tip4': {
    ar: 'جديدي الماسكارا — كل 3 أشهر',
    en: 'Replace your mascara — every 3 months',
  },
} as const satisfies Record<string, { ar: string; en: string }>;
