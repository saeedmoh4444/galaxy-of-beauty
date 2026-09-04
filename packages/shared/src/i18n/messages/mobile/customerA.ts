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
  'bookings.detail.technician-id': { ar: 'رقم مقدمة الخدمة', en: 'Service Provider ID' },
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
    ar: '* ستقوم مقدمة الخدمة بتأكيد الموعد النهائي',
    en: '* The service provider will confirm the final appointment',
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
  'aiAssistant.title': { ar: 'بيوتي AI', en: 'Beauty AI' },
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

  // ── accessories-guide ──
  'accessoriesGuide.title': { ar: ' دليل الإكسسوارات', en: 'Accessories Guide' },
  'accessoriesGuide.subtitle': {
    ar: 'اللمسة الأخيرة لإطلالة متكاملة',
    en: 'The final touch to a complete look',
  },

  // ── ai-routine ──
  'aiRoutine.title': { ar: ' روتين العناية الذكي', en: 'Smart Skincare Routine' },
  'aiRoutine.subtitle': {
    ar: 'اختاري نوع بشرتكِ لتوليد روتين مخصص',
    en: 'Choose your skin type to generate a personalized routine',
  },
  'aiRoutine.skin-dry': { ar: 'جافة', en: 'Dry' },
  'aiRoutine.skin-oily': { ar: 'دهنية', en: 'Oily' },
  'aiRoutine.skin-combination': { ar: 'مختلطة', en: 'Combination' },
  'aiRoutine.skin-normal': { ar: 'عادية', en: 'Normal' },
  'aiRoutine.generate': { ar: ' توليد الروتين', en: 'Generate Routine' },
  'aiRoutine.morning': { ar: '️ الصباح ({time})', en: 'Morning ({time})' },
  'aiRoutine.evening': { ar: ' المساء ({time})', en: 'Evening ({time})' },
  'aiRoutine.tips': { ar: ' نصائح', en: 'Tips' },
  'aiRoutine.reset': { ar: ' إعادة', en: 'Reset' },

  // ── allergen-checker ──
  'allergenChecker.title': { ar: ' فاحص الحساسية', en: 'Allergen Checker' },
  'allergenChecker.subtitle': {
    ar: 'تجنبي المكونات اللي تسبب حساسية لبشرتكِ',
    en: 'Avoid ingredients that irritate your skin',
  },
  'allergenChecker.search-placeholder': {
    ar: 'ابحثي عن منتج أو مكون...',
    en: 'Search for a product or ingredient...',
  },
  'allergenChecker.my-allergies': { ar: ' مسببات الحساسية لديّ', en: 'My Allergens' },
  'allergenChecker.risk-high': { ar: 'عالي', en: 'High' },
  'allergenChecker.risk-medium': { ar: 'متوسط', en: 'Medium' },
  'allergenChecker.risk-low': { ar: 'منخفض', en: 'Low' },
  'allergenChecker.avoid-title': { ar: ' منتجات يجب تجنبها', en: 'Products to Avoid' },
  'allergenChecker.caution-title': { ar: ' الحذر مطلوب', en: 'Caution Needed' },
  'allergenChecker.tip-title': { ar: ' نصيحة', en: 'Tip' },
  'allergenChecker.tip-text': {
    ar: 'اقرئي المكونات دائماً قبل شراء أي منتج. المكونات مرتبة تنازلياً حسب النسبة — أول 5 مكونات هي الأهم.',
    en: 'Always read the ingredients before buying any product. Ingredients are listed in descending order — the first 5 are the most important.',
  },

  // ── beauty-academy ──
  'beautyAcademy.title': { ar: ' أكاديمية الجمال', en: 'Beauty Academy' },
  'beautyAcademy.subtitle': {
    ar: 'تعلمي كل شيء عن عالم التجميل والعناية',
    en: 'Learn everything about beauty and skincare',
  },

  // ── beauty-advisor ──
  'beautyAdvisor.title': { ar: ' مجرة الجمال', en: 'Beauty Galaxy' },
  'beautyAdvisor.subtitle': {
    ar: 'مستشارة جمالكِ الشخصية',
    en: 'Your personal beauty consultant',
  },
  'beautyAdvisor.welcome': {
    ar: ' مرحباً! أنا مجرة الجمال، مستشارة جمالكِ الشخصية. اسأليني أي سؤال عن العناية والتجميل!',
    en: "Welcome! I'm Beauty Galaxy, your personal beauty consultant. Ask me anything about skincare and makeup!",
  },
  'beautyAdvisor.no-answer': {
    ar: 'عذراً، لم أستطع الإجابة.',
    en: "Sorry, I couldn't answer that.",
  },
  'beautyAdvisor.typing': { ar: ' جاري الكتابة...', en: 'Typing...' },
  'beautyAdvisor.placeholder': { ar: 'اكتبي سؤالكِ...', en: 'Type your question...' },

  // ── beauty-analytics ──
  'beautyAnalytics.title': { ar: ' تحليلات الجمال', en: 'Beauty Analytics' },
  'beautyAnalytics.bookings': { ar: 'حجوزات', en: 'Bookings' },
  'beautyAnalytics.completed': { ar: 'مكتملة', en: 'Completed' },
  'beautyAnalytics.rate': { ar: 'نسبة', en: 'Rate' },
  'beautyAnalytics.currency': { ar: 'ر.س', en: 'SAR' },
  'beautyAnalytics.by-category': { ar: ' الحجوزات حسب الفئة', en: 'Bookings by Category' },
  'beautyAnalytics.monthly-trend': { ar: ' الاتجاه الشهري', en: 'Monthly Trend' },

  // ── beauty-bingo ──
  'beautyBingo.title': { ar: ' Beauty Bingo', en: 'Beauty Bingo' },
  'beautyBingo.completed': { ar: '{done}/{total} مكتملة', en: '{done}/{total} completed' },

  // ── beauty-budget ──
  'beautyBudget.load-error': { ar: 'فشل تحميل الميزانية', en: 'Failed to load budget' },
  'beautyBudget.title': { ar: ' ميزانية الجمال', en: 'Beauty Budget' },
  'beautyBudget.monthly-budget': { ar: 'الميزانية الشهرية', en: 'Monthly Budget' },
  'beautyBudget.loyalty-points': {
    ar: ' نقاط الولاء: {points}',
    en: ' Loyalty Points: {points}',
  },
  'beautyBudget.savings-goals': {
    ar: 'أهداف الادخار: {count}',
    en: 'Savings Goals: {count}',
  },
  'beautyBudget.current-spending': { ar: 'الإنفاق الحالي', en: 'Current Spending' },
  'beautyBudget.remaining': { ar: 'المتبقي', en: 'Remaining' },

  // ── beauty-budget-planner ──
  'beautyBudgetPlanner.title': { ar: ' مخطط الميزانية', en: 'Budget Planner' },
  'beautyBudgetPlanner.subtitle': {
    ar: 'خططي لمصاريف جمالكِ السنوية',
    en: 'Plan your yearly beauty spending',
  },
  'beautyBudgetPlanner.budget': { ar: 'الميزانية', en: 'Budget' },
  'beautyBudgetPlanner.allocated': { ar: 'مخصص', en: 'Allocated' },
  'beautyBudgetPlanner.remaining': { ar: 'متبقي', en: 'Remaining' },
  'beautyBudgetPlanner.categories': { ar: '‍️ الفئات', en: 'Categories' },
  'beautyBudgetPlanner.cat-budget': {
    ar: 'الميزانية: {budget} ر.س / شهرياً',
    en: 'Budget: {budget} SAR / month',
  },
  'beautyBudgetPlanner.amount': { ar: '{value} ر.س', en: '{value} SAR' },
  'beautyBudgetPlanner.save': { ar: ' حفظ الميزانية', en: 'Save Budget' },
  'beautyBudgetPlanner.cat-hair': { ar: 'الشعر', en: 'Hair' },
  'beautyBudgetPlanner.cat-skin': { ar: 'البشرة', en: 'Skin' },
  'beautyBudgetPlanner.cat-nails': { ar: 'الأظافر', en: 'Nails' },
  'beautyBudgetPlanner.cat-makeup': { ar: 'المكياج', en: 'Makeup' },
  'beautyBudgetPlanner.cat-spa': { ar: 'السبا', en: 'Spa' },
  'beautyBudgetPlanner.cat-products': { ar: 'منتجات', en: 'Products' },

  // ── beauty-closet ──
  'beautyCloset.title': { ar: ' خزانة الجمال', en: 'Beauty Closet' },
  'beautyCloset.subtitle': {
    ar: 'منتجاتكِ ومستحضراتكِ الشخصية',
    en: 'Your personal products and cosmetics',
  },
  'beautyCloset.all': { ar: 'الكل', en: 'All' },
  'beautyCloset.cat-makeup': { ar: ' مكياج', en: 'Makeup' },
  'beautyCloset.cat-skin': { ar: ' عناية', en: 'Skincare' },
  'beautyCloset.cat-hair': { ar: '‍️ شعر', en: 'Hair' },
  'beautyCloset.cat-nails': { ar: ' أظافر', en: 'Nails' },
  'beautyCloset.cat-natural': { ar: ' طبيعي', en: 'Natural' },
  'beautyCloset.empty': { ar: ' أضيفي منتجاتكِ الأولى!', en: ' Add your first products!' },
  'beautyCloset.opened': { ar: 'فتح: {date}', en: 'Opened: {date}' },
  'beautyCloset.remaining': { ar: 'متبقي ~60%', en: '~60% remaining' },
  'beautyCloset.add-product': { ar: '+ إضافة منتج جديد', en: '+ Add New Product' },

  // ── beauty-community ──
  'beautyCommunity.title': { ar: '‍️ مجتمع الجمال', en: 'Beauty Community' },
  'beautyCommunity.subtitle': {
    ar: 'تواصلي، تعلمي، وشاركي رحلتكِ',
    en: 'Connect, learn, and share your journey',
  },

  // ── beauty-courses ──
  'beautyCourses.load-error': { ar: 'فشل تحميل الدورات', en: 'Failed to load courses' },
  'beautyCourses.title': { ar: ' دورات تجميل', en: 'Beauty Courses' },
  'beautyCourses.subtitle': {
    ar: 'تعلمي مهارات التجميل من الخبيرات',
    en: 'Learn beauty skills from experts',
  },
  'beautyCourses.my-courses': { ar: 'دوراتي ({count})', en: 'My Courses ({count})' },
  'beautyCourses.lessons': { ar: ' {lessons} دروس', en: ' {lessons} lessons' },
  'beautyCourses.enrolled': { ar: ' مسجلة', en: ' Enrolled' },
  'beautyCourses.enroll-now': { ar: ' سجلي الآن', en: ' Enroll Now' },
  'beautyCourses.course-fallback': { ar: 'دورة #{id}', en: 'Course #{id}' },
  'beautyCourses.level-beginner': { ar: 'مبتدئ', en: 'Beginner' },
  'beautyCourses.level-intermediate': { ar: 'متوسط', en: 'Intermediate' },
  'beautyCourses.level-advanced': { ar: 'متقدم', en: 'Advanced' },

  // ── beauty-dashboard ──
  'beautyDashboard.load-error': {
    ar: 'فشل تحميل لوحة الجمال',
    en: 'Failed to load beauty dashboard',
  },
  'beautyDashboard.title': { ar: ' لوحة الجمال', en: 'Beauty Dashboard' },
  'beautyDashboard.loyalty-points': { ar: 'نقاط الولاء', en: 'Loyalty Points' },
  'beautyDashboard.tier': { ar: 'المستوى', en: 'Tier' },
  'beautyDashboard.bookings': { ar: 'الحجوزات', en: 'Bookings' },
  'beautyDashboard.spending': { ar: 'الإنفاق', en: 'Spending' },
  'beautyDashboard.sar': { ar: '{value} ر.س', en: '{value} SAR' },

  // ── beauty-diary ──
  'beautyDiary.title': { ar: ' يوميات الجمال', en: 'Beauty Diary' },
  'beautyDiary.subtitle': {
    ar: 'اربطي مزاجكِ بروتين جمالكِ',
    en: 'Connect your mood to your beauty routine',
  },
  'beautyDiary.mood-question': { ar: 'كيف تشعرين اليوم؟', en: 'How do you feel today?' },
  'beautyDiary.mood-stats': { ar: ' إحصائيات المزاج', en: ' Mood Stats' },
  'beautyDiary.mood-happy': { ar: 'سعيدة', en: 'Happy' },
  'beautyDiary.mood-calm': { ar: 'هادئة', en: 'Calm' },
  'beautyDiary.mood-excited': { ar: 'متحمسة', en: 'Excited' },
  'beautyDiary.mood-tired': { ar: 'متعب', en: 'Tired' },
  'beautyDiary.latest-entries': { ar: ' آخر المدخلات', en: ' Latest Entries' },
  'beautyDiary.entry-fallback': { ar: 'يوميات الجمال', en: 'Beauty Diary' },
  'beautyDiary.today-service': { ar: '‍️ خدمة اليوم', en: " Today's service" },
  'beautyDiary.glow-skin': { ar: ' بشرة متألقة', en: ' Glowing skin' },
  'beautyDiary.write-today': { ar: '️ تدوين اليوم', en: ' Write today' },

  // ── beauty-discovery ──
  'beautyDiscovery.load-error': { ar: 'فشل تحميل المحتوى', en: 'Failed to load content' },
  'beautyDiscovery.title': { ar: ' اكتشفي', en: 'Discover' },
  'beautyDiscovery.subtitle': {
    ar: 'خدمات وعروض وفعاليات مخصصة لكِ',
    en: 'Services, offers, and events tailored for you',
  },
  'beautyDiscovery.your-profile': { ar: ' ملفكِ الشخصي', en: ' Your Profile' },
  'beautyDiscovery.popular': { ar: ' الأكثر طلباً', en: ' Most Popular' },
  'beautyDiscovery.price': { ar: '{price} ر.س', en: '{price} SAR' },
  'beautyDiscovery.flash-deals': { ar: ' عروض فلاش', en: ' Flash Deals' },
  'beautyDiscovery.for-you': { ar: ' لكِ خصيصاً', en: ' Just For You' },
  'beautyDiscovery.upcoming-events': { ar: ' فعاليات قادمة', en: ' Upcoming Events' },

  // ── beauty-events ──
  'beautyEvents.load-error': { ar: 'فشل تحميل الفعاليات', en: 'Failed to load events' },
  'beautyEvents.title': { ar: ' فعاليات وورش', en: 'Events & Workshops' },
  'beautyEvents.subtitle': {
    ar: 'سجلي في ورش العمل والفعاليات الحصرية',
    en: 'Register for exclusive workshops and events',
  },
  'beautyEvents.registered-count': {
    ar: 'مسجلة في {count} فعاليات',
    en: 'Registered in {count} events',
  },
  'beautyEvents.empty': { ar: 'لا توجد فعاليات قادمة', en: 'No upcoming events' },
  'beautyEvents.price': { ar: '{price} ر.س', en: '{price} SAR' },
  'beautyEvents.free': { ar: 'مجانية', en: 'Free' },
  'beautyEvents.cancel': { ar: ' مسجلة — إلغاء', en: ' Registered — Cancel' },
  'beautyEvents.register': { ar: ' سجلي الآن', en: ' Register Now' },
  'beautyEvents.type-workshop': { ar: ' ورشة', en: ' Workshop' },
  'beautyEvents.type-masterclass': { ar: ' ماستر كلاس', en: ' Masterclass' },
  'beautyEvents.type-launch': { ar: ' إطلاق', en: ' Launch' },
  'beautyEvents.type-seasonal': { ar: ' موسمي', en: ' Seasonal' },

  // ── beauty-expenses ──
  'beautyExpenses.load-error': { ar: 'فشل تحميل البيانات', en: 'Failed to load data' },
  'beautyExpenses.title': { ar: ' تحليل الإنفاق', en: 'Spending Analysis' },
  'beautyExpenses.subtitle': {
    ar: 'تتبعي مصاريفكِ على خدمات التجميل',
    en: 'Track your beauty service expenses',
  },
  'beautyExpenses.this-month': { ar: 'هذا الشهر', en: 'This Month' },
  'beautyExpenses.last-month': { ar: 'الشهر الماضي', en: 'Last Month' },
  'beautyExpenses.compare': { ar: 'مقارنة بالشهر الماضي', en: 'Compared to last month' },
  'beautyExpenses.by-category': { ar: ' توزيع الإنفاق', en: ' Spending Breakdown' },
  'beautyExpenses.monthly-trend': { ar: ' الاتجاه الشهري', en: ' Monthly Trend' },
  'beautyExpenses.amount': { ar: '{value} ر.س', en: '{value} SAR' },

  // ── beauty-extras ──
  'beautyExtras.title': { ar: ' إضافات الجمال', en: 'Beauty Extras' },
  'beautyExtras.subtitle': { ar: 'مجتمع، امتنان، وأحلام', en: 'Community, gratitude, and dreams' },

  // ── beauty-goals ──
  'beautyGoals.title': { ar: ' أهداف الجمال', en: 'Beauty Goals' },
  'beautyGoals.progress': { ar: '{target} جلسة · {pct}%', en: '{target} sessions · {pct}%' },
  'beautyGoals.set-target': { ar: 'تحديد هدف', en: 'Set Target' },

  // ── beauty-innovation ──
  'beautyInnovation.title': { ar: ' الابتكار', en: 'Innovation' },
  'beautyInnovation.subtitle': {
    ar: 'تقنيات وأدوات ذكية لجمالكِ',
    en: 'Smart technologies and tools for your beauty',
  },

  // ── beauty-journal ──
  'beautyJournal.title': { ar: ' يوميات الجمال', en: 'Beauty Journal' },
  'beautyJournal.load-error': { ar: 'فشل تحميل اليوميات', en: 'Failed to load journal' },
  'beautyJournal.empty': { ar: 'لا توجد مدخلات', en: 'No entries yet' },
  'beautyJournal.entry-fallback': { ar: 'مدخل', en: 'Entry' },

  // ── beauty-lifestyle ──
  'beautyLifestyle.title': { ar: ' نمط حياة الجمال', en: 'Beauty Lifestyle' },
  'beautyLifestyle.subtitle': {
    ar: 'مكافآت، توفير، واشتراكات',
    en: 'Rewards, savings, and subscriptions',
  },

  // ── beauty-mentor ──
  'beautyMentor.title': { ar: '‍ مرشدة الجمال', en: 'Beauty Mentor' },
  'beautyMentor.subtitle': {
    ar: 'تعلمي من خبيرات التجميل',
    en: 'Learn from beauty experts',
  },
  'beautyMentor.your-level': { ar: ' مستواكِ', en: ' Your Level' },
  'beautyMentor.topics': { ar: ' المواضيع', en: ' Topics' },
  'beautyMentor.learning-plan': {
    ar: ' خطة التعلم — {name}',
    en: ' Learning Plan — {name}',
  },
  'beautyMentor.start': { ar: '‍ ابدئي رحلة التعلم', en: ' Start Learning Journey' },
  'beautyMentor.level-beginner': { ar: 'مبتدئة', en: 'Beginner' },
  'beautyMentor.level-beginner-desc': {
    ar: 'اكتشفي أساسيات العناية',
    en: 'Discover skincare basics',
  },
  'beautyMentor.level-intermediate': { ar: 'متوسطة', en: 'Intermediate' },
  'beautyMentor.level-intermediate-desc': { ar: 'طوري روتينكِ', en: 'Improve your routine' },
  'beautyMentor.level-advanced': { ar: 'متقدمة', en: 'Advanced' },
  'beautyMentor.level-advanced-desc': { ar: 'أتقني فنون التجميل', en: 'Master beauty arts' },
  'beautyMentor.topic-skin': { ar: 'العناية بالبشرة', en: 'Skincare' },
  'beautyMentor.topic-makeup': { ar: 'المكياج', en: 'Makeup' },
  'beautyMentor.topic-hair': { ar: 'العناية بالشعر', en: 'Hair care' },
  'beautyMentor.topic-nails': { ar: 'الأظافر', en: 'Nails' },
  'beautyMentor.topic-perfume': { ar: 'العطور', en: 'Perfumes' },
  'beautyMentor.topic-nutrition': { ar: 'التغذية', en: 'Nutrition' },

  // ── beauty-metaverse ──
  'beautyMetaverse.title': { ar: ' عالم الجمال الافتراضي', en: 'Virtual Beauty World' },
  'beautyMetaverse.exit': { ar: 'خروج', en: 'Exit' },

  // ── beauty-party ──
  'beautyParty.title': { ar: ' حفلة تجميل', en: 'Beauty Party' },
  'beautyParty.subtitle': {
    ar: 'خططي لحفلة تجميل لكِ ولصديقاتكِ',
    en: 'Plan a beauty party for you and your friends',
  },
  'beautyParty.choose-theme': { ar: ' اختاري الثيم', en: ' Choose a Theme' },
  'beautyParty.guests-count': {
    ar: '‍️ عدد الصديقات: {count}',
    en: ' Number of friends: {count}',
  },
  'beautyParty.estimated-cost': { ar: ' التكلفة التقديرية', en: ' Estimated Cost' },
  'beautyParty.per-person': {
    ar: '{guests} أشخاص × {price} ر.س',
    en: '{guests} people × {price} SAR',
  },
  'beautyParty.group-discount': {
    ar: ' خصم المجموعة {pct}%',
    en: ' Group discount {pct}%',
  },
  'beautyParty.total': { ar: 'الإجمالي', en: 'Total' },
  'beautyParty.book-now': { ar: ' احجزي حفلتكِ الآن', en: ' Book Your Party Now' },
  'beautyParty.amount': { ar: '{value} ر.س', en: '{value} SAR' },
  'beautyParty.theme-spa': { ar: 'سبا منزلي', en: 'Home Spa' },
  'beautyParty.theme-spa-desc': {
    ar: 'مساج وأقنعة واسترخاء',
    en: 'Massage, masks, and relaxation',
  },
  'beautyParty.theme-makeup': { ar: 'حفلة مكياج', en: 'Makeup Party' },
  'beautyParty.theme-makeup-desc': { ar: 'تجربة مكياج جماعي', en: 'Group makeup experience' },
  'beautyParty.theme-nails': { ar: 'صالون أظافر', en: 'Nail Salon' },
  'beautyParty.theme-nails-desc': {
    ar: 'مانيكير وباديكير جماعي',
    en: 'Group manicure and pedicure',
  },
  'beautyParty.theme-bridal': { ar: 'توديع عزوبية', en: 'Bridal Shower' },
  'beautyParty.theme-bridal-desc': {
    ar: 'عناية متكاملة للعروس',
    en: 'Complete bridal care',
  },
  'beautyParty.theme-skincare': { ar: 'روتين عناية', en: 'Skincare Routine' },
  'beautyParty.theme-skincare-desc': {
    ar: 'أقنعة وعناية بالبشرة',
    en: 'Masks and skincare',
  },

  // ── beauty-profile ──
  'beautyProfile.title': { ar: ' ملف الجمال', en: 'Beauty Profile' },
  'beautyProfile.skin-type': { ar: 'نوع البشرة: {type}', en: 'Skin type: {type}' },
  'beautyProfile.hair-type': { ar: 'نوع الشعر: {type}', en: 'Hair type: {type}' },

  // ── beauty-reminders ──
  'beautyReminders.load-error': {
    ar: 'فشل تحميل التذكيرات',
    en: 'Failed to load reminders',
  },
  'beautyReminders.title': { ar: ' تذكيرات الجمال', en: ' Beauty Reminders' },
  'beautyReminders.subtitle': { ar: 'لا تنسي مواعيد عنايتكِ', en: 'Never miss your care dates' },
  'beautyReminders.add': { ar: '+ تذكير', en: '+ Reminder' },
  'beautyReminders.name-placeholder': { ar: 'اسم التذكير', en: 'Reminder name' },
  'beautyReminders.every-days': { ar: 'كل {days} يوم', en: 'Every {days} days' },
  'beautyReminders.save': { ar: 'حفظ', en: 'Save' },
  'beautyReminders.empty': { ar: 'مافي تذكيرات', en: 'No reminders yet' },
  'beautyReminders.overdue': { ar: 'فات موعدها', en: 'Overdue' },
  'beautyReminders.was-due': { ar: 'كان {date}', en: 'Was due {date}' },
  'beautyReminders.done': { ar: ' تم', en: ' Done' },
  'beautyReminders.upcoming': { ar: 'قادمة', en: 'Upcoming' },
  'beautyReminders.due-interval': {
    ar: '{date} · كل {days} يوم',
    en: '{date} · every {days} days',
  },
  'beautyReminders.cat-hair': { ar: 'شعر', en: 'Hair' },
  'beautyReminders.cat-nails': { ar: 'أظافر', en: 'Nails' },
  'beautyReminders.cat-skincare': { ar: 'بشرة', en: 'Skin' },
  'beautyReminders.cat-makeup': { ar: 'مكياج', en: 'Makeup' },
  'beautyReminders.cat-body': { ar: 'جسم', en: 'Body' },
  'beautyReminders.cat-other': { ar: 'أخرى', en: 'Other' },

  // ── beauty-rescue ──
  'beautyRescue.title': { ar: ' إنقاذ الجمال', en: 'Beauty Rescue' },
  'beautyRescue.subtitle': {
    ar: 'خدمات تجميل طارئة — نصل لكِ خلال ساعة',
    en: 'Emergency beauty services — we arrive within an hour',
  },
  'beautyRescue.requested': { ar: 'تم الطلب!', en: 'Request received!' },
  'beautyRescue.on-the-way': {
    ar: 'خبيرة التجميل في الطريق — تصل خلال {time}',
    en: 'The beauty expert is on the way — arrives in {time}',
  },
  'beautyRescue.price-fee': {
    ar: '{price} ر.س (شامل رسوم الطوارئ)',
    en: '{price} SAR (includes emergency fee)',
  },
  'beautyRescue.done': { ar: 'تم', en: 'Done' },
  'beautyRescue.includes': { ar: 'العلاج يشمل:', en: 'The treatment includes:' },
  'beautyRescue.regular-price': {
    ar: 'السعر العادي: {price} ر.س',
    en: 'Regular price: {price} SAR',
  },
  'beautyRescue.urgent-price': { ar: 'السعر الطارئ: {price} ر.س', en: 'Urgent price: {price} SAR' },
  'beautyRescue.book-now': {
    ar: ' احجزي الآن — نصل خلال {time}',
    en: ' Book now — we arrive in {time}',
  },
  'beautyRescue.sos-tips': { ar: 'نصائح SOS منزلية', en: 'At-home SOS Tips' },
  'beautyRescue.aftercare': { ar: 'عناية ما بعد الإجراءات', en: 'Post-Procedure Care' },
  'beautyRescue.price-time': { ar: '{price} ر.س · {time}', en: '{price} SAR · {time}' },

  // ── beauty-wishlist-gifts ──
  'beautyWishlistGifts.title': { ar: ' قائمة الهدايا', en: 'Wishlist' },
  'beautyWishlistGifts.subtitle': {
    ar: 'شاركي قائمة أمنياتكِ مع الأصدقاء والعائلة',
    en: 'Share your wishlist with friends and family',
  },
  'beautyWishlistGifts.occasion': { ar: ' المناسبة', en: ' Occasion' },
  'beautyWishlistGifts.share-link': { ar: ' رابط المشاركة', en: ' Share Link' },
  'beautyWishlistGifts.copy': { ar: ' نسخ', en: ' Copy' },
  'beautyWishlistGifts.copied': { ar: ' تم النسخ', en: ' Copied' },
  'beautyWishlistGifts.my-wishes': {
    ar: 'أمنياتي ({emoji} {name})',
    en: 'My Wishes ({emoji} {name})',
  },
  'beautyWishlistGifts.amount': { ar: '{value} ر.س', en: '{value} SAR' },
  'beautyWishlistGifts.add-wish': { ar: '+ إضافة أمنية', en: '+ Add Wish' },
  'beautyWishlistGifts.occasion-birthday': { ar: 'عيد ميلاد', en: 'Birthday' },
  'beautyWishlistGifts.occasion-eid': { ar: 'العيد', en: 'Eid' },
  'beautyWishlistGifts.occasion-wedding': { ar: 'زفاف', en: 'Wedding' },
  'beautyWishlistGifts.occasion-graduation': { ar: 'تخرج', en: 'Graduation' },
  'beautyWishlistGifts.occasion-valentine': { ar: 'عيد الحب', en: "Valentine's Day" },
  'beautyWishlistGifts.occasion-mothersday': { ar: 'عيد الأم', en: "Mother's Day" },

  // ── beauty-rewards ──
  'beautyRewards.title': { ar: ' المكافآت', en: 'Rewards' },
  'beautyRewards.subtitle': {
    ar: 'تقديراً لكونكِ جزءاً من عائلتنا',
    en: 'In appreciation of being part of our family',
  },

  // ── beauty-routine ──
  'beautyRoutine.title': { ar: ' روتيني', en: 'My Routine' },
  'beautyRoutine.morning': { ar: '️ الصباح', en: ' Morning' },
  'beautyRoutine.evening': { ar: ' المساء', en: ' Evening' },

  // ── beauty-services ──
  'beautyServices.title': { ar: ' خدمات الجمال', en: 'Beauty Services' },
  'beautyServices.subtitle': {
    ar: 'اكتشفي كل ما تحتاجينه',
    en: 'Discover everything you need',
  },

  // ── beauty-tips ──
  'beautyTips.title': { ar: ' نصائح وإرشادات', en: 'Tips & Guidance' },
  'beautyTips.subtitle': {
    ar: 'كل ما تحتاجينه للعناية بجمالك',
    en: 'Everything you need to care for your beauty',
  },

  // ── beauty-wishlist-gifts ──
  'beautyWishlist.title': { ar: ' قائمة الهدايا', en: 'Gift List' },
  'beautyWishlist.subtitle': {
    ar: 'شاركي قائمة أمنياتكِ مع الأصدقاء والعائلة',
    en: 'Share your wishlist with friends and family',
  },
  'beautyWishlist.occasion': { ar: ' المناسبة', en: ' Occasion' },
  'beautyWishlist.occasion-birthday': { ar: 'عيد ميلاد', en: 'Birthday' },
  'beautyWishlist.occasion-eid': { ar: 'العيد', en: 'Eid' },
  'beautyWishlist.occasion-wedding': { ar: 'زفاف', en: 'Wedding' },
  'beautyWishlist.occasion-graduation': { ar: 'تخرج', en: 'Graduation' },
  'beautyWishlist.occasion-valentine': { ar: 'عيد الحب', en: 'Valentine' },
  'beautyWishlist.occasion-mothersday': { ar: 'عيد الأم', en: "Mother's Day" },
  'beautyWishlist.share-title': { ar: ' رابط المشاركة', en: ' Share Link' },
  'beautyWishlist.copied': { ar: ' تم النسخ', en: ' Copied' },
  'beautyWishlist.copy': { ar: ' نسخ', en: ' Copy' },
  'beautyWishlist.my-wishes': {
    ar: 'أمنياتي ({emoji} {name})',
    en: 'My Wishes ({emoji} {name})',
  },
  'beautyWishlist.add-wish': { ar: '+ إضافة أمنية', en: '+ Add a Wish' },

  // ── birthday-rewards ──
  'birthdayRewards.title': { ar: ' مكافآت الميلاد', en: 'Birthday Rewards' },
  'birthdayRewards.code': { ar: 'كود: {code}', en: 'Code: {code}' },
  'birthdayRewards.claim': { ar: 'استلام', en: 'Claim' },
  'birthdayRewards.empty': { ar: 'لا توجد مكافآت', en: 'No rewards yet' },

  // ── bnpl ──
  'bnpl.title': { ar: ' تقسيط المدفوعات', en: ' Buy Now Pay Later' },
  'bnpl.approved': { ar: 'تمت الموافقة!', en: 'Approved!' },
  'bnpl.amount': { ar: '{amount} ر.س', en: '{amount} SAR' },
  'bnpl.monthly': { ar: '{amount} ر.س / شهرياً', en: '{amount} SAR / month' },
  'bnpl.submit': { ar: 'تقديم الطلب', en: 'Submit Request' },
  'bnpl.reset': { ar: ' إعادة', en: ' Reset' },

  // ── booking-checklist ──
  'bookingChecklist.load-error': { ar: 'فشل تحميل القائمة', en: 'Failed to load checklist' },
  'bookingChecklist.title': { ar: ' قائمة التحضير', en: ' Preparation Checklist' },

  // ── booking-insights ──
  'bookingInsights.title': { ar: ' رؤى الحجوزات', en: ' Booking Insights' },
  'bookingInsights.spent-label': { ar: 'ر.س إنفاق', en: 'SAR spent' },
  'bookingInsights.booking-label': { ar: 'حجز', en: 'Bookings' },
  'bookingInsights.avg-label': { ar: 'متوسط', en: 'Average' },
  'bookingInsights.by-category': { ar: '‍️ توزيع الفئات', en: ' Category Breakdown' },
  'bookingInsights.smart-tip': { ar: 'نصيحة ذكية', en: 'Smart Tip' },
  'bookingInsights.tip-low': {
    ar: 'احجزي ٥ خدمات للفئة الذهبية ',
    en: 'Book 5 services for the gold tier ',
  },
  'bookingInsights.tip-quality': { ar: 'أنتِ تستثمرين في الجودة ', en: 'You invest in quality ' },
  'bookingInsights.tip-package': { ar: 'احجزي باقات للخصم ', en: 'Book packages for discounts ' },
  'bookingInsights.amount': { ar: '{value} ر.س', en: '{value} SAR' },

  // ── box-builder ──
  'boxBuilder.title': { ar: ' صندوقي', en: ' My Box' },
  'boxBuilder.subtitle': {
    ar: 'اختاري حتى ٥ منتجات لصندوقك الشهري',
    en: 'Choose up to 5 products for your monthly box',
  },
  'boxBuilder.count': { ar: ' {count} منتجات', en: ' {count} products' },
  'boxBuilder.price': { ar: '{price} ر.س', en: '{price} SAR' },

  // ── calendar-sync ──
  'calendarSync.error': {
    ar: 'مزامنة تقويم Google غير متوفرة في التطبيق حالياً',
    en: 'Google Calendar sync is not available in the app yet',
  },
  'calendarSync.title': { ar: ' مزامنة التقويم', en: ' Calendar Sync' },
  'calendarSync.connected': { ar: 'التقويم مربوط', en: 'Calendar connected' },
  'calendarSync.not-connected': {
    ar: 'لم يتم ربط التقويم بعد',
    en: 'Calendar not connected yet',
  },
  'calendarSync.disconnect': { ar: 'قطع الاتصال', en: 'Disconnect' },
  'calendarSync.connect': { ar: ' ربط تقويم قوقل', en: ' Connect Google Calendar' },

  // ── cart ──
  'cart.load-error': { ar: 'فشل تحميل السلة', en: 'Failed to load cart' },
  'cart.empty-title': { ar: 'السلة فارغة', en: 'Cart is empty' },
  'cart.empty-desc': { ar: 'أضيفي منتجات من المتجر', en: 'Add products from the store' },
  'cart.title': { ar: ' سلة التسوق', en: ' Shopping Cart' },
  'cart.quantity': { ar: 'الكمية: {qty}', en: 'Quantity: {qty}' },
  'cart.total': { ar: 'الإجمالي: {total}', en: 'Total: {total}' },
  'cart.checkout': { ar: ' إتمام الشراء', en: ' Checkout' },

  // ── cashback ──
  'cashback.title': { ar: ' استرداد نقدي', en: ' Cashback' },
  'cashback.balance': { ar: 'رصيد الكاش باك', en: 'Cashback balance' },
  'cashback.total-balance': { ar: 'الرصيد الإجمالي', en: 'Total balance' },
  'cashback.amount': { ar: '{value} ر.س', en: '{value} SAR' },

  // ── certification-quiz ──
  'certificationQuiz.title': { ar: ' اختبار الشهادة', en: ' Certification Quiz' },
  'certificationQuiz.start': { ar: 'بدء', en: 'Start' },

  // ── challenges ──
  'challenges.title': { ar: ' تحديات الجمال', en: ' Beauty Challenges' },
  'challenges.join': { ar: 'انضمام', en: 'Join' },

  // ── chat ──
  'chat.title': { ar: ' المحادثات', en: ' Chat' },
  'chat.empty': { ar: 'لا توجد رسائل', en: 'No messages yet' },
  'chat.placeholder': { ar: 'اكتبي رسالة...', en: 'Type a message...' },

  // ── checkout ──
  'checkout.title': { ar: ' الدفع', en: ' Checkout' },
  'checkout.wallet-balance': { ar: 'رصيد المحفظة', en: 'Wallet balance' },
  'checkout.payment-method': { ar: 'طريقة الدفع', en: 'Payment method' },
  'checkout.summary': { ar: 'ملخص الدفع', en: 'Payment summary' },
  'checkout.amount-label': { ar: 'المبلغ', en: 'Amount' },
  'checkout.tax': { ar: 'الضريبة', en: 'Tax' },
  'checkout.total': { ar: 'الإجمالي', en: 'Total' },
  'checkout.amount-sar': { ar: '{value} ر.س', en: '{value} SAR' },
  'checkout.pay-now': { ar: ' ادفع الآن {amount} ر.س', en: ' Pay Now {amount} SAR' },
  'checkout.method-wallet': { ar: 'المحفظة', en: 'Wallet' },
  'checkout.method-card': { ar: 'بطاقة', en: 'Card' },
  'checkout.method-bnpl': { ar: 'تقسيط', en: 'Installments' },

  // ── clinic-connect ──
  'clinicConnect.title': { ar: ' Clinic Connect', en: 'Clinic Connect' },
  'clinicConnect.refer': { ar: 'إحالة', en: 'Refer' },
  'clinicConnect.my-referrals': { ar: ' إحالاتي', en: ' My Referrals' },
  'clinicConnect.pending': { ar: 'معلقة', en: 'Pending' },
  'clinicConnect.completed': { ar: 'مكتملة', en: 'Completed' },
  'clinicConnect.reason': { ar: 'استشارة جلدية', en: 'Dermatology consultation' },

  // ── color-analysis ──
  'colorAnalysis.title': { ar: ' تحليل الألوان', en: ' Color Analysis' },
  'colorAnalysis.subtitle': {
    ar: 'اكتشفي الألوان اللي تناسب بشرتكِ',
    en: 'Discover the colors that suit your skin',
  },
  'colorAnalysis.palette': { ar: ' لوحة الألوان', en: ' Color Palette' },
  'colorAnalysis.makeup': { ar: ' المكياج المناسب', en: ' Recommended Makeup' },
  'colorAnalysis.jewelry': { ar: ' المجوهرات', en: ' Jewelry' },
  'colorAnalysis.analyze': { ar: ' حللي بشرتكِ', en: ' Analyze Your Skin' },

  // ── community ──
  'community.load-error': { ar: 'فشل تحميل المجتمع', en: 'Failed to load community' },
  'community.title': { ar: ' مجتمع الجمال', en: ' Beauty Community' },
  'community.subtitle': { ar: 'شاركي تجاربكِ وآرائكِ', en: 'Share your experiences and opinions' },
  'community.create': { ar: '+ منشور', en: '+ Post' },
  'community.placeholder': {
    ar: 'شاركي تجربتكِ أو نصيحة...',
    en: 'Share your experience or a tip...',
  },
  'community.post': { ar: ' نشر', en: ' Post' },
  'community.trending': { ar: 'الأكثر تفاعلاً', en: 'Most Engaging' },
  'community.empty': { ar: 'كوني أول من يشارك', en: 'Be the first to share' },
  'community.user-fallback': { ar: 'مستخدمة', en: 'User' },
  'community.comment-placeholder': { ar: 'أضيفي تعليق...', en: 'Add a comment...' },
  'community.comment': { ar: 'تعليق', en: 'Comment' },

  // ── cycle-tracker ──
  'cycleTracker.title': { ar: ' متعقب الدورة', en: ' Cycle Tracker' },
  'cycleTracker.subtitle': {
    ar: 'توصيات جمالية حسب يوم دورتكِ',
    en: 'Beauty recommendations based on your cycle day',
  },
  'cycleTracker.day': { ar: 'اليوم {day}', en: 'Day {day}' },
  'cycleTracker.days': { ar: 'الأيام {days}', en: 'Days {days}' },
  'cycleTracker.tips': { ar: ' توصيات الجمال', en: ' Beauty Recommendations' },
  'cycleTracker.services': { ar: '‍️ الخدمات المناسبة', en: ' Recommended Services' },
  'cycleTracker.phase-menstrual': { ar: 'الدورة', en: 'Menstrual' },
  'cycleTracker.phase-follicular': { ar: 'الجريبي', en: 'Follicular' },
  'cycleTracker.phase-ovulation': { ar: 'الإباضة', en: 'Ovulation' },
  'cycleTracker.phase-luteal': { ar: 'الأصفري', en: 'Luteal' },

  // ── dashboard ──
  'dashboard.load-error': { ar: 'فشل تحميل لوحة التحكم', en: 'Failed to load dashboard' },
  'dashboard.title': { ar: ' لوحة التحكم', en: ' Dashboard' },
  'dashboard.bookings': { ar: 'حجوزات', en: 'Bookings' },
  'dashboard.spending': { ar: 'الإنفاق', en: 'Spending' },
  'dashboard.streak': { ar: 'الاستمرارية', en: 'Streak' },
  'dashboard.sar': { ar: '{value} ر.س', en: '{value} SAR' },
  'dashboard.link-bookings': { ar: ' حجوزاتي', en: ' My Bookings' },
  'dashboard.link-wallet': { ar: ' المحفظة', en: ' Wallet' },
  'dashboard.link-wishlist': { ar: '️ المفضلة', en: ' Favorites' },
  'dashboard.link-loyalty': { ar: ' الولاء', en: ' Loyalty' },
  'dashboard.link-ai-chat': { ar: ' مجرة الجمال', en: ' Beauty Galaxy' },
  'dashboard.link-profile': { ar: ' حسابي', en: ' My Account' },

  // ── disputes ──
  'disputes.load-error': { ar: 'فشل تحميل النزاعات', en: 'Failed to load disputes' },
  'disputes.empty-title': { ar: 'لا توجد نزاعات', en: 'No disputes' },
  'disputes.empty-desc': {
    ar: 'يمكنكِ فتح نزاع على أي حجز',
    en: 'You can open a dispute on any booking',
  },
  'disputes.title': { ar: '️ النزاعات', en: ' Disputes' },
  'disputes.resolution': { ar: 'الحل: {resolution}', en: 'Resolution: {resolution}' },
  'disputes.open-new': { ar: ' فتح نزاع جديد', en: ' Open New Dispute' },
  'disputes.status-open': { ar: 'مفتوح', en: 'Open' },
  'disputes.status-under-review': { ar: 'قيد المراجعة', en: 'Under Review' },
  'disputes.status-resolved': { ar: 'محلول', en: 'Resolved' },
  'disputes.status-closed': { ar: 'مغلق', en: 'Closed' },

  // ── dna-beauty ──
  'dnaBeauty.title': { ar: ' تحليل الجينات', en: ' DNA Analysis' },
  'dnaBeauty.result': { ar: 'نتيجة التحليل', en: 'Analysis Result' },
  'dnaBeauty.match': { ar: '{score}% تطابق', en: '{score}% match' },
  'dnaBeauty.reset': { ar: ' إعادة', en: ' Reset' },
  'dnaBeauty.fill-survey': { ar: 'أكملي الاستبيان', en: 'Complete the survey' },
  'dnaBeauty.yes': { ar: 'نعم', en: 'Yes' },
  'dnaBeauty.no': { ar: 'لا', en: 'No' },
  'dnaBeauty.analyze': { ar: ' تحليل', en: ' Analyze' },

  // ── emergency-booking ──
  'emergencyBooking.title': { ar: ' حجز طارئ', en: ' Emergency Booking' },
  'emergencyBooking.success': { ar: 'تم الحجز الطارئ!', en: 'Emergency booking confirmed!' },
  'emergencyBooking.subtitle': {
    ar: 'حجز فوري خلال ٣ ساعات — رسوم إضافية ٥٠ ر.س',
    en: 'Instant booking within 3 hours — extra fee of 50 SAR',
  },
  'emergencyBooking.estimated-cost': { ar: ' التكلفة التقديرية', en: ' Estimated Cost' },
  'emergencyBooking.amount': { ar: '{value} ر.س', en: '{value} SAR' },
  'emergencyBooking.book-now': { ar: 'احجز الآن', en: 'Book Now' },
  'emergencyBooking.change-service': { ar: ' تغيير الخدمة', en: ' Change Service' },

  // ── expiry-tracker ──
  'expiryTracker.title': { ar: '️ متعقب الصلاحية', en: ' Expiry Tracker' },
  'expiryTracker.expires': { ar: 'ينتهي بعد {months} شهر', en: 'Expires in {months} months' },

  // ── family-account ──
  'familyAccount.title': { ar: '‍‍ حساب العائلة', en: ' Family Account' },

  // ── family-beauty ──
  'familyBeauty.title': { ar: '‍‍‍ جمال العائلة', en: ' Family Beauty' },
  'familyBeauty.subtitle': {
    ar: 'لحظات جميلة تجمع الأحباب',
    en: 'Beautiful moments that bring loved ones together',
  },

  // ── favorites ──
  'favorites.load-error': { ar: 'فشل تحميل المفضلة', en: 'Failed to load favorites' },
  'favorites.empty-title': { ar: 'لا توجد خدمات مفضلة', en: 'No favorite services' },
  'favorites.empty-desc': {
    ar: 'أضيفي خدماتكِ المفضلة للوصول السريع',
    en: 'Add your favorite services for quick access',
  },
  'favorites.title': { ar: ' المفضلة السريعة', en: ' Quick Favorites' },
  'favorites.service-id': { ar: 'خدمة #{id}', en: 'Service #{id}' },

  // ── following ──
  'following.title': { ar: '‍ متابعة الفنيات', en: ' Following Service Providers' },
  'following.technician': { ar: 'مقدمة خدمة #{id}', en: 'Service Provider #{id}' },
  'following.since': { ar: 'منذ {date}', en: 'Since {date}' },
  'following.unfollow': { ar: 'إلغاء المتابعة', en: 'Unfollow' },

  // ── franchise-portal ──
  'franchisePortal.title': { ar: ' بوابة الامتياز', en: ' Franchise Portal' },
  'franchisePortal.revenue': { ar: 'الإيرادات', en: 'Revenue' },
  'franchisePortal.bookings': { ar: 'حجز', en: 'Bookings' },
  'franchisePortal.staff': { ar: '{staff} موظفات', en: '{staff} staff' },
  'franchisePortal.booking-count': { ar: '{bookings} حجز', en: '{bookings} bookings' },
  'franchisePortal.amount': { ar: '{value} ر.س', en: '{value} SAR' },
  'franchisePortal.active': { ar: 'نشط', en: 'Active' },
  'franchisePortal.pending': { ar: 'معلق', en: 'Pending' },

  // ── geofence-offers ──
  'geofenceOffers.title': { ar: ' عروض بالقرب منك', en: ' Offers Near You' },
  'geofenceOffers.opt-in': { ar: ' فعلي التنبيهات القريبة', en: ' Enable Nearby Alerts' },
} as const satisfies Record<string, { ar: string; en: string }>;
