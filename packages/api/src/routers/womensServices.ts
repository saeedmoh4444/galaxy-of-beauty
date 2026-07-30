import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

// --- Women-Specific Service Catalog ---
const SERVICES = {
  pregnancy_safe: {
    nameAr: 'عناية الحامل', nameEn: 'Pregnancy-Safe Beauty', emoji: '🤰',
    description: 'خدمات آمنة للحامل — منتجات طبيعية خالية من المواد الضارة',
    subServices: [
      { id: 'ps1', nameAr: 'مساج حمل آمن', nameEn: 'Safe Pregnancy Massage', price: 250, durationMin: 45, emoji: '💆‍♀️', precautions: 'ثلاثي الحمل الثاني والثالث فقط' },
      { id: 'ps2', nameAr: 'عناية بالبشرة للحامل', nameEn: 'Pregnancy-Safe Facial', price: 180, durationMin: 40, emoji: '✨', precautions: 'منتجات طبيعية ١٠٠٪' },
      { id: 'ps3', nameAr: 'باديكير آمن للحامل', nameEn: 'Pregnancy-Safe Pedicure', price: 120, durationMin: 30, emoji: '🦶', precautions: 'بدون تدليك عميق' },
    ],
  },
  postpartum: {
    nameAr: 'عناية ما بعد الولادة', nameEn: 'Postpartum Care', emoji: '🤱',
    description: 'خدمات عناية خاصة للأمهات الجدد — استعادة النشاط والجمال',
    subServices: [
      { id: 'pp1', nameAr: 'مساج استشفاء', nameEn: 'Recovery Massage', price: 280, durationMin: 60, emoji: '💆‍♀️', precautions: 'بعد ٦ أسابيع من الولادة' },
      { id: 'pp2', nameAr: 'علاج تشققات البطن', nameEn: 'Stretch Mark Treatment', price: 350, durationMin: 45, emoji: '🧴', precautions: 'بعد ٣ أشهر من الولادة' },
      { id: 'pp3', nameAr: 'عناية بالبشرة بعد الولادة', nameEn: 'Postpartum Facial', price: 200, durationMin: 45, emoji: '✨', precautions: 'مناسبة للرضاعة' },
    ],
  },
  henna: {
    nameAr: 'فن الحناء', nameEn: 'Henna Art', emoji: '🌿',
    description: 'تصاميم حناء تقليدية وعصرية — طبيعية وآمنة',
    subServices: [
      { id: 'hn1', nameAr: 'حناء عرائس كامل', nameEn: 'Full Bridal Henna', price: 500, durationMin: 120, emoji: '👰', precautions: 'حناء طبيعية سوداء' },
      { id: 'hn2', nameAr: 'حناء يدين', nameEn: 'Hands Henna', price: 180, durationMin: 45, emoji: '🤲', precautions: '' },
      { id: 'hn3', nameAr: 'حناء قدمين', nameEn: 'Feet Henna', price: 150, durationMin: 40, emoji: '🦶', precautions: '' },
      { id: 'hn4', nameAr: 'حناء مناسبات', nameEn: 'Occasion Henna', price: 250, durationMin: 60, emoji: '🎉', precautions: '' },
    ],
  },
  brows_lashes: {
    nameAr: 'حواجب ورموش', nameEn: 'Brows & Lashes', emoji: '👁️',
    description: 'خدمات الحواجب والرموش — تشكيل، صبغ، وتركيب',
    subServices: [
      { id: 'bl1', nameAr: 'تشكيل حواجب', nameEn: 'Eyebrow Shaping', price: 80, durationMin: 20, emoji: '✂️', precautions: '' },
      { id: 'bl2', nameAr: 'صبغ حواجب', nameEn: 'Eyebrow Tinting', price: 100, durationMin: 20, emoji: '🎨', precautions: '' },
      { id: 'bl3', nameAr: 'مايكروبليدينج', nameEn: 'Microblading', price: 800, durationMin: 120, emoji: '🖋️', precautions: 'جلسة تصحيح بعد شهر' },
      { id: 'bl4', nameAr: 'تركيب رموش', nameEn: 'Lash Extensions', price: 350, durationMin: 90, emoji: '✨', precautions: 'يدوم ٣-٤ أسابيع' },
      { id: 'bl5', nameAr: 'رفع رموش', nameEn: 'Lash Lift', price: 200, durationMin: 45, emoji: '⬆️', precautions: '' },
    ],
  },
  body_contouring: {
    nameAr: 'نحت الجسم', nameEn: 'Body Contouring', emoji: '💪',
    description: 'خدمات نحت وتشكيل الجسم غير جراحية',
    subServices: [
      { id: 'bc1', nameAr: 'كافيتيشن', nameEn: 'Cavitation', price: 400, durationMin: 60, emoji: '🔊', precautions: '٦-٨ جلسات للنتيجة' },
      { id: 'bc2', nameAr: 'راديوفريكونسي', nameEn: 'Radiofrequency', price: 450, durationMin: 45, emoji: '📡', precautions: '٤-٦ جلسات' },
      { id: 'bc3', nameAr: 'تصريف ليمفاوي', nameEn: 'Lymphatic Drainage', price: 300, durationMin: 60, emoji: '💧', precautions: '' },
      { id: 'bc4', nameAr: 'شد الجسم بالخيوط', nameEn: 'Thread Lifting', price: 1200, durationMin: 90, emoji: '🧵', precautions: 'نتيجة فورية' },
    ],
  },
  intimate_care: {
    nameAr: 'عناية شخصية', nameEn: 'Intimate Care', emoji: '🌸',
    description: 'خدمات عناية شخصية نسائية — بخصوصية وأمان تام',
    subServices: [
      { id: 'ic1', nameAr: 'تبييض المناطق الحساسة', nameEn: 'Intimate Whitening', price: 350, durationMin: 45, emoji: '✨', precautions: 'منتجات طبية آمنة' },
      { id: 'ic2', nameAr: 'تقشير الجسم كامل', nameEn: 'Full Body Scrub', price: 250, durationMin: 50, emoji: '🧖‍♀️', precautions: '' },
      { id: 'ic3', nameAr: 'حمام بخار مهبلي', nameEn: 'V-Steam', price: 180, durationMin: 30, emoji: '♨️', precautions: 'أعشاب طبيعية' },
    ],
  },
  mommy_makeover: {
    nameAr: 'تجديد الأمومة', nameEn: 'Mommy Makeover', emoji: '👩‍👧',
    description: 'باقة متكاملة لاستعادة جمالكِ بعد الولادة',
    subServices: [
      { id: 'mm1', nameAr: 'باقة تجديد الأمومة', nameEn: 'Mommy Makeover Package', price: 1200, durationMin: 180, emoji: '💝', precautions: '٣ خدمات في جلسة واحدة' },
      { id: 'mm2', nameAr: 'جلسة استرخاء للأمهات', nameEn: 'Mom Relaxation Session', price: 350, durationMin: 90, emoji: '🧘‍♀️', precautions: 'مساج + قناع + عناية' },
    ],
  },
  teen_beauty: {
    nameAr: 'تجميل المراهقات', nameEn: 'Teen Beauty', emoji: '👧',
    description: 'خدمات مناسبة للشابات — عناية لطيفة ومناسبة للعمر',
    subServices: [
      { id: 'tb1', nameAr: 'عناية بشرة للمراهقات', nameEn: 'Teen Facial', price: 120, durationMin: 30, emoji: '✨', precautions: 'منتجات لطيفة' },
      { id: 'tb2', nameAr: 'مكياج مناسبات', nameEn: 'Occasion Makeup', price: 180, durationMin: 45, emoji: '💄', precautions: 'إطلالة طبيعية' },
      { id: 'tb3', nameAr: 'تنظيف بشرة خفيف', nameEn: 'Gentle Cleansing', price: 100, durationMin: 25, emoji: '🧼', precautions: '' },
    ],
  },
  menopause: {
    nameAr: 'عناية سن اليأس', nameEn: 'Menopause Care', emoji: '🦋',
    description: 'عناية متخصصة للبشرة والجسم خلال مرحلة انقطاع الطمث',
    subServices: [
      { id: 'mp1', nameAr: 'عناية بالبشرة لسن اليأس', nameEn: 'Menopause Facial', price: 220, durationMin: 50, emoji: '✨', precautions: 'منتجات غنية بالكولاجين' },
      { id: 'mp2', nameAr: 'مساج هرموني', nameEn: 'Hormonal Balance Massage', price: 280, durationMin: 60, emoji: '💆‍♀️', precautions: 'زيوت طبيعية متوازنة' },
      { id: 'mp3', nameAr: 'علاج جفاف البشرة', nameEn: 'Dryness Treatment', price: 200, durationMin: 45, emoji: '💧', precautions: 'ترطيب مكثف' },
    ],
  },
  hijab_care: {
    nameAr: 'عناية المحجبة', nameEn: 'Hijab-Friendly Haircare', emoji: '🧕',
    description: 'عناية متخصصة بالشعر للمحجبات — جلسات خاصة وخصوصية تامة',
    subServices: [
      { id: 'hj1', nameAr: 'علاج تساقط الشعر', nameEn: 'Hair Loss Treatment', price: 300, durationMin: 60, emoji: '💆‍♀️', precautions: 'جلسات شهرية' },
      { id: 'hj2', nameAr: 'حمام زيت عميق', nameEn: 'Deep Oil Treatment', price: 180, durationMin: 45, emoji: '🫒', precautions: 'زيوت طبيعية' },
      { id: 'hj3', nameAr: 'تصفيف خاص للمحجبات', nameEn: 'Hijab-Friendly Styling', price: 150, durationMin: 30, emoji: '💇‍♀️', precautions: 'خصوصية تامة' },
      { id: 'hj4', nameAr: 'قناع شعر مرطب', nameEn: 'Hydrating Hair Mask', price: 160, durationMin: 35, emoji: '🧴', precautions: 'لفروة الرأس الصحية' },
    ],
  },
  pcos_care: {
    nameAr: 'عناية تكيس المبايض', nameEn: 'PCOS Beauty', emoji: '🩺',
    description: 'عناية متخصصة للبشرة والشعر لحالات تكيس المبايض',
    subServices: [
      { id: 'pc1', nameAr: 'عناية بشرة دهنية', nameEn: 'Oily Skin Facial', price: 200, durationMin: 45, emoji: '✨', precautions: 'منظفات طبية' },
      { id: 'pc2', nameAr: 'علاج حب الشباب الهرموني', nameEn: 'Hormonal Acne Treatment', price: 250, durationMin: 50, emoji: '🔬', precautions: 'بإشراف طبي' },
      { id: 'pc3', nameAr: 'إزالة شعر زائد', nameEn: 'Excess Hair Removal', price: 300, durationMin: 60, emoji: '🌸', precautions: 'بشرة حساسة' },
    ],
  },
  bridal_prep: {
    nameAr: 'تحضير العروس', nameEn: 'Bridal Preparation', emoji: '👰‍♀️',
    description: 'برنامج متكامل لتحضير العروس — من ٦ أشهر حتى يوم الزفاف',
    subServices: [
      { id: 'br1', nameAr: 'باقة العروس الذهبية', nameEn: 'Golden Bride Package', price: 3500, durationMin: 300, emoji: '👑', precautions: '٦ جلسات على ٣ أشهر' },
      { id: 'br2', nameAr: 'باقة العروس الفضية', nameEn: 'Silver Bride Package', price: 2000, durationMin: 200, emoji: '💍', precautions: '٤ جلسات على شهرين' },
      { id: 'br3', nameAr: 'تجربة مكياج و تسريحة', nameEn: 'Makeup & Hair Trial', price: 400, durationMin: 90, emoji: '💄', precautions: 'جلسة تجربة قبل الزفاف' },
      { id: 'br4', nameAr: 'عناية بالأسنان', nameEn: 'Teeth Whitening', price: 600, durationMin: 60, emoji: '😁', precautions: 'تبييض آمن' },
    ],
  },
  working_woman: {
    nameAr: 'المرأة العاملة', nameEn: 'Working Woman Express', emoji: '💼',
    description: 'خدمات سريعة تناسب جدول المرأة العاملة — خلال استراحة الغداء',
    subServices: [
      { id: 'ww1', nameAr: 'مكياج سريع ٢٠ دقيقة', nameEn: '20-Min Express Makeup', price: 120, durationMin: 20, emoji: '💄', precautions: '' },
      { id: 'ww2', nameAr: 'مانيكير سريع', nameEn: 'Express Manicure', price: 80, durationMin: 20, emoji: '💅', precautions: '' },
      { id: 'ww3', nameAr: 'تصفيف سريع', nameEn: 'Express Styling', price: 100, durationMin: 25, emoji: '💇‍♀️', precautions: '' },
      { id: 'ww4', nameAr: 'باقة عاملة', nameEn: 'Working Woman Bundle', price: 250, durationMin: 60, emoji: '⏱️', precautions: 'مكياج + أظافر + شعر' },
    ],
  },
  first_beauty: {
    nameAr: 'أول مرة', nameEn: 'First Beauty Experience', emoji: '🦋',
    description: 'تجربة تجميل أولى للشابات — استشارة وتعليم بلطف',
    subServices: [
      { id: 'fb1', nameAr: 'استشارة تجميل أولى', nameEn: 'First Beauty Consultation', price: 80, durationMin: 30, emoji: '💬', precautions: 'تعليم روتين العناية' },
      { id: 'fb2', nameAr: 'جلسة تعليم مكياج', nameEn: 'Makeup Tutorial Session', price: 200, durationMin: 60, emoji: '📚', precautions: 'تعلم خطوة بخطوة' },
      { id: 'fb3', nameAr: 'أول عناية بالبشرة', nameEn: 'First Facial', price: 100, durationMin: 35, emoji: '✨', precautions: 'منتجات لطيفة جداً' },
    ],
  },
  breastfeeding_safe: {
    nameAr: 'عناية المرضعة', nameEn: 'Breastfeeding-Safe Beauty', emoji: '🍼',
    description: 'خدمات تجميل آمنة أثناء فترة الرضاعة الطبيعية',
    subServices: [
      { id: 'bf1', nameAr: 'عناية بشرة آمنة', nameEn: 'Nursing-Safe Facial', price: 180, durationMin: 40, emoji: '✨', precautions: 'خالي من الريتينول والساليسيليك' },
      { id: 'bf2', nameAr: 'مساج استرخاء', nameEn: 'Relaxation Massage', price: 250, durationMin: 50, emoji: '💆‍♀️', precautions: 'وضعية جانبية آمنة' },
      { id: 'bf3', nameAr: 'مانيكير آمن', nameEn: 'Safe Manicure', price: 100, durationMin: 30, emoji: '💅', precautions: 'منتجات غير سامة' },
    ],
  },
  fertility_wellness: {
    nameAr: 'عناية الخصوبة', nameEn: 'Fertility Wellness', emoji: '🌱',
    description: 'عناية متكاملة لتحضير الجسم للحمل — صحة وجمال',
    subServices: [
      { id: 'fw1', nameAr: 'مساج خصوبة', nameEn: 'Fertility Massage', price: 300, durationMin: 60, emoji: '💆‍♀️', precautions: 'تقنيات لطيفة' },
      { id: 'fw2', nameAr: 'عناية طبيعية بالبشرة', nameEn: 'Natural Skincare', price: 200, durationMin: 45, emoji: '🌿', precautions: 'منتجات عضوية ١٠٠٪' },
      { id: 'fw3', nameAr: 'جلسة استرخاء وتأمل', nameEn: 'Relaxation & Meditation', price: 250, durationMin: 75, emoji: '🧘‍♀️', precautions: 'تقليل التوتر' },
    ],
  },
  post_surgery: {
    nameAr: 'عناية بعد العمليات', nameEn: 'Post-Surgery Recovery', emoji: '🏥',
    description: 'عناية متخصصة بعد عمليات التجميل — استشفاء آمن وسريع',
    subServices: [
      { id: 'sg1', nameAr: 'تصريف لمفاوي', nameEn: 'Lymphatic Drainage', price: 350, durationMin: 60, emoji: '💆‍♀️', precautions: 'بعد موافقة الطبيب' },
      { id: 'sg2', nameAr: 'علاج ندوب', nameEn: 'Scar Treatment', price: 400, durationMin: 45, emoji: '🩹', precautions: 'بعد التئام الجرح' },
      { id: 'sg3', nameAr: 'كمادات باردة', nameEn: 'Cold Compress Therapy', price: 150, durationMin: 30, emoji: '🧊', precautions: 'لتقليل التورم' },
    ],
  },
  cycle_synced: {
    nameAr: 'عناية الدورة الشهرية', nameEn: 'Cycle-Synced Beauty', emoji: '📅',
    description: 'خدمات عناية متزامنة مع دورتكِ الشهرية لكل مرحلة',
    subServices: [
      { id: 'cs1', nameAr: 'مساج تخفيف الآلام', nameEn: 'Cramp Relief Massage', price: 250, durationMin: 50, emoji: '💆‍♀️', precautions: 'زيوت دافئة' },
      { id: 'cs2', nameAr: 'قناع وجه مهدئ', nameEn: 'Soothing Facial Mask', price: 120, durationMin: 25, emoji: '🎭', precautions: 'مكونات مهدئة' },
      { id: 'cs3', nameAr: 'حمام دافئ بالأعشاب', nameEn: 'Herbal Warm Bath', price: 180, durationMin: 40, emoji: '🛁', precautions: 'أعشاب طبية' },
    ],
  },
  mature_skin: {
    nameAr: 'عناية البشرة الناضجة', nameEn: 'Mature Skin Care (50+)', emoji: '✨',
    description: 'عناية متخصصة للبشرة فوق ٥٠ عاماً — مضادات شيخوخة وترطيب عميق',
    subServices: [
      { id: 'ms1', nameAr: 'شد البشرة بالكولاجين', nameEn: 'Collagen Lifting', price: 350, durationMin: 60, emoji: '⬆️', precautions: 'نتيجة فورية' },
      { id: 'ms2', nameAr: 'ترطيب عميق', nameEn: 'Deep Hydration', price: 280, durationMin: 50, emoji: '💧', precautions: 'حمض الهيالورونيك' },
      { id: 'ms3', nameAr: 'علاج التجاعيد', nameEn: 'Wrinkle Treatment', price: 400, durationMin: 55, emoji: '🔬', precautions: 'ببتيدات مركزة' },
    ],
  },
  ramadan_beauty: {
    nameAr: 'عناية رمضان', nameEn: 'Ramadan Beauty', emoji: '🌙',
    description: 'خدمات عناية مصممة خصيصاً لشهر رمضان — قبل الإفطار وبعده',
    subServices: [
      { id: 'rm1', nameAr: 'عناية قبل الإفطار', nameEn: 'Pre-Iftar Refresh', price: 150, durationMin: 30, emoji: '☀️', precautions: 'منعشة وسريعة' },
      { id: 'rm2', nameAr: 'عناية بعد التراويح', nameEn: 'Post-Taraweeh Facial', price: 200, durationMin: 45, emoji: '🌙', precautions: 'مرطبة ومهدئة' },
      { id: 'rm3', nameAr: 'حناء رمضانية', nameEn: 'Ramadan Henna', price: 150, durationMin: 35, emoji: '🌿', precautions: 'تصاميم رمضانية' },
    ],
  },
  eid_prep: {
    nameAr: 'تحضير العيد', nameEn: 'Eid Preparation', emoji: '🎊',
    description: 'باقة متكاملة لتحضير إطلالة العيد — شعر، مكياج، وأظافر',
    subServices: [
      { id: 'ei1', nameAr: 'باقة العيد الكاملة', nameEn: 'Full Eid Package', price: 600, durationMin: 150, emoji: '🌟', precautions: 'شعر + مكياج + أظافر' },
      { id: 'ei2', nameAr: 'باقة العيد السريعة', nameEn: 'Express Eid Package', price: 350, durationMin: 90, emoji: '⚡', precautions: 'مكياج + شعر' },
      { id: 'ei3', nameAr: 'مكياج العيد', nameEn: 'Eid Makeup', price: 250, durationMin: 60, emoji: '💄', precautions: 'إطلالة احتفالية' },
    ],
  },
  new_bride: {
    nameAr: 'العروس الجديدة', nameEn: 'New Bride (First Year)', emoji: '💝',
    description: 'عناية خاصة للسنة الأولى من الزواج — تألقي في كل المناسبات',
    subServices: [
      { id: 'nb1', nameAr: 'باقة السنة الأولى', nameEn: 'First Year Package', price: 2500, durationMin: 300, emoji: '💑', precautions: '١٢ جلسة على مدار السنة' },
      { id: 'nb2', nameAr: 'إطلالة عشاء رومانسي', nameEn: 'Romantic Dinner Look', price: 300, durationMin: 60, emoji: '🌹', precautions: '' },
      { id: 'nb3', nameAr: 'عناية قبل شهر العسل', nameEn: 'Pre-Honeymoon Prep', price: 500, durationMin: 120, emoji: '🏖️', precautions: 'باقة شاملة للسفر' },
    ],
  },
  student_beauty: {
    nameAr: 'عناية الطالبات', nameEn: 'Student Beauty', emoji: '📚',
    description: 'خدمات تجميل بأسعار مخفضة للطالبات الجامعيات',
    subServices: [
      { id: 'st1', nameAr: 'عناية بشرة طلابية', nameEn: 'Student Facial', price: 80, durationMin: 30, emoji: '✨', precautions: 'سعر مخفض للطالبات' },
      { id: 'st2', nameAr: 'مكياج تخرج', nameEn: 'Graduation Makeup', price: 150, durationMin: 45, emoji: '🎓', precautions: '' },
      { id: 'st3', nameAr: 'مانيكير طلابي', nameEn: 'Student Manicure', price: 50, durationMin: 25, emoji: '💅', precautions: 'سعر مخفض' },
    ],
  },
  fresh_start: {
    nameAr: 'بداية جديدة', nameEn: 'Fresh Start Glow Up', emoji: '🦋',
    description: 'باقات تجميل لبداية جديدة— تدللي واستعيدي ثقتكِ بنفسكِ',
    subServices: [
      { id: 'fs1', nameAr: 'باقة البداية الجديدة', nameEn: 'Fresh Start Package', price: 800, durationMin: 180, emoji: '🌟', precautions: 'شعر + بشرة + مكياج + أظافر' },
      { id: 'fs2', nameAr: 'استشارة تغيير الإطلالة', nameEn: 'Style Transformation', price: 350, durationMin: 90, emoji: '✨', precautions: 'استشارة شاملة' },
      { id: 'fs3', nameAr: 'جلسة تدليل', nameEn: 'Pampering Session', price: 400, durationMin: 120, emoji: '💆‍♀️', precautions: 'مساج + عناية بالبشرة' },
    ],
  },
  athlete_beauty: {
    nameAr: 'عناية الرياضيات', nameEn: 'Athlete Woman Beauty', emoji: '🏃‍♀️',
    description: 'خدمات عناية مصممة للمرأة النشطة — بعد التمرين وقبل المنافسات',
    subServices: [
      { id: 'at1', nameAr: 'مساج عضلي', nameEn: 'Sports Massage', price: 300, durationMin: 60, emoji: '💪', precautions: 'مثالي بعد التمرين' },
      { id: 'at2', nameAr: 'عناية بشرة مقاومة للعرق', nameEn: 'Sweat-Proof Facial', price: 220, durationMin: 45, emoji: '💦', precautions: 'منتجات مقاومة للتعرق' },
      { id: 'at3', nameAr: 'باديكير رياضي', nameEn: 'Athletic Pedicure', price: 150, durationMin: 35, emoji: '🦶', precautions: 'عناية بالأقدام المتعبة' },
    ],
  },
  chronic_care: {
    nameAr: 'عناية المريضات', nameEn: 'Chronic Illness Care', emoji: '💜',
    description: 'خدمات تجميل لطيفة للنساء المصابات بأمراض مزمنة — عناية برفق',
    subServices: [
      { id: 'cc1', nameAr: 'مساج لطيف', nameEn: 'Gentle Massage', price: 250, durationMin: 45, emoji: '🤲', precautions: 'ضغط خفيف جداً' },
      { id: 'cc2', nameAr: 'عناية بشرة مهدئة', nameEn: 'Soothing Facial', price: 200, durationMin: 40, emoji: '🌸', precautions: 'منتجات مضادة للحساسية' },
      { id: 'cc3', nameAr: 'جلسة استرخاء', nameEn: 'Relaxation Session', price: 180, durationMin: 50, emoji: '🧘‍♀️', precautions: 'بدون مجهود' },
    ],
  },
  plus_size_beauty: {
    nameAr: 'جمال المرأة الممتلئة', nameEn: 'Plus Size Beauty', emoji: '💖',
    description: 'خدمات تجميل شاملة للمرأة الممتلئة — كل جسم جميل',
    subServices: [
      { id: 'ps1', nameAr: 'مساج للجسم الممتلئ', nameEn: 'Plus Size Massage', price: 300, durationMin: 60, emoji: '💆‍♀️', precautions: 'طاولة واسعة' },
      { id: 'ps2', nameAr: 'عناية بالبشرة', nameEn: 'Body-Positive Facial', price: 220, durationMin: 45, emoji: '✨', precautions: 'منتجات مناسبة' },
      { id: 'ps3', nameAr: 'تصفيف شعر', nameEn: 'Volumizing Styling', price: 200, durationMin: 45, emoji: '💇‍♀️', precautions: 'تسريحات تناسب الوجه' },
    ],
  },
  natural_beauty: {
    nameAr: 'الجمال الطبيعي', nameEn: 'Natural Beauty', emoji: '🌿',
    description: 'خدمات تجميل ١٠٠٪ طبيعية — بدون أي مواد كيميائية',
    subServices: [
      { id: 'nt1', nameAr: 'عناية بشرة طبيعية', nameEn: 'Organic Facial', price: 250, durationMin: 50, emoji: '🌱', precautions: 'منتجات عضوية معتمدة' },
      { id: 'nt2', nameAr: 'صبغات شعر طبيعية', nameEn: 'Natural Hair Dye', price: 300, durationMin: 90, emoji: '🍂', precautions: 'حناء وأعشاب طبيعية' },
      { id: 'nt3', nameAr: 'قناع وجه طبيعي', nameEn: 'Natural Face Mask', price: 120, durationMin: 25, emoji: '🥑', precautions: 'مكونات طازجة' },
      { id: 'nt4', nameAr: 'زيوت عطرية', nameEn: 'Essential Oil Therapy', price: 180, durationMin: 40, emoji: '🌸', precautions: 'زيوت نقية ١٠٠٪' },
    ],
  },
  luxury_spa: {
    nameAr: 'يوم سبا فاخر', nameEn: 'Luxury Spa Day', emoji: '👑',
    description: 'تجربة سبا فاخرة — يوم كامل من التدليل والرفاهية',
    subServices: [
      { id: 'lx1', nameAr: 'يوم سبا ملكي', nameEn: 'Royal Spa Day', price: 2500, durationMin: 360, emoji: '👸', precautions: 'باقة كاملة ٦ ساعات' },
      { id: 'lx2', nameAr: 'نصف يوم سبا', nameEn: 'Half-Day Spa', price: 1200, durationMin: 180, emoji: '💎', precautions: 'مساج + عناية + غداء' },
      { id: 'lx3', nameAr: 'سبا مسائي', nameEn: 'Evening Spa', price: 800, durationMin: 120, emoji: '🌆', precautions: 'مساج + عشاء خفيف' },
    ],
  },
  homemaker_beauty: {
    nameAr: 'عناية ربات البيوت', nameEn: 'Homemaker Beauty', emoji: '🏠',
    description: 'باقات عناية تناسب جدول ربة المنزل — سريعة وفعالة',
    subServices: [
      { id: 'hm1', nameAr: 'باقة ربة المنزل', nameEn: 'Homemaker Package', price: 350, durationMin: 90, emoji: '🏡', precautions: 'شعر + أظافر + بشرة' },
      { id: 'hm2', nameAr: 'عناية بالأيدي', nameEn: 'Hand Care Treatment', price: 120, durationMin: 30, emoji: '🤲', precautions: 'للأيدي المتعبة من العمل' },
      { id: 'hm3', nameAr: 'استرخاء منزلي', nameEn: 'At-Home Relaxation', price: 400, durationMin: 120, emoji: '🛋️', precautions: 'زيارة منزلية' },
    ],
  },
  cancer_survivor: {
    nameAr: 'عناية المتعافيات', nameEn: 'Cancer Survivor Beauty', emoji: '🎗️',
    description: 'خدمات تجميل لطيفة للمتعافيات من السرطان — عناية بكل حب',
    subServices: [
      { id: 'cv1', nameAr: 'عناية بشرة لطيفة', nameEn: 'Ultra-Gentle Facial', price: 220, durationMin: 40, emoji: '🌸', precautions: 'منتجات خالية من المهيجات' },
      { id: 'cv2', nameAr: 'تصفيف شعر لطيف', nameEn: 'Gentle Hair Styling', price: 180, durationMin: 35, emoji: '💇‍♀️', precautions: 'للشعر الخفيف' },
      { id: 'cv3', nameAr: 'جلسة دعم نفسي', nameEn: 'Beauty Support Session', price: 200, durationMin: 50, emoji: '💝', precautions: 'دعم وتشجيع' },
    ],
  },
  single_mother: {
    nameAr: 'عناية الأم العزباء', nameEn: 'Single Mother Beauty', emoji: '💪',
    description: 'خدمات سريعة وبأسعار مناسبة للأمهات العازبات — أنتِ تستحقين',
    subServices: [
      { id: 'sm1', nameAr: 'باقة الأم العزباء', nameEn: 'Single Mom Package', price: 250, durationMin: 75, emoji: '💝', precautions: 'شعر + بشرة + أظافر' },
      { id: 'sm2', nameAr: 'خدمة مسائية', nameEn: 'Evening Service', price: 150, durationMin: 30, emoji: '🌙', precautions: 'بعد نوم الأطفال' },
      { id: 'sm3', nameAr: 'جلسة استرخاء سريعة', nameEn: 'Quick Relaxation', price: 100, durationMin: 25, emoji: '☕', precautions: 'استراحة أمومة' },
    ],
  },
  accessible_beauty: {
    nameAr: 'عناية ذوات الاحتياجات', nameEn: 'Accessible Beauty', emoji: '♿',
    description: 'خدمات تجميل مهيأة لذوات الاحتياجات الخاصة — وصول سهل وراحة تامة',
    subServices: [
      { id: 'ab1', nameAr: 'جلسة عناية مهيأة', nameEn: 'Accessible Beauty Session', price: 250, durationMin: 60, emoji: '💆‍♀️', precautions: 'مداخل واسعة وكراسي متحركة' },
      { id: 'ab2', nameAr: 'خدمة منزلية', nameEn: 'Home Visit Service', price: 350, durationMin: 90, emoji: '🏠', precautions: 'الفنية تأتي إليكِ' },
      { id: 'ab3', nameAr: 'استشارة عناية', nameEn: 'Beauty Consultation', price: 100, durationMin: 30, emoji: '💬', precautions: 'منتجات مناسبة لاحتياجاتكِ' },
    ],
  },
  diabetic_care: {
    nameAr: 'عناية مريضات السكر', nameEn: 'Diabetic-Safe Beauty', emoji: '💉',
    description: 'خدمات آمنة لمريضات السكري — عناية بالأقدام والبشرة الحساسة',
    subServices: [
      { id: 'db1', nameAr: 'باديكير آمن', nameEn: 'Diabetic-Safe Pedicure', price: 200, durationMin: 45, emoji: '🦶', precautions: 'تعقيم طبي وتعامل لطيف' },
      { id: 'db2', nameAr: 'عناية بالأقدام', nameEn: 'Foot Care Treatment', price: 250, durationMin: 50, emoji: '👣', precautions: 'ترطيب مكثف بدون جروح' },
      { id: 'db3', nameAr: 'عناية بشرة لطيفة', nameEn: 'Gentle Skincare', price: 180, durationMin: 40, emoji: '✨', precautions: 'منتجات طبية آمنة' },
    ],
  },
  healthcare_worker: {
    nameAr: 'عناية الكوادر الصحية', nameEn: 'Healthcare Worker Beauty', emoji: '🩺',
    description: 'خدمات مخصصة للطبيبات والممرضات — بعد مناوبات طويلة',
    subServices: [
      { id: 'hw1', nameAr: 'مساج ظهر وأكتاف', nameEn: 'Back & Shoulder Massage', price: 200, durationMin: 40, emoji: '💆‍♀️', precautions: 'لتخفيف آلام الوقوف الطويل' },
      { id: 'hw2', nameAr: 'عناية بالأيدي', nameEn: 'Healthcare Hand Care', price: 150, durationMin: 30, emoji: '🤲', precautions: 'للأيدي المتعبة من الغسيل المتكرر' },
      { id: 'hw3', nameAr: 'جلسة عناية سريعة', nameEn: 'Quick Recovery Session', price: 180, durationMin: 35, emoji: '⚡', precautions: 'قبل أو بعد المناوبة' },
    ],
  },
  teacher_beauty: {
    nameAr: 'عناية المعلمات', nameEn: 'Teacher Beauty', emoji: '🍎',
    description: 'خدمات تناسب جدول المعلمات — بعد الدوام المدرسي وفي العطل',
    subServices: [
      { id: 'tc1', nameAr: 'باقة المعلمة', nameEn: 'Teacher Package', price: 300, durationMin: 90, emoji: '📚', precautions: 'شعر + بشرة + أظافر' },
      { id: 'tc2', nameAr: 'عناية بالصوت والحنجرة', nameEn: 'Voice & Throat Care', price: 120, durationMin: 30, emoji: '🗣️', precautions: 'مساج واسترخاء' },
      { id: 'tc3', nameAr: 'إطلالة اليوم الدراسي', nameEn: 'School Day Look', price: 150, durationMin: 40, emoji: '💄', precautions: 'مكياج طبيعي خفيف' },
    ],
  },
  entrepreneur_beauty: {
    nameAr: 'عناية رائدات الأعمال', nameEn: 'Entrepreneur Woman Beauty', emoji: '💼',
    description: 'إطلالات قوية للمرأة القيادية — مظهر يعكس نجاحكِ',
    subServices: [
      { id: 'ep1', nameAr: 'إطلالة سيدات الأعمال', nameEn: 'Power Look Package', price: 500, durationMin: 120, emoji: '👩‍💼', precautions: 'مكياج + شعر + استشارة' },
      { id: 'ep2', nameAr: 'إطلالة اجتماعات', nameEn: 'Meeting Ready Look', price: 300, durationMin: 60, emoji: '📊', precautions: 'إطلالة احترافية' },
      { id: 'ep3', nameAr: 'باقة السفر', nameEn: 'Business Travel Package', price: 400, durationMin: 90, emoji: '✈️', precautions: 'إطلالة تدوم طوال اليوم' },
    ],
  },
  night_shift_beauty: {
    nameAr: 'عناية الليليات', nameEn: 'Night Shift Beauty', emoji: '🌙',
    description: 'خدمات تناسب العاملات ليلاً — مواعيد صباحية ومسائية مرنة',
    subServices: [
      { id: 'ns1', nameAr: 'عناية بعد الدوام', nameEn: 'Post-Shift Recovery', price: 250, durationMin: 60, emoji: '💆‍♀️', precautions: 'للاسترخاء بعد ليلة عمل' },
      { id: 'ns2', nameAr: 'علاج الهالات', nameEn: 'Dark Circle Treatment', price: 180, durationMin: 30, emoji: '👁️', precautions: 'لإخفاء آثار السهر' },
      { id: 'ns3', nameAr: 'باقة ليلية', nameEn: 'Night Worker Bundle', price: 350, durationMin: 100, emoji: '🌃', precautions: 'مساج + بشرة + استرخاء' },
    ],
  },
  grandmother_beauty: {
    nameAr: 'عناية الجدات', nameEn: 'Grandmother Beauty (60+)', emoji: '👵',
    description: 'عناية لطيفة وراقية للأمهات الكبيرات — لأن الجمال ليس له عمر',
    subServices: [
      { id: 'gm1', nameAr: 'باقة الجدة', nameEn: 'Grandmother Package', price: 350, durationMin: 100, emoji: '💐', precautions: 'شعر + بشرة + أظافر' },
      { id: 'gm2', nameAr: 'عناية بالبشرة الناضجة', nameEn: 'Senior Skincare', price: 250, durationMin: 50, emoji: '✨', precautions: 'ترطيب عميق' },
      { id: 'gm3', nameAr: 'جلسة مع الحفيدة', nameEn: 'Grandma-Granddaughter', price: 500, durationMin: 150, emoji: '👩‍👧', precautions: 'جلسة مشتركة مميزة' },
    ],
  },
  mother_of_bride: {
    nameAr: 'عناية أم العروس', nameEn: 'Mother of the Bride', emoji: '👩‍👧',
    description: 'إطلالة مميزة لأم العروس في يوم الزفاف — أنتِ نجمة أيضاً',
    subServices: [
      { id: 'mb1', nameAr: 'إطلالة أم العروس', nameEn: 'MOB Complete Look', price: 600, durationMin: 150, emoji: '👑', precautions: 'مكياج + شعر + بشرة' },
      { id: 'mb2', nameAr: 'باقة أم العروس', nameEn: 'MOB Package', price: 1200, durationMin: 250, emoji: '💎', precautions: '٣ جلسات قبل الزفاف' },
      { id: 'mb3', nameAr: 'تجربة مكياج', nameEn: 'MOB Makeup Trial', price: 300, durationMin: 60, emoji: '💄', precautions: 'جلسة تجربة' },
    ],
  },
  baby_shower: {
    nameAr: 'عناية الحامل قبل الولادة', nameEn: 'Baby Shower Beauty', emoji: '🎀',
    description: 'إطلالة متألقة لحفل استقبال المولود — احتفلي بقرب وصول طفلكِ',
    subServices: [
      { id: 'bs1', nameAr: 'إطلالة بيبي شاور', nameEn: 'Baby Shower Look', price: 300, durationMin: 90, emoji: '🤰', precautions: 'مكياج + شعر' },
      { id: 'bs2', nameAr: 'باقة الحامل', nameEn: 'Mama-to-Be Package', price: 450, durationMin: 150, emoji: '🎁', precautions: 'مساج حمل + عناية + مكياج' },
      { id: 'bs3', nameAr: 'حناء بيبي شاور', nameEn: 'Baby Shower Henna', price: 200, durationMin: 50, emoji: '🌿', precautions: 'حناء طبيعية آمنة' },
    ],
  },
  bridal_party: {
    nameAr: 'وصيفات العروس', nameEn: 'Bridal Party Beauty', emoji: '👯‍♀️',
    description: 'باقات جماعية لوصيفات العروس — إطلالات متناسقة بأفضل الأسعار',
    subServices: [
      { id: 'bp1', nameAr: 'باقة الوصيفات (٣)', nameEn: 'Bridesmaid Trio', price: 750, durationMin: 180, emoji: '💝', precautions: '٣ إطلالات متطابقة' },
      { id: 'bp2', nameAr: 'باقة الوصيفات (٥)', nameEn: 'Bridesmaid Group (5)', price: 1200, durationMin: 300, emoji: '🌸', precautions: '٥ إطلالات' },
      { id: 'bp3', nameAr: 'إطلالة وصيفة', nameEn: 'Single Bridesmaid', price: 280, durationMin: 60, emoji: '💄', precautions: 'إطلالة فردية' },
    ],
  },
  retirement_beauty: {
    nameAr: 'عناية المتقاعدات', nameEn: 'Retirement Beauty', emoji: '🏖️',
    description: 'باقات عناية للمرأة بعد التقاعد — اكتشفي نفسكِ من جديد',
    subServices: [
      { id: 'rt1', nameAr: 'باقة التقاعد', nameEn: 'Retirement Package', price: 600, durationMin: 150, emoji: '🌺', precautions: 'تجديد شامل' },
      { id: 'rt2', nameAr: 'استشارة نمط حياة', nameEn: 'Lifestyle Consultation', price: 250, durationMin: 60, emoji: '💬', precautions: 'روتين جديد' },
      { id: 'rt3', nameAr: 'جلسة استرخاء', nameEn: 'Retirement Relaxation', price: 350, durationMin: 90, emoji: '🧘‍♀️', precautions: 'يوم تدليل' },
    ],
  },
  expat_beauty: {
    nameAr: 'عناية الوافدات', nameEn: 'Expat Woman Beauty', emoji: '🌍',
    description: 'خدمات تجميل ترحيبية للوافدات إلى المملكة — أهلاً بكِ',
    subServices: [
      { id: 'ex1', nameAr: 'باقة الترحيب', nameEn: 'Welcome Package', price: 400, durationMin: 120, emoji: '🤝', precautions: 'تعريف بالمنتجات المحلية' },
      { id: 'ex2', nameAr: 'استشارة مناخية', nameEn: 'Climate Adaptation', price: 200, durationMin: 45, emoji: '☀️', precautions: 'عناية مناسبة للمناخ' },
      { id: 'ex3', nameAr: 'إطلالة سعودية', nameEn: 'Saudi Look', price: 300, durationMin: 60, emoji: '🇸🇦', precautions: 'مكياج خليجي' },
    ],
  },
  police_firefighter: {
    nameAr: 'عناية البطلات', nameEn: 'Women in Uniform Beauty', emoji: '👮‍♀️',
    description: 'خدمات عناية للعاملات في المجالات العسكرية والأمنية — أنتن بطلات',
    subServices: [
      { id: 'pf1', nameAr: 'مساج عضلي', nameEn: 'Deep Muscle Recovery', price: 280, durationMin: 60, emoji: '💪', precautions: 'للاسترخاء بعد المهام' },
      { id: 'pf2', nameAr: 'عناية سريعة', nameEn: 'Quick Beauty Refresh', price: 150, durationMin: 30, emoji: '⚡', precautions: 'قبل أو بعد الدوام' },
      { id: 'pf3', nameAr: 'باقة البطلة', nameEn: 'Hero Package', price: 450, durationMin: 120, emoji: '🎖️', precautions: 'مساج + بشرة + شعر' },
    ],
  },
  journalist_beauty: {
    nameAr: 'عناية الإعلاميات', nameEn: 'Media Woman Beauty', emoji: '🎤',
    description: 'إطلالات جاهزة للكاميرا — للصحفيات والمذيعات والمؤثرات',
    subServices: [
      { id: 'jr1', nameAr: 'مكياج كاميرا', nameEn: 'Camera-Ready Makeup', price: 350, durationMin: 60, emoji: '📺', precautions: 'يدوم تحت الأضواء' },
      { id: 'jr2', nameAr: 'إطلالة مقابلة', nameEn: 'Interview Look', price: 250, durationMin: 50, emoji: '🎙️', precautions: 'طبيعي واحترافي' },
      { id: 'jr3', nameAr: 'باقة الظهور الإعلامي', nameEn: 'Media Appearance Pack', price: 500, durationMin: 100, emoji: '🌟', precautions: 'مكياج + شعر + استشارة' },
    ],
  },
  artist_beauty: {
    nameAr: 'عناية الفنانات', nameEn: 'Artist Woman Beauty', emoji: '🎨',
    description: 'خدمات تجميل للفنانات والمبدعات — لأن الإبداع يبدأ من داخلكِ',
    subServices: [
      { id: 'ar1', nameAr: 'إطلالة افتتاح معرض', nameEn: 'Gallery Opening Look', price: 350, durationMin: 60, emoji: '🖼️', precautions: 'إطلالة فنية مميزة' },
      { id: 'ar2', nameAr: 'عناية بالأيدي', nameEn: 'Artist Hand Care', price: 180, durationMin: 35, emoji: '🤲', precautions: 'للرسامات والنحاتات' },
      { id: 'ar3', nameAr: 'جلسة إلهام', nameEn: 'Inspiration Session', price: 250, durationMin: 80, emoji: '✨', precautions: 'مساج + تأمل + إبداع' },
    ],
  },
  tech_woman: {
    nameAr: 'عناية التقنيات', nameEn: 'Tech Woman Beauty', emoji: '💻',
    description: 'خدمات تجميل للمبرمجات والمهندسات — لأن التقنية والجمال معاً',
    subServices: [
      { id: 'tw1', nameAr: 'عناية بالعينين', nameEn: 'Screen-Time Eye Care', price: 200, durationMin: 35, emoji: '👁️', precautions: 'لتخفيف إجهاد الشاشات' },
      { id: 'tw2', nameAr: 'مساج رقبة وأكتاف', nameEn: 'Tech Neck Massage', price: 220, durationMin: 40, emoji: '💆‍♀️', precautions: 'لتخفيف آلام الجلوس' },
      { id: 'tw3', nameAr: 'مانيكير تقنية', nameEn: 'Techie Manicure', price: 130, durationMin: 30, emoji: '💅', precautions: 'أظافر قصيرة وعملية' },
    ],
  },
  nomad_beauty: {
    nameAr: 'جمال البدويات', nameEn: 'Bedouin Woman Beauty', emoji: '🐪',
    description: 'خدمات تجميل تقليدية مستوحاة من تراث البادية — أصالة وجمال',
    subServices: [
      { id: 'nd1', nameAr: 'حناء بدوية', nameEn: 'Bedouin Henna', price: 250, durationMin: 60, emoji: '🌿', precautions: 'نقوش تقليدية أصيلة' },
      { id: 'nd2', nameAr: 'خلطات بدوية', nameEn: 'Bedouin Herbal Mix', price: 200, durationMin: 50, emoji: '🌵', precautions: 'أعشاب صحراوية' },
      { id: 'nd3', nameAr: 'إطلالة بدوية', nameEn: 'Bedouin Look', price: 300, durationMin: 75, emoji: '🏜️', precautions: 'مكياج + حناء + عطور' },
    ],
  },
  kbeauty_inspired: {
    nameAr: 'جمال كوري', nameEn: 'K-Beauty Inspired', emoji: '🇰🇷',
    description: 'إطلالات مستوحاة من الجمال الكوري — نضارة وإشراقة',
    subServices: [
      { id: 'kb1', nameAr: 'روتين كوري', nameEn: 'K-Beauty Routine', price: 280, durationMin: 60, emoji: '✨', precautions: '١٠ خطوات للعناية' },
      { id: 'kb2', nameAr: 'مكياج كوري', nameEn: 'K-Beauty Makeup', price: 250, durationMin: 50, emoji: '💄', precautions: 'إطلالة طبيعية ناعمة' },
      { id: 'kb3', nameAr: 'قناع وجه كوري', nameEn: 'Korean Sheet Mask', price: 100, durationMin: 20, emoji: '🎭', precautions: 'ورق كوري أصلي' },
    ],
  },
  eco_beauty: {
    nameAr: 'الجمال المستدام', nameEn: 'Eco-Conscious Beauty', emoji: '🌍',
    description: 'خدمات تجميل صديقة للبيئة — جميلة أنتِ وجميلة الأرض',
    subServices: [
      { id: 'ec1', nameAr: 'عناية بشرة صديقة للبيئة', nameEn: 'Eco-Friendly Facial', price: 250, durationMin: 50, emoji: '🌱', precautions: 'منتجات قابلة للتحلل' },
      { id: 'ec2', nameAr: 'صبغات نباتية', nameEn: 'Plant-Based Hair Color', price: 300, durationMin: 90, emoji: '🍃', precautions: 'خالي من الأمونيا' },
      { id: 'ec3', nameAr: 'باقة خضراء', nameEn: 'Green Package', price: 450, durationMin: 120, emoji: '♻️', precautions: 'بصمة كربونية منخفضة' },
    ],
  },
  volunteer_beauty: {
    nameAr: 'عناية المتطوعات', nameEn: 'Volunteer Woman Beauty', emoji: '🤝',
    description: 'خدمات مخصصة للمتطوعات — شكراً لعطائكِ',
    subServices: [
      { id: 'vl1', nameAr: 'باقة المتطوعة', nameEn: 'Volunteer Package', price: 200, durationMin: 75, emoji: '💝', precautions: 'خصم خاص للمتطوعات' },
      { id: 'vl2', nameAr: 'جلسة استرخاء', nameEn: 'Relaxation Session', price: 150, durationMin: 45, emoji: '🧘‍♀️', precautions: 'بعد يوم تطوعي' },
      { id: 'vl3', nameAr: 'إطلالة مناسبة خيرية', nameEn: 'Charity Event Look', price: 180, durationMin: 50, emoji: '🎗️', precautions: 'لحضور الفعاليات' },
    ],
  },
  gamer_beauty: {
    nameAr: 'عناية اللاعبات', nameEn: 'Gamer Girl Beauty', emoji: '🎮',
    description: 'خدمات تجميل لمحبات الألعاب — إطلالات مستوحاة من عالم الألعاب',
    subServices: [
      { id: 'gm1', nameAr: 'مانيكير ألعاب', nameEn: 'Gamer Nail Art', price: 180, durationMin: 40, emoji: '💅', precautions: 'تصاميم شخصيات الألعاب' },
      { id: 'gm2', nameAr: 'عناية بالعينين', nameEn: 'Gamer Eye Care', price: 150, durationMin: 30, emoji: '👁️', precautions: 'لتخفيف إجهاد الشاشة' },
      { id: 'gm3', nameAr: 'إطلالة بطولة', nameEn: 'Tournament Look', price: 250, durationMin: 50, emoji: '🏆', precautions: 'للظهور في البطولات' },
    ],
  },
  writer_beauty: {
    nameAr: 'عناية الكاتبات', nameEn: 'Writer Woman Beauty', emoji: '✍️',
    description: 'خدمات تجميل للكاتبات والمؤلفات — لأن الكلمات الجميلة تبدأ من روح جميلة',
    subServices: [
      { id: 'wr1', nameAr: 'جلسة كتابة', nameEn: 'Writing Session', price: 200, durationMin: 60, emoji: '📝', precautions: 'مساج + وقت كتابة' },
      { id: 'wr2', nameAr: 'إطلالة توقيع كتاب', nameEn: 'Book Signing Look', price: 300, durationMin: 60, emoji: '📚', precautions: 'إطلالة أدبية راقية' },
      { id: 'wr3', nameAr: 'عناية بالأيدي', nameEn: 'Writer Hand Care', price: 150, durationMin: 30, emoji: '🤲', precautions: 'للأيدي المتعبة من الكتابة' },
    ],
  },
  photographer_beauty: {
    nameAr: 'عناية المصورات', nameEn: 'Photographer Woman Beauty', emoji: '📷',
    description: 'خدمات تجميل للمصورات — لأنكِ خلف الكاميرا تستحقين الظهور',
    subServices: [
      { id: 'ph1', nameAr: 'إطلالة أمام الكاميرا', nameEn: 'Behind-the-Lens Look', price: 280, durationMin: 55, emoji: '📸', precautions: 'للمناسبات الخاصة' },
      { id: 'ph2', nameAr: 'عناية بالأيدي', nameEn: 'Photographer Hand Care', price: 150, durationMin: 30, emoji: '🤲', precautions: 'للأيدي الحاملة للكاميرا' },
      { id: 'ph3', nameAr: 'مساج أكتاف', nameEn: 'Shoulder Massage', price: 200, durationMin: 35, emoji: '💆‍♀️', precautions: 'لتخفيف حمل المعدات' },
    ],
  },
  chef_beauty: {
    nameAr: 'عناية الطباخات', nameEn: 'Chef Woman Beauty', emoji: '👩‍🍳',
    description: 'خدمات تجميل للطباخات والشيفات — لأن المطبخ والجمال يلتقيان',
    subServices: [
      { id: 'ch1', nameAr: 'عناية بالأيدي', nameEn: 'Chef Hand Care', price: 180, durationMin: 35, emoji: '🤲', precautions: 'ترطيب مكثف' },
      { id: 'ch2', nameAr: 'عناية بشرة مقاومة للحرارة', nameEn: 'Heat-Resistant Facial', price: 220, durationMin: 45, emoji: '🔥', precautions: 'للبشرة المعرضة للحرارة' },
      { id: 'ch3', nameAr: 'إطلالة مطعم', nameEn: 'Restaurant Look', price: 250, durationMin: 50, emoji: '🍽️', precautions: 'للظهور في المطعم' },
    ],
  },
  dancer_beauty: {
    nameAr: 'عناية الراقصات', nameEn: 'Dancer Woman Beauty', emoji: '💃',
    description: 'خدمات تجميل للراقصات — مرونة وجمال في كل حركة',
    subServices: [
      { id: 'dn1', nameAr: 'مساج مرونة', nameEn: 'Flexibility Massage', price: 300, durationMin: 60, emoji: '🤸‍♀️', precautions: 'زيوت دافئة' },
      { id: 'dn2', nameAr: 'إطلالة عرض', nameEn: 'Performance Look', price: 350, durationMin: 70, emoji: '🎭', precautions: 'مكياج يدوم طويلاً' },
      { id: 'dn3', nameAr: 'عناية بالأقدام', nameEn: 'Dancer Foot Care', price: 200, durationMin: 40, emoji: '🦶', precautions: 'للأقدام المتعبة' },
    ],
  },
  designer_beauty: {
    nameAr: 'عناية المصممات', nameEn: 'Fashion Designer Beauty', emoji: '👗',
    description: 'خدمات تجميل لمصممات الأزياء — لأن الأناقة تبدأ منكِ',
    subServices: [
      { id: 'ds1', nameAr: 'إطلالة عرض أزياء', nameEn: 'Fashion Show Look', price: 400, durationMin: 80, emoji: '👠', precautions: 'إطلالة راقية' },
      { id: 'ds2', nameAr: 'استشارة ألوان', nameEn: 'Color Consultation', price: 250, durationMin: 50, emoji: '🎨', precautions: 'تحليل ألوان البشرة' },
      { id: 'ds3', nameAr: 'باقة المصممة', nameEn: 'Designer Package', price: 600, durationMin: 150, emoji: '✨', precautions: 'شعر + مكياج + أظافر' },
    ],
  },
  florist_beauty: {
    nameAr: 'عناية بائعات الزهور', nameEn: 'Florist Woman Beauty', emoji: '💐',
    description: 'خدمات تجميل لمحبات وبائعات الزهور — جمال الطبيعة في عنايتكِ',
    subServices: [
      { id: 'fl1', nameAr: 'عناية بالأيدي', nameEn: 'Florist Hand Care', price: 150, durationMin: 30, emoji: '🤲', precautions: 'ترميم الأيدي المتعبة' },
      { id: 'fl2', nameAr: 'باقة ورود وعناية', nameEn: 'Flowers & Facial', price: 350, durationMin: 90, emoji: '🌸', precautions: 'باقة ورد + عناية بالبشرة' },
      { id: 'fl3', nameAr: 'إطلالة محل', nameEn: 'Shop Look', price: 200, durationMin: 45, emoji: '🏪', precautions: 'إطلالة منعشة' },
    ],
  },
  interpreter_beauty: {
    nameAr: 'عناية المترجمات', nameEn: 'Interpreter Woman Beauty', emoji: '🗣️',
    description: 'خدمات عناية للمترجمات — لأن صوتكِ الجميل يستحق إطلالة أجمل',
    subServices: [
      { id: 'it1', nameAr: 'عناية بالصوت', nameEn: 'Voice Care', price: 150, durationMin: 30, emoji: '🎤', precautions: 'مساج حنجرة وأعشاب' },
      { id: 'it2', nameAr: 'إطلالة مؤتمر', nameEn: 'Conference Look', price: 300, durationMin: 60, emoji: '🏛️', precautions: 'احترافية وأنيقة' },
      { id: 'it3', nameAr: 'جلسة استرخاء', nameEn: 'Interpreter Relaxation', price: 220, durationMin: 50, emoji: '🧘‍♀️', precautions: 'لتخفيف ضغط العمل' },
    ],
  },
};

export const womensServicesRouter = router({
  categories: publicProcedure.query(() =>
    Object.entries(SERVICES).map(([key, cat]) => ({
      key,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      emoji: cat.emoji,
      description: cat.description,
      serviceCount: cat.subServices.length,
    })),
  ),

  byCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const cat = SERVICES[input.category as keyof typeof SERVICES];
      if (!cat) throw new Error('القسم غير موجود');
      return cat;
    }),

  // Booking with special requirements
  book: customerProcedure
    .input(z.object({
      serviceId: z.string(),
      category: z.string(),
      preferredDate: z.string().optional(),
      specialNotes: z.string().optional(),
      pregnancyTrimester: z.number().min(1).max(3).optional(),
      postpartumWeeks: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const cat = SERVICES[input.category as keyof typeof SERVICES];
      const svc = cat?.subServices.find((s) => s.id === input.serviceId);
      if (!svc) throw new Error('الخدمة غير موجودة');

      return {
        bookingId: `WMN-${Date.now()}`,
        service: svc.nameAr,
        price: svc.price,
        durationMin: svc.durationMin,
        precautions: svc.precautions,
        status: 'CONFIRMED',
        specialRequirements: [
          input.pregnancyTrimester ? `ثلاثي الحمل: ${input.pregnancyTrimester}` : null,
          input.postpartumWeeks ? `أسابيع بعد الولادة: ${input.postpartumWeeks}` : null,
          input.specialNotes,
        ].filter(Boolean),
        message: 'تم الحجز بنجاح! سنراعي جميع احتياجاتكِ الخاصة 🌸',
      };
    }),

  // Safety tips for each category
  safetyTips: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const tips: Record<string, string[]> = {
        pregnancy_safe: ['تجنبي المنتجات المحتوية على الريتينول', 'استخدمي واقي شمس طبيعي', 'أخبري الفنية بحملكِ قبل الجلسة', 'تجنبي الزيوت العطرية القوية'],
        postpartum: ['انتظري ٦ أسابيع بعد الولادة الطبيعية', 'استشيري طبيبكِ قبل أي علاج', 'أخبري الفنية إذا كنتِ ترضعين طبيعياً'],
        henna: ['تأكدي من استخدام حناء طبيعية', 'تجنبي الحناء السوداء الكيميائية', 'اختبري على منطقة صغيرة أولاً'],
        brows_lashes: ['تأكدي من تعقيم الأدوات', 'أخبري الفنية عن أي حساسية', 'تجنبي الفرك بعد التركيب'],
        body_contouring: ['استشيري طبيب قبل الجلسات', 'اشربي ماء بكثرة بعد الجلسة', 'التزمي بعدد الجلسات الموصى به'],
        intimate_care: ['جميع الخدمات بخصوصية تامة', 'فنيات متخصصات ومعتمدات', 'منتجات طبية آمنة ومعقمة'],
        mommy_makeover: ['احجزي الجلسة في وقت تكونين فيه مرتاحة', 'أحضري صورة إطلالتكِ المفضلة', 'استمتعي بيومكِ الخاص'],
        teen_beauty: ['خدمات مناسبة للعمر', 'منتجات لطيفة وخالية من العطور', 'استشارة مجانية للروتين المناسب'],
        menopause: ['استخدمي منتجات غنية بالكولاجين', 'الترطيب المكثف ضروري', 'تجنبي المنتجات القاسية'],
        hijab_care: ['جلسات بخصوصية تامة', 'اهتمي بفروة الرأس', 'جففي شعركِ جيداً قبل الارتداء', 'استخدمي أغطية حرير'],
        pcos_care: ['استشيري طبيبكِ قبل العلاج', 'منتجات طبية مخصصة', 'متابعة دورية للبشرة'],
        bridal_prep: ['ابدئي قبل ٦ أشهر من الزفاف', 'جلسات منتظمة أفضل من جلسة واحدة', 'جربي المكياج قبل الزفاف بشهر'],
        working_woman: ['خدمات سريعة في ٢٠-٦٠ دقيقة', 'احجزي خلال استراحة الغداء', 'باقات موفرة للوقت'],
        first_beauty: ['تعلمي أساسيات العناية', 'لا تترددي في طرح الأسئلة', 'ابدئي بمنتجات بسيطة'],
        breastfeeding_safe: ['تجنبي الريتينول والساليسيليك', 'أخبري الفنية أنكِ مرضعة', 'استخدمي منتجات طبيعية ١٠٠٪'],
        fertility_wellness: ['استخدمي منتجات طبيعية فقط', 'تجنبي الزيوت العطرية القوية', 'استشيري طبيبكِ قبل أي علاج'],
        post_surgery: ['استشيري طبيبكِ أولاً', 'لا تبدأي قبل التئام الجروح', 'أخبري الفنية عن العملية'],
        cycle_synced: ['تجنبي العلاجات القوية خلال الدورة', 'المساج الدافئ يخفف الآلام', 'البشرة تكون أكثر حساسية'],
        mature_skin: ['استخدمي منتجات غنية بمضادات الأكسدة', 'الترطيب العميق أساسي', 'تجنبي المنتجات القاسية'],
        ramadan_beauty: ['احجزي قبل الإفطار أو بعد التراويح', 'اهتمي بالترطيب خلال الصيام', 'تجنبي العلاجات المجهدة'],
        eid_prep: ['احجزي قبل العيد بـ ٣ أيام على الأقل', 'الباقات توفر أكثر', 'تأكدي من توفر الفنية'],
        new_bride: ['استمتعي بكل لحظة', 'جربي إطلالات مختلفة', 'الباقة السنوية الأوفر'],
        student_beauty: ['أظهري بطاقتكِ الجامعية للخصم', 'احجزي في أوقات التخفيضات', 'استفسري عن عروض الطالبات'],
        fresh_start: ['هذه بدايتكِ الجديدة — استمتعي', 'جربي إطلالة مختلفة', 'الباقة الشاملة أوفر'],
        athlete_beauty: ['احجزي بعد التمرين للاستفادة القصوى', 'منتجات مقاومة للتعرق', 'اهتمي بترطيب جسمكِ'],
        chronic_care: ['استشيري طبيبكِ قبل الحجز', 'أخبري الفنية عن حالتكِ', 'جميع الخدمات بضغط خفيف'],
        plus_size_beauty: ['كل جسم جميل', 'طاولات وأدوات مناسبة', 'خدمات مريحة ومحترمة'],
        natural_beauty: ['منتجات عضوية معتمدة ١٠٠٪', 'خالي تماماً من المواد الكيميائية', 'مناسب لجميع أنواع البشرة'],
        luxury_spa: ['احجزي قبل أسبوع على الأقل', 'الغداء مشمول في الباقات', 'تجربة لا تنسى'],
        homemaker_beauty: ['خدمة منزلية متوفرة', 'باقات موفرة للوقت', 'اهتمي بنفسكِ كما تهتمين ببيتكِ'],
        cancer_survivor: ['منتجات خالية تماماً من المهيجات', 'جلسات خاصة وخصوصية تامة', 'لمسة لطيفة وحنونة'],
        single_mother: ['أسعار مخفضة ومناسبة', 'مواعيد مسائية متاحة', 'أنتِ بطلة وتستحقين الأفضل'],
        accessible_beauty: ['مداخل وممرات واسعة', 'كرسي متحرك مهيأ', 'فنيات مدربات على التعامل'],
        diabetic_care: ['تعقيم طبي كامل', 'لا جروح أو أدوات حادة', 'استشارة طبية مسبقة'],
        healthcare_worker: ['خصم خاص للكوادر الصحية', 'مواعيد مرنة', 'شكراً لخدمتكِ'],
        teacher_beauty: ['مواعيد بعد الدوام', 'عروض خاصة في الإجازات', 'خصم للمعلمات'],
        entrepreneur_beauty: ['إطلالات تدوم طوال اليوم', 'منتجات عالية الجودة', 'استشارة ألوان مجانية'],
        night_shift_beauty: ['مواعيد صباحية ومسائية', 'علاجات للهالات والإرهاق', 'اهتمي بصحتكِ بعد العمل'],
        grandmother_beauty: ['جلسات لطيفة ومريحة', 'خدمة منزلية متوفرة', 'جلسات مشتركة مع الحفيدات'],
        mother_of_bride: ['ابدئي قبل الزفاف بشهر', 'جلسة تجربة ضرورية', 'إطلالة تناسب فستانكِ'],
        baby_shower: ['حناء طبيعية آمنة للحامل', 'جلسات مريحة', 'احتفلي باقتراب مولودكِ'],
        bridal_party: ['احجزي للجميع معاً', 'خصم للمجموعات', 'إطلالات متناسقة'],
        retirement_beauty: ['اكتشفي نفسكِ من جديد', 'روتين يناسب وقتكِ', 'استمتعي بحريتكِ'],
        expat_beauty: ['أهلاً بكِ في السعودية', 'منتجات مناسبة للمناخ', 'تعرفي على الجمال الخليجي'],
        police_firefighter: ['شكراً لخدمتكِ', 'خصم خاص للعسكريات', 'جلسات بعد المناوبة'],
        journalist_beauty: ['مكياج يدوم تحت الأضواء', 'إطلالة طبيعية للكاميرا', 'استشارة ألوان مجانية'],
        artist_beauty: ['إطلالات تعكس شخصيتكِ الإبداعية', 'عناية خاصة بالأيدي', 'استوحي من لوحاتكِ'],
        tech_woman: ['عناية بالعينين من إجهاد الشاشات', 'مساج للرقبة والأكتاف', 'أظافر عملية'],
        nomad_beauty: ['حناء طبيعية ١٠٠٪', 'خلطات صحراوية أصيلة', 'عطور عربية تقليدية'],
        kbeauty_inspired: ['منتجات كورية أصلية', 'روتين ١٠ خطوات', 'إطلالة زجاجية'],
        eco_beauty: ['منتجات قابلة للتحلل', 'تغليف صديق للبيئة', 'بصمة كربونية منخفضة'],
        volunteer_beauty: ['خصم للمتطوعات', 'شكراً لعطائكِ', 'مواعيد مرنة'],
        gamer_beauty: ['تصاميم مستوحاة من الألعاب', 'عناية بالعينين', 'إطلالات للبثوث'],
        writer_beauty: ['جلسات هادئة للإبداع', 'عناية بالأيدي المتعبة', 'إطلالات للتوقيعات'],
        photographer_beauty: ['عناية بالأيدي والكتفين', 'إطلالات أنيقة', 'لكِ الحق في الظهور'],
        chef_beauty: ['عناية مكثفة بالأيدي', 'منتجات مقاومة للحرارة', 'للطباخات المحترفات'],
        dancer_beauty: ['زيوت دافئة للمرونة', 'مكياج يدوم طويلاً', 'عناية بالأقدام'],
        designer_beauty: ['استشارة ألوان مجانية', 'إطلالات عروض الأزياء', 'أناقة تبدأ منكِ'],
        florist_beauty: ['باقات ورد مع العناية', 'ترميم الأيدي', 'جمال الطبيعة'],
        interpreter_beauty: ['عناية بالصوت', 'إطلالات المؤتمرات', 'استرخاء بعد الترجمة'],
      };
      return tips[input.category] ?? [];
    }),
});
