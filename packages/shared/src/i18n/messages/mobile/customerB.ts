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
} as const satisfies Record<string, { ar: string; en: string }>;
