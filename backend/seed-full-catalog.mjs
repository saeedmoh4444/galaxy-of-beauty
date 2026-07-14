import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to build nameJson { ar, en }
const n = (ar, en) => ({ ar, en });

// =============================================================================
// CATALOG DATA — 26 Main Categories, 200+ Subcategories, 400+ Services
// =============================================================================

const catalog = [
  // ===== 1. HAIR SERVICES =====
  {
    cat: n('العناية بالشعر', 'Hair Services'),
    slug: 'hair-services',
    icon: '💇‍♀️',
    subcategories: [
      {
        cat: n('قصات وتصفيف', 'Styling & Cuts'),
        slug: 'hair-styling-cuts',
        services: [
          { title: n('قص شعر دقيق (مدرج، طبقات، بيكسي، بوب)', 'Precision Cut (blunt, layered, pixie, bob)'), price: 120, min: 60 },
          { title: n('استشوار (ناعم، حجم، كيرلي)', 'Blowout (straight, voluminous, curly)'), price: 80, min: 45 },
          { title: n('تقصير أطراف (جاف أو رطب)', 'Trim (dry or wet)'), price: 40, min: 20 },
          { title: n('تسريحة رسمية (عقدة، شينيون، ضفائر)', 'Formal Styling (updos, chignons, braided)'), price: 200, min: 90 },
          { title: n('استشوار مع تمليس بالسيراميك', 'Blow-dry with Styling Iron'), price: 100, min: 60 },
          { title: n('تقصير غرة فقط', 'Fringe/Bangs Trim Only'), price: 25, min: 15 },
          { title: n('سيلك برس / تمليس حراري', 'Silk Press / Thermal Straightening'), price: 150, min: 90 },
          { title: n('قص شعر أطفال (بنات)', "Kid's Haircut (Girls)"), price: 60, min: 30 },
        ],
      },
      {
        cat: n('صبغات وعلاجات', 'Color & Treatments'),
        slug: 'hair-color-treatments',
        services: [
          { title: n('تغطية الجذور', 'Root Touch-up / Regrowth Colour'), price: 100, min: 60 },
          { title: n('صبغ كامل (دائم/نصف دائم)', 'Full Colour (permanent/semi/demi)'), price: 200, min: 120 },
          { title: n('هايلايت (فويل، كاب، بيبي لايت)', 'Highlights (foil, cap, babylights)'), price: 250, min: 150 },
          { title: n('لو لايت', 'Lowlights'), price: 200, min: 120 },
          { title: n('بالاياج / أومبري / سومبري', 'Balayage / Ombré / Sombré'), price: 350, min: 180 },
          { title: n('دمج لون / تظليل الجذور', 'Colour Melting / Root Shadow'), price: 180, min: 90 },
          { title: n('ألوان عصرية (باستيل، زاهية)', 'Fashion Colours (pastels, vivids)'), price: 300, min: 150 },
          { title: n('علاج كيراتين لتنعيم الشعر', 'Keratin Smoothing Treatment'), price: 400, min: 180 },
          { title: n('تنعيم ياباني / تمليس حراري', 'Japanese Straightening / Thermal Reconditioning'), price: 500, min: 240 },
          { title: n('بوتوكس شعر / نانوبلاستيا', 'Hair Botox / Nanoplastia'), price: 350, min: 120 },
          { title: n('ماسك ترطيب عميق', 'Deep Conditioning Mask'), price: 80, min: 30 },
          { title: n('تنظيف وتوازن فروة الرأس', 'Scalp Detox & Rebalancing'), price: 120, min: 45 },
          { title: n('علاج أولابليكس / بناء الروابط', 'Olaplex / Bond-building Add-on'), price: 100, min: 30 },
          { title: n('غسول لون / تونر', 'Gloss / Toner / Glaze'), price: 90, min: 30 },
        ],
      },
      {
        cat: n('وصلات الشعر', 'Extensions'),
        slug: 'hair-extensions',
        services: [
          { title: n('تركيب وصلات شريطية', 'Tape-in Extension Application'), price: 600, min: 180 },
          { title: n('وصلات خياطة / ويـفت', 'Weft / Sew-in Extensions'), price: 800, min: 240 },
          { title: n('قص ودمج وصلات كليب', 'Clip-in Extension Cut & Blend'), price: 150, min: 60 },
          { title: n('وصلات I-tip / U-tip / نانو رينج', 'I-tip / U-tip / Nano Ring Extensions'), price: 700, min: 240 },
          { title: n('صيانة الوصلات (إعادة تركيب)', 'Extension Maintenance (move-up, re-taping)'), price: 200, min: 90 },
          { title: n('إزالة الوصلات', 'Extension Removal'), price: 100, min: 45 },
          { title: n('تسريحة مخصصة للوصلات', 'Custom Extension Styling'), price: 150, min: 60 },
        ],
      },
      {
        cat: n('الشعر الطبيعي والمعالج', 'Texture & Natural Hair'),
        slug: 'natural-hair',
        services: [
          { title: n('قص كيرلي (قص على الشعر الجاف)', 'Curly Cut (cut on dry curls)'), price: 150, min: 75 },
          { title: n('تسريحة تويست / بريد', 'Twist-out / Braid-out Styling'), price: 120, min: 75 },
          { title: n('رود سيت / فلكسي رود', 'Silk Rod Sets / Flexi Rod Sets'), price: 130, min: 90 },
          { title: n('غسيل وتصفيف كيرلي طبيعي', 'Natural Hair Wash & Defined Curl Set'), price: 100, min: 75 },
          { title: n('فرد كيميائي / تكسير', 'Relaxer / Texturiser Application'), price: 250, min: 120 },
          { title: n('بيرم / تمويج رقمي', 'Perm / Body Wave / Digital Perm'), price: 300, min: 180 },
        ],
      },
    ],
  },

  // ===== 2. BODY & SPA =====
  {
    cat: n('العناية بالجسم والسبا', 'Body & Spa Services'),
    slug: 'body-spa',
    icon: '💆‍♀️',
    subcategories: [
      {
        cat: n('المساج العلاجي', 'Massage Therapy'),
        slug: 'massage-therapy',
        services: [
          { title: n('مساج الأنسجة العميقة', 'Deep Tissue Massage'), price: 250, min: 60 },
          { title: n('مساج سويدي', 'Swedish Massage'), price: 200, min: 60 },
          { title: n('مساج الحجر الساخن', 'Hot Stone Massage'), price: 280, min: 75 },
          { title: n('مساج بالزيوت العطرية', 'Aromatherapy Massage'), price: 250, min: 60 },
          { title: n('مساج تصريف لمفاوي', 'Lymphatic Drainage Massage'), price: 280, min: 75 },
          { title: n('مساج الحمل', 'Prenatal Massage'), price: 250, min: 60 },
          { title: n('مساج ما بعد الولادة', 'Postnatal Massage'), price: 250, min: 60 },
          { title: n('مساج ثنائي (جنباً إلى جنب)', 'Couples Massage'), price: 500, min: 60 },
          { title: n('رفلكسولوجي القدمين', 'Foot Reflexology'), price: 180, min: 45 },
          { title: n('مساج الرأس والرقبة والأكتاف', 'Head, Neck & Shoulder Massage'), price: 150, min: 30 },
          { title: n('مساج سريع / كرسي', 'Chair / Express Massage'), price: 100, min: 20 },
          { title: n('مساج تايلندي', 'Thai Massage'), price: 250, min: 60 },
          { title: n('مساج البامبو', 'Bamboo Massage'), price: 280, min: 60 },
          { title: n('مساج زيت دافئ لفروة الرأس', 'Warm Oil Scalp Massage'), price: 120, min: 30 },
        ],
      },
      {
        cat: n('علاجات الجسم', 'Body Treatments'),
        slug: 'body-treatments',
        services: [
          { title: n('تقشير كامل للجسم (سكر/ملح)', 'Full-Body Exfoliating Scrub'), price: 200, min: 45 },
          { title: n('تلميع الجسم', 'Body Polishing'), price: 220, min: 45 },
          { title: n('لفة إزالة السموم (طين، طحالب)', 'Detox Body Wrap (mud, algae, clay)'), price: 250, min: 60 },
          { title: n('لفة تخسيس / مضادة للسيلوليت', 'Slimming / Anti-Cellulite Wrap'), price: 280, min: 60 },
          { title: n('لفة ترطيب الجسم', 'Hydrating Body Cocoon'), price: 230, min: 60 },
          { title: n('ماسك الجسم / طين', 'Body Mask / Clay Application'), price: 200, min: 45 },
          { title: n('سبراي تان (عادي، سريع، مخصص)', 'Spray Tan (standard, rapid, custom)'), price: 180, min: 30 },
          { title: n('كونتور الجسم بتقنية البخاخ', 'Airbrush Body Contour Tanning'), price: 200, min: 30 },
          { title: n('تحضير وتطبيق التان الذاتي', 'Self-tan Preparation & Application'), price: 150, min: 30 },
          { title: n('جلسة فرشاة جافة', 'Dry Brushing Treatment'), price: 80, min: 20 },
          { title: n('علاج دش فيشي', 'Vichy Shower Treatment'), price: 250, min: 45 },
        ],
      },
      {
        cat: n('العلاج المائي والحراري', 'Hydrotherapy & Thermal'),
        slug: 'hydro-thermal',
        services: [
          { title: n('جاكوزي / حمام دوامي', 'Jacuzzi / Whirlpool Bath'), price: 150, min: 30 },
          { title: n('حمام مائي علاجي', 'Hydrotherapy Tub Soak'), price: 200, min: 45 },
          { title: n('حمام أعشاب / حليب', 'Herbal / Milk Bath'), price: 180, min: 30 },
          { title: n('ساونا (فنلندية، تحت الحمراء)', 'Sauna (Finnish, Infrared)'), price: 120, min: 30 },
          { title: n('غرفة بخار / حمام مغربي', 'Steam Room / Hammam'), price: 120, min: 30 },
          { title: n('حمام بارد / غطس ثلجي', 'Cold Plunge / Ice Bath'), price: 100, min: 15 },
        ],
      },
      {
        cat: n('باقات سبا', 'Spa Packages'),
        slug: 'spa-packages',
        services: [
          { title: n('باقة الهروب المصغر (2-3 خدمات)', 'Express Mini Escape (2-3 services)'), price: 400, min: 120 },
          { title: n('خلوة نصف يوم', 'Half-Day Retreat'), price: 800, min: 240 },
          { title: n('جلسة تدليل يوم كامل', 'Full-Day Pampering Session'), price: 1400, min: 420 },
          { title: n('باقة صديقات (ثنائية)', 'Duo / Best-Friend Package'), price: 700, min: 180 },
          { title: n('باقة أم وابنتها', 'Mother-Daughter Package'), price: 600, min: 180 },
          { title: n('باقة توهج الحمل', 'Prenatal Glow Package'), price: 500, min: 150 },
          { title: n('باقة "ابني باقتك" المخصصة', 'Customised "Build Your Own" Bundle'), price: 350, min: 120 },
        ],
      },
    ],
  },

  // ===== 3. SKINCARE & FACIAL =====
  {
    cat: n('العناية بالبشرة والوجه', 'Skincare & Facial Services'),
    slug: 'skincare-facial',
    icon: '🧖‍♀️',
    subcategories: [
      {
        cat: n('جلسات facial الكلاسيكية', 'Classic Facials'),
        slug: 'classic-facials',
        services: [
          { title: n('Facial ترطيب مكثف', 'Hydrating / Moisture Boost Facial'), price: 200, min: 60 },
          { title: n('Facial مضاد للشيخوخة / كولاجين', 'Anti-Aging / Collagen Facial'), price: 250, min: 75 },
          { title: n('Facial تنظيف وتوضيح للبشرة الدهنية', 'Acne-Clearing / Clarifying Facial'), price: 200, min: 60 },
          { title: n('Facial تنقية عميقة', 'Deep-Cleansing / Purifying Facial'), price: 180, min: 60 },
          { title: n('Facial تفتيح / فيتامين سي', 'Brightening / Vitamin C Facial'), price: 220, min: 60 },
          { title: n('Facial تهدئة للبشرة الحساسة', 'Sensitive Skin Soothing Facial'), price: 200, min: 60 },
          { title: n('Facial للمراهقات', 'Teen Facial'), price: 150, min: 45 },
          { title: n('Facial للظهر ("باك فيشل")', 'Back Facial ("Bacial")'), price: 180, min: 45 },
          { title: n('علاج منطقة العين', 'Eye Contour Treatment'), price: 120, min: 30 },
          { title: n('علاج الرقبة والصدر', 'Neck & Décolleté Treatment'), price: 130, min: 30 },
        ],
      },
      {
        cat: n('علاجات سريرية متقدمة', 'Advanced Clinical Treatments'),
        slug: 'advanced-clinical',
        services: [
          { title: n('تقشير كيميائي (سطحي، متوسط)', 'Chemical Peel (superficial, medium)'), price: 300, min: 45 },
          { title: n('تقشير بالإنزيمات / يقطين', 'Enzyme Peel / Pumpkin Peel'), price: 250, min: 45 },
          { title: n('تقشير ميكروكريستال / صنفرة', 'Microdermabrasion'), price: 280, min: 45 },
          { title: n('ميكرونيدلنج / تحفيز الكولاجين', 'Microneedling / Collagen Induction'), price: 350, min: 75 },
          { title: n('علاج ضوء LED (أحمر، أزرق، تحت أحمر)', 'LED Light Therapy'), price: 200, min: 30 },
          { title: n('شد البشرة بالترددات الراديوية', 'Radiofrequency Skin Tightening'), price: 400, min: 60 },
          { title: n('Cryo Facial / علاج بالبرودة', 'Cryo Facial / Cool Therapy'), price: 300, min: 30 },
          { title: n('Facial الأكسجين', 'Oxygen Infusion Facial'), price: 250, min: 45 },
          { title: n('هايدرافيشل / تقشير رطب', 'Hydrafacial / Wet Dermabrasion'), price: 350, min: 60 },
          { title: n('إدخال بالموجات فوق الصوتية', 'Ultrasonic / Iontophoresis Infusion'), price: 250, min: 45 },
          { title: n('علاج بالتردد العالي', 'High-Frequency Treatment'), price: 150, min: 20 },
        ],
      },
      {
        cat: n('صبغات ورموش وحواجب', 'Tinting, Lashes & Brows'),
        slug: 'tinting-lashes-brows',
        services: [
          { title: n('صبغ حواجب', 'Eyebrow Tint'), price: 60, min: 20 },
          { title: n('صبغ رموش', 'Eyelash Tint'), price: 60, min: 20 },
          { title: n('تجليس الحواجب', 'Brow Lamination'), price: 150, min: 45 },
          { title: n('رفع الرموش / بيرم رموش', 'Lash Lift / Lash Perm'), price: 180, min: 45 },
          { title: n('تركيب رموش (كلاسيك، هايبرد، فوليوم، ميغا)', 'Lash Extensions (classic, hybrid, volume, mega)'), price: 300, min: 120 },
          { title: n('تعبئة رموش / إعادة ملء', 'Lash Extension Infill / Refill'), price: 150, min: 60 },
          { title: n('إزالة الرموش', 'Lash Extension Removal'), price: 60, min: 20 },
          { title: n('تشكيل وتنسيق الحواجب (شمع + صبغ)', 'Brow Shaping & Style (wax + tint combo)'), price: 100, min: 30 },
        ],
      },
    ],
  },

  // ===== 4. NAIL CARE =====
  {
    cat: n('العناية بالأظافر', 'Nail Care'),
    slug: 'nail-care',
    icon: '💅',
    subcategories: [
      {
        cat: n('مانيكير', 'Manicures'),
        slug: 'manicures',
        services: [
          { title: n('مانيكير كلاسيكي / عادي', 'Classic / Standard Manicure'), price: 60, min: 45 },
          { title: n('مانيكير جل (منقوع)', 'Gel Polish Manicure (soak-off)'), price: 100, min: 60 },
          { title: n('مانيكير بيلدر جل / BIAB', 'Builder Gel / BIAB Manicure'), price: 130, min: 75 },
          { title: n('طقم أظافر أكريليك كامل', 'Acrylic Full Set'), price: 200, min: 120 },
          { title: n('تعبئة أكريليك / إعادة توازن', 'Acrylic Infill / Rebalance'), price: 120, min: 75 },
          { title: n('مانيكير باودر (SNS)', 'Dip Powder (SNS) Manicure'), price: 150, min: 75 },
          { title: n('مانيكير روسي جاف', 'Russian / E-file Dry Manicure'), price: 120, min: 75 },
          { title: n('فن الأظافر (بسيط، 3D، جواهر)', 'Nail Art (simple, 3D, gems)'), price: 50, min: 30 },
          { title: n('مانيكير فرنسي / أومبري', 'French / Ombré Manicure'), price: 80, min: 60 },
          { title: n('علاج وتقوية الأظافر', 'Cuticle Care & Nail Strengthening'), price: 70, min: 30 },
          { title: n('تركيب أظافر Gel-X / سوفت جل', 'Gel-X / Soft Gel Tip Extensions'), price: 180, min: 90 },
        ],
      },
      {
        cat: n('بديكير', 'Pedicures'),
        slug: 'pedicures',
        services: [
          { title: n('بديكير كلاسيكي', 'Classic Pedicure'), price: 80, min: 60 },
          { title: n('بديكير جل', 'Gel Polish Pedicure'), price: 120, min: 75 },
          { title: n('بديكير سبا (تقشير، ماسك، مساج)', 'Spa Pedicure (exfoliation, mask, massage)'), price: 180, min: 90 },
          { title: n('علاج الكالو / العناية المكثفة بالكعب', 'Callus Peel / Intensive Heel Treatment'), price: 100, min: 45 },
          { title: n('بديكير طبي / جاف', 'Medical / Dry Pedicure (no water)'), price: 150, min: 60 },
          { title: n('بديكير بارافين', 'Paraffin Pedicure'), price: 150, min: 60 },
          { title: n('بديكير فاخر (جوارب مدفئة، مساج أطول)', 'Luxury Pedicure (heated booties, longer massage)'), price: 250, min: 90 },
        ],
      },
      {
        cat: n('إضافات الأظافر', 'Nail Add-ons'),
        slug: 'nail-addons',
        services: [
          { title: n('علاج بارافين لليدين', 'Paraffin Wax Treatment for Hands'), price: 60, min: 20 },
          { title: n('تقشير وماسك اليدين', 'Hand Exfoliation & Mask'), price: 50, min: 20 },
          { title: n('علاج زيت ساخن للأظافر', 'Hot Oil Nail & Cuticle Treatment'), price: 40, min: 15 },
          { title: n('ترميم الأظافر / لف حرير', 'Nail Repair / Silk Wrap'), price: 50, min: 20 },
          { title: n('إعادة بناء أظافر القدم', 'Toe Nail Reconstruction'), price: 60, min: 30 },
        ],
      },
    ],
  },

  // ===== 5. HAIR REMOVAL =====
  {
    cat: n('إزالة الشعر', 'Hair Removal'),
    slug: 'hair-removal',
    icon: '✨',
    subcategories: [
      {
        cat: n('الشمع', 'Waxing'),
        slug: 'waxing',
        services: [
          { title: n('أرجل كاملة / نصف أرجل', 'Full Legs / Half Legs'), price: 120, min: 45 },
          { title: n('أذرع كاملة / نصف أذرع', 'Full Arms / Half Arms'), price: 80, min: 30 },
          { title: n('إبطين', 'Underarms'), price: 40, min: 15 },
          { title: n('خط البيكيني', 'Bikini Line'), price: 60, min: 20 },
          { title: n('برازيلي (منطقة كاملة)', 'Brazilian (full intimate)'), price: 150, min: 45 },
          { title: n('هوليوود / بيكيني كامل', 'Hollywood / Full Bikini'), price: 180, min: 60 },
          { title: n('بيكيني ممتد', 'Extended Bikini'), price: 100, min: 30 },
          { title: n('ظهر كامل / أسفل ظهر', 'Full Back / Lower Back'), price: 120, min: 30 },
          { title: n('صدر كامل / بطن', 'Full Chest / Abdomen Strip'), price: 100, min: 30 },
          { title: n('شمع الوجه (شفايف، ذقن، جوانب، كامل)', 'Facial Waxing (lip, chin, sideburns, full face)'), price: 70, min: 30 },
          { title: n('شمع الحواجب', 'Brow Wax'), price: 30, min: 10 },
          { title: n('شمع المؤخرة', 'Buttocks Wax'), price: 80, min: 20 },
          { title: n('شمع أصابع اليدين والقدمين', 'Toes & Fingers Wax'), price: 30, min: 10 },
        ],
      },
      {
        cat: n('الفتلة (الخيط)', 'Threading'),
        slug: 'threading',
        services: [
          { title: n('حواجب بالفتلة', 'Eyebrow Threading'), price: 30, min: 15 },
          { title: n('شفايف بالفتلة', 'Upper Lip Threading'), price: 20, min: 10 },
          { title: n('ذقن بالفتلة', 'Chin Threading'), price: 25, min: 10 },
          { title: n('جوانب بالفتلة', 'Sideburns Threading'), price: 30, min: 15 },
          { title: n('وجه كامل بالفتلة', 'Full Face Threading'), price: 80, min: 30 },
          { title: n('جبين بالفتلة', 'Forehead Threading'), price: 20, min: 10 },
          { title: n('رقبة بالفتلة', 'Neck Threading'), price: 25, min: 10 },
        ],
      },
      {
        cat: n('السكر (بديل الشمع)', 'Sugaring'),
        slug: 'sugaring',
        services: [
          { title: n('أرجل بالسكر', 'Leg Sugaring'), price: 130, min: 45 },
          { title: n('بيكيني / برازيلي بالسكر', 'Bikini / Brazilian Sugaring'), price: 160, min: 45 },
          { title: n('إبط بالسكر', 'Underarm Sugaring'), price: 50, min: 15 },
          { title: n('وجه بالسكر', 'Facial Sugaring'), price: 80, min: 25 },
        ],
      },
      {
        cat: n('إزالة الشعر بالليزر', 'Laser Hair Removal'),
        slug: 'laser-hair-removal',
        services: [
          { title: n('ليزر منطقة صغيرة (شفايف، ذقن، جوانب)', 'Small Area Laser'), price: 80, min: 20 },
          { title: n('ليزر منطقة متوسطة (إبط، بيكيني، أيدي)', 'Medium Area Laser'), price: 150, min: 30 },
          { title: n('ليزر منطقة كبيرة (أرجل كاملة، أذرع، ظهر)', 'Large Area Laser'), price: 300, min: 60 },
          { title: n('ليزر منطقة كبيرة جداً (جسم كامل)', 'Extra-Large Area Laser (Full Body)'), price: 500, min: 90 },
          { title: n('باقة 6 جلسات ليزر', '6-Session Laser Package'), price: 400, min: 30 },
          { title: n('تهدئة البشرة بعد الليزر', 'Skin Cooling / Soothing After Laser'), price: 60, min: 15 },
        ],
      },
    ],
  },

  // ===== 6. MAKEUP =====
  {
    cat: n('مكياج', 'Makeup Services'),
    slug: 'makeup',
    icon: '💄',
    subcategories: [
      {
        cat: n('تطبيق مكياج', 'Makeup Application'),
        slug: 'makeup-application',
        services: [
          { title: n('مكياج يومي / طبيعي', 'Everyday / Natural Makeup'), price: 180, min: 60 },
          { title: n('مكياج سهرات / مناسبات', 'Evening / Party / Event Makeup'), price: 250, min: 90 },
          { title: n('مكياج عرايس (تجربة + يوم الزفاف)', 'Bridal Makeup (trial + day-of)'), price: 1200, min: 180 },
          { title: n('مكياج صديقات العروس', 'Bridal Party Makeup'), price: 300, min: 90 },
          { title: n('مكياج Airbrush', 'Airbrush Makeup'), price: 350, min: 75 },
          { title: n('مكياج HD / كاميرات', 'HD / Camera-Ready Makeup'), price: 280, min: 75 },
          { title: n('مكياج تخرج', 'Prom / Graduation Makeup'), price: 200, min: 75 },
          { title: n('مكياج تصوير / افتتاحية', 'Photoshoot / Editorial Makeup'), price: 300, min: 90 },
          { title: n('مكياج للبشرة الناضجة', 'Mature Skin Makeup'), price: 220, min: 60 },
          { title: n('درس مكياج (شخصي أو مجموعة)', 'Makeup Lesson (personal or group)'), price: 300, min: 120 },
          { title: n('جلسة تجديد حقيبة المكياج / تحليل الألوان', 'Makeup Bag Refresh / Colour Analysis'), price: 250, min: 90 },
          { title: n('تركيب رموش اصطناعية (شريط)', 'False Lash Application (strip lashes)'), price: 40, min: 15 },
        ],
      },
    ],
  },

  // ===== 7. BRIDAL & SPECIAL OCCASIONS =====
  {
    cat: n('تجهيز العرايس والمناسبات', 'Bridal & Special Occasion Prep'),
    slug: 'bridal-special',
    icon: '👰',
    subcategories: [
      {
        cat: n('باقات العروس', 'Bridal Packages'),
        slug: 'bridal-packages',
        services: [
          { title: n('تجربة تسريحة العروس', 'Bridal Hair Trial'), price: 300, min: 90 },
          { title: n('تجربة مكياج العروس', 'Bridal Makeup Trial'), price: 350, min: 90 },
          { title: n('تسريحة + مكياج العروس (يوم الزفاف)', 'Bridal Hair + Makeup Combo (day-of)'), price: 1500, min: 240 },
          { title: n('باقة صديقات العروس', 'Bridal Party Package'), price: 800, min: 180 },
          { title: n('برنامج عناية بالبشرة قبل الزفاف', 'Pre-Bridal Skin Prep Course'), price: 1200, min: 300 },
          { title: n('عناية بالجسم قبل الزفاف', 'Pre-Bridal Body Care'), price: 600, min: 150 },
          { title: n('حناء / نقش (يدين وقدمين)', 'Mehndi / Henna (hands & feet)'), price: 300, min: 120 },
          { title: n('مكياج خطوبة', 'Engagement Party Glam'), price: 400, min: 90 },
          { title: n('تسريحة ومكياج بيبي شاور', 'Baby Shower / Maternity Shoot Styling'), price: 350, min: 90 },
          { title: n('تسريحة بروفة العشاء', 'Wedding Rehearsal Dinner Styling'), price: 250, min: 75 },
        ],
      },
    ],
  },

  // ===== 8. HOLISTIC WELLNESS =====
  {
    cat: n('الصحة الشاملة والعلاجات البديلة', 'Holistic Wellness & Alternative Therapies'),
    slug: 'holistic-wellness',
    icon: '🧘‍♀️',
    subcategories: [
      {
        cat: n('جلسات صحية', 'Wellness Sessions'),
        slug: 'wellness-sessions',
        services: [
          { title: n('جلسة ساونا', 'Sauna Session'), price: 100, min: 30 },
          { title: n('ساونا تحت الحمراء', 'Infrared Sauna Session'), price: 120, min: 30 },
          { title: n('غرفة بخار', 'Steam Room Access'), price: 100, min: 30 },
          { title: n('علاج بالملح', 'Salt Therapy / Halotherapy'), price: 150, min: 45 },
          { title: n('خزان عائم / حرمان حسي', 'Floatation Tank / Sensory Deprivation'), price: 250, min: 60 },
          { title: n('يوغا (هاثا، فينياسا، ين، حمل)', 'Yoga Session (Hatha, Vinyasa, Yin, Prenatal)'), price: 150, min: 60 },
          { title: n('بيلاتيس (مات، ريفورمر)', 'Pilates (mat, reformer)'), price: 180, min: 60 },
          { title: n('تأمل / تنفس', 'Meditation / Breathwork Class'), price: 100, min: 45 },
          { title: n('جلسة ساوند باث', 'Sound Bath / Singing Bowl Therapy'), price: 180, min: 60 },
          { title: n('طاقة ريكي', 'Reiki Energy Healing'), price: 200, min: 60 },
          { title: n('إبر صينية (وجه، جسم)', 'Acupuncture (facial, body)'), price: 280, min: 60 },
          { title: n('حجامة (جافة، رطبة)', 'Cupping Therapy (dry, wet)'), price: 180, min: 45 },
          { title: n('علاجات أيورفيدا', 'Ayurvedic Consultation & Treatments'), price: 300, min: 75 },
          { title: n('تبخيرة نسائية / يـوني ستيم', 'Yoni Steam / Vaginal Steam'), price: 200, min: 45 },
          { title: n('مساج رحم / خصوبة', 'Womb Massage / Fertility Massage'), price: 250, min: 60 },
          { title: n('استشارة تغذية وعافية', 'Wellness Coaching / Nutrition Guidance'), price: 200, min: 60 },
        ],
      },
    ],
  },

  // ===== 9. BODY CONTOURING =====
  {
    cat: n('تنسيق القوام والتجميل غير الجراحي', 'Body Contouring & Non-Invasive Aesthetics'),
    slug: 'body-contouring',
    icon: '🔬',
    subcategories: [
      {
        cat: n('تقنيات تنسيق القوام', 'Body Contouring Technologies'),
        slug: 'contouring-tech',
        services: [
          { title: n('تجميد الدهون / كرايو', 'Cryolipolysis (Fat Freezing)'), price: 600, min: 60 },
          { title: n('شد الجسم بالترددات الراديوية', 'Radiofrequency Body Sculpting'), price: 500, min: 60 },
          { title: n('تكسير الدهون بالموجات الصوتية', 'Cavitation / Ultrasonic Fat Reduction'), price: 400, min: 45 },
          { title: n('لايـزر ليبو', 'Laser Lipo (low-level laser)'), price: 450, min: 45 },
          { title: n('نحت العضلات بالتحفيز الكهرومغناطيسي', 'EMS Muscle Sculpting'), price: 500, min: 45 },
          { title: n('رفع المؤخرة بالشفط', 'Vacuum Butt Lifting'), price: 350, min: 45 },
          { title: n('مساج وود / كونتر بودي', 'Wood Therapy / Body Contour Massage'), price: 250, min: 60 },
          { title: n('مساج مضاد للسيلوليت', 'Anti-Cellulite Rolling / Endermology'), price: 280, min: 60 },
          { title: n('تصريف لمفاوي بعد الجراحة', 'Post-Surgical Compression / Lymphatic Drainage'), price: 300, min: 60 },
          { title: n('علاجات شد الجلد', 'Body Skin Tightening Treatments'), price: 450, min: 60 },
        ],
      },
    ],
  },

  // ===== 10. PERMANENT & SEMI-PERMANENT MAKEUP =====
  {
    cat: n('المكياج الدائم وشبه الدائم', 'Permanent & Semi-Permanent Makeup (PMU)'),
    slug: 'pmu',
    icon: '✒️',
    subcategories: [
      {
        cat: n('إجراءات PMU', 'PMU Procedures'),
        slug: 'pmu-procedures',
        services: [
          { title: n('مايكروبليدنج حواجب', 'Microblading Eyebrows'), price: 600, min: 120 },
          { title: n('حواجب كومبينيشن (شعر + تظليل)', 'Combination Brows'), price: 700, min: 120 },
          { title: n('حواجب باودر / أومبري', 'Powder/Ombré Brows'), price: 650, min: 120 },
          { title: n('تاتو شفايف / Lip Blush', 'Lip Blush / Lip Tint'), price: 600, min: 120 },
          { title: n('تاتو محدد عيون (رفيع، كلاسيك)', 'Eyeliner Tattoo'), price: 500, min: 90 },
          { title: n('تاتو شعر الرأس للنساء', 'Scalp Micropigmentation (women\'s hairline)'), price: 800, min: 180 },
          { title: n('تاتو نمش', 'Freckle Tattooing'), price: 400, min: 60 },
          { title: n('تاتو هالة الثدي (بعد الجراحة)', 'Areola Tattooing (post-surgery)'), price: 500, min: 90 },
        ],
      },
    ],
  },

  // ===== 11. AESTHETIC & INJECTABLES (MEDI-SPA) =====
  {
    cat: n('التجميل الطبي والحقن', 'Aesthetic & Injectable Services (Medi-Spa)'),
    slug: 'medi-spa',
    icon: '💉',
    subcategories: [
      {
        cat: n('علاجات طبية تجميلية', 'Medical Aesthetics'),
        slug: 'medical-aesthetics',
        services: [
          { title: n('حقن مضادة للتجاعيد (جبهة، حول العين)', 'Anti-Wrinkle Injections'), price: 800, min: 30 },
          { title: n('فيلر (شفايف، خدود، فك، ذقن)', 'Dermal Fillers (lips, cheeks, jawline, chin)'), price: 1200, min: 45 },
          { title: n('بروفايلو / محسنات البشرة', 'Profhilo / Skin Boosters'), price: 1000, min: 45 },
          { title: n('PRP للوجه / Facial مصاص دماء', 'PRP Facial / Vampire Facial'), price: 800, min: 60 },
          { title: n('PRP لاستعادة الشعر', 'PRP Hair Restoration'), price: 900, min: 60 },
          { title: n('ميزوثيرابي (وجه، شعر، جسم)', 'Mesotherapy (face, hair, body)'), price: 600, min: 45 },
          { title: n('حقن إذابة الدهون (ذقن مزدوج)', 'Fat Dissolving Injections (double chin)'), price: 700, min: 30 },
          { title: n('محاليل وريدية / drips تجميل', 'IV Vitamin Drips / Beauty Drips'), price: 500, min: 60 },
          { title: n('حقن فيتامين B12 / طاقة', 'Vitamin B12 / Energy Injections'), price: 200, min: 15 },
          { title: n('فيلر تحت العين', 'Tear Trough / Under-Eye Filler'), price: 1000, min: 45 },
        ],
      },
    ],
  },

  // ===== 12. PERSONAL TRAINING & FITNESS =====
  {
    cat: n('لياقة وتمارين شخصية (نسائية)', 'Personal Training & Fitness (Women-Focused)'),
    slug: 'fitness-women',
    icon: '🏋️‍♀️',
    subcategories: [
      {
        cat: n('برامج اللياقة', 'Fitness Programs'),
        slug: 'fitness-programs',
        services: [
          { title: n('تدريب شخصي خاص', 'One-on-One Personal Training'), price: 200, min: 60 },
          { title: n('تدريب مجموعة صغيرة (نساء فقط)', 'Small Group Training (women-only)'), price: 100, min: 60 },
          { title: n('لياقة الحمل', 'Prenatal Fitness'), price: 180, min: 60 },
          { title: n('تعافي ما بعد الولادة', 'Postnatal Recovery (core & pelvic floor)'), price: 200, min: 60 },
          { title: n('بار', 'Barre Class'), price: 120, min: 60 },
          { title: n('بيلاتيس (مات / ريفورمر)', 'Pilates Mat / Reformer'), price: 150, min: 60 },
          { title: n('يوغا (فينياسا، استرخاء، حمل)', 'Yoga (vinyasa, restorative, prenatal)'), price: 120, min: 60 },
          { title: n('رقص شرقي / بول / كرسي', 'Belly Dance / Pole Fitness / Chair Dance'), price: 130, min: 60 },
          { title: n('جلسة تمدد ومرونة', 'Stretching & Mobility Session'), price: 100, min: 45 },
          { title: n('تدريب أونلاين / افتراضي', 'Online / Virtual Training Session'), price: 120, min: 60 },
        ],
      },
    ],
  },

  // ===== 13. EXPRESS & MINI TREATMENTS =====
  {
    cat: n('علاجات سريعة ومصغرة', 'Express & Mini Treatments (Lunch-Break Beauty)'),
    slug: 'express-mini',
    icon: '⚡',
    subcategories: [
      {
        cat: n('خدمات سريعة', 'Express Services'),
        slug: 'express-services',
        services: [
          { title: n('استشوار سريع (30 دقيقة)', 'Express Blow-dry (30 min)'), price: 60, min: 30 },
          { title: n('Facial سريع (30 دقيقة)', 'Express Facial (30 min)'), price: 100, min: 30 },
          { title: n('مانيكير سريع (برد، تشكيل، طلاء)', 'Express Manicure'), price: 40, min: 20 },
          { title: n('بديكير سريع (برد وتغيير طلاء)', 'Express Pedicure'), price: 50, min: 25 },
          { title: n('ترتيب حواجب سريع (شمع/فتلة + صبغ)', 'Express Brow Tidy'), price: 60, min: 20 },
          { title: n('مساج مصغر (ظهر، رقبة، أكتاف 15-20 دقيقة)', 'Mini Massage (15-20 min)'), price: 80, min: 20 },
          { title: n('ماسك وجه سريع فقط', 'Flash Facial Mask Only'), price: 50, min: 15 },
          { title: n('تغيير طلاء جل (يدين أو قدمين)', 'Gel Polish Change (hands or toes)'), price: 60, min: 30 },
          { title: n('بخاخ إخفاء الجذور (مؤقت)', 'Root Concealer Spray (temporary fix)'), price: 40, min: 10 },
          { title: n('درس تصفيف مصغر', 'Mini Dry Styling Lesson'), price: 80, min: 30 },
          { title: n('تقشير سريع للجسم (ظهر وأذرع)', 'Express Body Scrub (back and arms)'), price: 80, min: 20 },
        ],
      },
    ],
  },

  // ===== 14. MOBILE & IN-HOME =====
  {
    cat: n('خدمات متنقلة ومنزلية وفندقية', 'Mobile, In-Home & Hotel Services'),
    slug: 'mobile-services',
    icon: '🏠',
    subcategories: [
      {
        cat: n('خدمات منزلية', 'At-Home Services'),
        slug: 'at-home-services',
        services: [
          { title: n('كوافيرة متنقلة (قص، استشوار، تسريحة)', 'Mobile Hairdresser'), price: 250, min: 90 },
          { title: n('مانيكير وبديكير متنقل', 'Mobile Manicure & Pedicure'), price: 200, min: 90 },
          { title: n('سبراي تان متنقل', 'Mobile Spray Tan'), price: 220, min: 45 },
          { title: n('مساج متنقل (جميع الأنواع)', 'Mobile Massage'), price: 300, min: 60 },
          { title: n('فنانة مكياج متنقلة', 'Mobile Makeup Artist'), price: 350, min: 90 },
          { title: n('سبا منبثق (جناح عرايس، غرفة فندق)', 'Hotel/Spa Pop-up (bridal suite, hotel room)'), price: 500, min: 180 },
          { title: n('تركيب رموش متنقل', 'Mobile Lash Extensions'), price: 350, min: 90 },
          { title: n('صبغ حواجب ورموش متنقل', 'Mobile Brow & Lash Tinting'), price: 150, min: 30 },
          { title: n('مدربة شخصية / يوغا متنقلة', 'Mobile Personal Training / Yoga'), price: 250, min: 60 },
          { title: n('استشارة تنسيق ملابس منزلية', 'Wardrobe & Styling Consultation at Home'), price: 300, min: 120 },
          { title: n('محلول وريدي منزلي (بإشراف ممرضة)', 'At-Home IV Drip (by registered nurse)'), price: 600, min: 60 },
        ],
      },
    ],
  },

  // ===== 15. PARTY & GROUP PACKAGES =====
  {
    cat: n('حفلات وباقات المجموعات', 'Party, Group & Event Packages'),
    slug: 'party-group',
    icon: '🎉',
    subcategories: [
      {
        cat: n('باقات المناسبات', 'Event Packages'),
        slug: 'event-packages',
        services: [
          { title: n('حفل تجهيز العروس (خدمات مصغرة)', 'Bridal Shower Beauty Bar'), price: 1500, min: 180 },
          { title: n('حفل تدليل العزوبية', "Hen's / Bachelorette Party Pampering"), price: 1800, min: 240 },
          { title: n('ليلة بنات (مانيكير، بديكير، Facial، مشروبات)', 'Girls\' Night In Package'), price: 600, min: 180 },
          { title: n('يوم ميلاد مع جلام', 'Birthday Party Glam Squad'), price: 1000, min: 180 },
          { title: n('حفل سبا أم وابنتها', 'Mother-Daughter Spa Party'), price: 800, min: 180 },
          { title: n('يوم عافية للشركات', 'Corporate Wellness Pop-up'), price: 2000, min: 300 },
          { title: n('باقة تسريحة ومكياج حفلة تخرج', 'Prom Group Hair & Makeup Packages'), price: 500, min: 120 },
          { title: n('باقة تجديد بعد الطلاق', 'Divorce / Break-Up Makeover Package'), price: 600, min: 180 },
          { title: n('جلسة تدليل بيبي سبرينكل', 'Baby Sprinkle Pamper Session'), price: 400, min: 120 },
          { title: n('ورشة احتساء وتصفيف (مشروبات + درس)', 'Sip & Style Workshop'), price: 250, min: 120 },
        ],
      },
    ],
  },

  // ===== 16. FOOT CARE & MEDICAL PEDICURE =====
  {
    cat: n('عناية متخصصة بالقدمين', 'Specialised Foot Care & Medical Pedicure'),
    slug: 'foot-care',
    icon: '🦶',
    subcategories: [
      {
        cat: n('علاجات القدم', 'Foot Treatments'),
        slug: 'foot-treatments',
        services: [
          { title: n('بديكير طبي', 'Medical Pedicure / Podiatry Pedicure'), price: 180, min: 60 },
          { title: n('بديكير لمرضى السكري', 'Diabetic-Safe Pedicure'), price: 200, min: 60 },
          { title: n('علاج ظفر نامي (بإشراف مختص)', 'Ingrown Toenail Trimming'), price: 100, min: 30 },
          { title: n('علاج تشقق الكعبين', 'Cracked Heel Repair Treatment'), price: 120, min: 45 },
          { title: n('علاج فطريات الأظافر (ليزر أو موضعي)', 'Fungal Nail Treatment'), price: 150, min: 30 },
          { title: n('حمام أيوني للقدمين', 'Foot Detox / Ionic Foot Bath'), price: 130, min: 30 },
          { title: n('فحص تقويم القدم', 'Custom Orthotic Scanning'), price: 200, min: 45 },
          { title: n('جلسة تقوية عظام القدمين', 'Barefoot Foot Strengthening Session'), price: 150, min: 45 },
        ],
      },
    ],
  },

  // ===== 17. TEETH WHITENING =====
  {
    cat: n('تبييض الأسنان وتجميل الفم', 'Teeth Whitening & Oral Aesthetics'),
    slug: 'teeth-whitening',
    icon: '😁',
    subcategories: [
      {
        cat: n('خدمات الأسنان التجميلية', 'Cosmetic Dental Services'),
        slug: 'cosmetic-dental',
        services: [
          { title: n('تبييض أسنان بالكرسي بتقنية LED', 'In-Chair LED Teeth Whitening'), price: 400, min: 60 },
          { title: n('طقم تبييض منزلي', 'Take-Home Whitening Kit'), price: 300, min: 30 },
          { title: n('تبييض بالفحم / طبيعي', 'Charcoal / Natural Whitening Treatment'), price: 150, min: 30 },
          { title: n('جواهر الأسنان', 'Teeth Jewellery Application'), price: 100, min: 15 },
          { title: n('علاج انتعاش النفس', 'Breath Refresh Spa Treatment'), price: 120, min: 30 },
        ],
      },
    ],
  },

  // ===== 18. BODY PIERCING =====
  {
    cat: n('ثقب الجسم', 'Body Piercing'),
    slug: 'body-piercing',
    icon: '💎',
    subcategories: [
      {
        cat: n('أنواع الثقب', 'Piercing Types'),
        slug: 'piercing-types',
        services: [
          { title: n('ثقب شحمة الأذن (إبرة)', 'Ear Lobe Piercing (needle, gun-free)'), price: 100, min: 20 },
          { title: n('ثقب الغضروف / Helix', 'Cartilage / Helix Piercing'), price: 150, min: 20 },
          { title: n('ثقب Tragus / Daith', 'Tragus / Daith Piercing'), price: 180, min: 25 },
          { title: n('ثقب السرة', 'Navel Piercing'), price: 200, min: 25 },
          { title: n('ثقب الأنف', 'Nose Piercing'), price: 120, min: 20 },
          { title: n('ثقب الحلمة (نساء فقط)', 'Nipple Piercing (women only)'), price: 200, min: 30 },
          { title: n('ثقب Dermal / Microdermal', 'Dermal Anchor / Microdermal Application'), price: 250, min: 30 },
          { title: n('طقم عناية ما بعد الثقب', 'Piercing Aftercare Kit & Check-up'), price: 60, min: 15 },
        ],
      },
    ],
  },

  // ===== 19. SKIN DIAGNOSTICS =====
  {
    cat: n('تشخيص البشرة وتركيبات مخصصة', 'Skin Diagnostics & Personalised Skin Cocktails'),
    slug: 'skin-diagnostics',
    icon: '🔍',
    subcategories: [
      {
        cat: n('تحليل البشرة', 'Skin Analysis'),
        slug: 'skin-analysis',
        services: [
          { title: n('تحليل بشرة ذكي (AI/كاميرا UV)', 'Smart Skin Analysis (AI/UV camera)'), price: 150, min: 30 },
          { title: n('تركيبة سيروم مخصصة', 'Custom Serum Blending'), price: 250, min: 45 },
          { title: n('ماسك مخصص يُحضر طازجاً', 'Personalised Mask Mixed Fresh'), price: 180, min: 30 },
          { title: n('استشارة بشرة ووصفة روتين', 'Skin Consultation & Routine Prescription'), price: 200, min: 45 },
          { title: n('اختبار حساسية الجلد', 'Patch Testing & Allergy Sensitivity Test'), price: 100, min: 30 },
          { title: n('استشارة بشرة بالحمض النووي', 'DNA-Based Skincare Consultation'), price: 500, min: 60 },
        ],
      },
    ],
  },

  // ===== 20. ADVANCED BROW & LASH =====
  {
    cat: n('خدمات حواجب ورموش متقدمة', 'Advanced Brow & Lash Services'),
    slug: 'advanced-brow-lash',
    icon: '👁️',
    subcategories: [
      {
        cat: n('علاجات متقدمة', 'Advanced Treatments'),
        slug: 'advanced-treatments',
        services: [
          { title: n('تخطيط الحواجب (بدون إزالة شعر)', 'Brow Mapping & Design'), price: 80, min: 20 },
          { title: n('صبغ حواجب بالحناء', 'Brow Henna'), price: 80, min: 25 },
          { title: n('باقة تجليس + صبغ + شمع للحواجب', 'Brow Lamination + Tint + Wax Combo'), price: 200, min: 60 },
          { title: n('بوتوكس رموش / رفع رموش بالكولاجين', 'Lash Botox / Lash Lift with Collagen'), price: 200, min: 45 },
          { title: n('تطبيق وتدريب سيروم الرموش', 'Lash Serum Application & Training'), price: 100, min: 20 },
          { title: n('رموش سفلية', 'Bottom Lash Extensions'), price: 80, min: 30 },
          { title: n('رموش ملونة', 'Coloured Lash Extensions'), price: 120, min: 45 },
          { title: n('درس رموش مغناطيسية', 'Magnetic Liner & Lash Application Lesson'), price: 120, min: 30 },
        ],
      },
    ],
  },

  // ===== 21. MENOPAUSE & CYCLE WELLNESS =====
  {
    cat: n('عناية ما قبل وبعد انقطاع الطمث', 'Menopause, Hormonal & Cycle Wellness'),
    slug: 'menopause-wellness',
    icon: '🌸',
    subcategories: [
      {
        cat: n('علاجات هرمونية', 'Hormonal Treatments'),
        slug: 'hormonal-treatments',
        services: [
          { title: n('Facial تبريد لسن اليأس', 'Menopause Cooling Facial'), price: 220, min: 60 },
          { title: n('مساج بطن لموازنة الهرمونات', 'Hormone-Balancing Abdominal Massage'), price: 250, min: 60 },
          { title: n('علاج عطري لأعراض سن اليأس', 'Aromatherapy for Menopause Symptoms'), price: 200, min: 45 },
          { title: n('يوغا دورة القمر', 'Moon Cycle Syncing Yoga'), price: 150, min: 60 },
          { title: n('علاج زيت الخروع للرحم', 'Womb-Healing Castor Oil Pack Treatment'), price: 180, min: 45 },
          { title: n('لفة الجسم بزيت زهرة الربيع', 'Evening Primrose Oil Body Wrap'), price: 230, min: 60 },
          { title: n('رفلكسولوجي الخصوبة', 'Fertility Reflexology'), price: 200, min: 45 },
          { title: n('استشارة تغذية لمرحلة ما قبل انقطاع الطمث', 'Perimenopause Nutritional Coaching'), price: 250, min: 60 },
        ],
      },
    ],
  },

  // ===== 22. POST-COSMETIC & POST-SURGERY =====
  {
    cat: n('رعاية ما بعد الجراحة والتجميل', 'Post-Cosmetic & Post-Surgery Care'),
    slug: 'post-surgery',
    icon: '🩹',
    subcategories: [
      {
        cat: n('رعاية ما بعد الجراحة', 'Post-Surgery Recovery'),
        slug: 'post-surgery-recovery',
        services: [
          { title: n('تصريف لمفاوي يدوي (بعد شفط دهون، BBL)', 'Manual Lymphatic Drainage (post-lipo, BBL)'), price: 350, min: 60 },
          { title: n('تركيب مشد ضاغط بعد الجراحة', 'Post-Surgical Compression Garment Fitting'), price: 150, min: 30 },
          { title: n('علاج تدبير الندب (سيليكون، مساج)', 'Scar Management Therapy'), price: 200, min: 45 },
          { title: n('مساج تحرير التليف', 'Fibrosis Release Massage'), price: 300, min: 60 },
          { title: n('مساج لطيف بعد استئصال الثدي', 'Post-Mastectomy Gentle Massage'), price: 280, min: 60 },
          { title: n('مساج ما بعد الولادة القيصرية', 'Post-C-Section Recovery Massage'), price: 280, min: 60 },
          { title: n('علاج كدمات بضوء LED', 'Bruise-Healing LED Therapy'), price: 200, min: 30 },
        ],
      },
    ],
  },

  // ===== 23. BEAUTY & WELLNESS WORKSHOPS =====
  {
    cat: n('ورش تجميل وعناية تعليمية', 'Beauty & Wellness Workshops'),
    slug: 'workshops',
    icon: '📚',
    subcategories: [
      {
        cat: n('ورش تعليمية', 'Learning Workshops'),
        slug: 'learning-workshops',
        services: [
          { title: n('ورشة تعلم الاستشوار بنفسك', 'DIY Blow-Dry Workshop'), price: 200, min: 90 },
          { title: n('تعلمي نوع تموجاتك وتصفيفها', 'Learn Your Curl Type & Styling'), price: 180, min: 90 },
          { title: n('درس مكياج يومي (مجموعة)', 'Everyday Makeup Lesson (group)'), price: 250, min: 120 },
          { title: n('أساسيات روتين البشرة', 'Skincare Layering 101'), price: 180, min: 60 },
          { title: n('فن الأظافر للمبتدئات', 'Nail Art for Beginners'), price: 150, min: 90 },
          { title: n('تأمل وتدوين موجه', 'Guided Meditation & Journaling Class'), price: 120, min: 60 },
          { title: n('ورشة ثقة ووقفة أمام الكاميرا', 'Boudoir Posing Confidence Workshop'), price: 200, min: 90 },
          { title: n('ورشة تنسيق أكاليل الزهور (إضافة للعرايس)', 'Wreath-Making / Floral Crown Workshop'), price: 180, min: 60 },
        ],
      },
    ],
  },

  // ===== 24. MEMBERSHIP & SUBSCRIPTIONS =====
  {
    cat: n('عضـويات واشتراكات', 'Membership & Subscription Tiers'),
    slug: 'memberships',
    icon: '⭐',
    subcategories: [
      {
        cat: n('خطط الاشتراك', 'Subscription Plans'),
        slug: 'subscription-plans',
        services: [
          { title: n('عضوية استشوار شهري غير محدود', 'Monthly Unlimited Blowout Membership'), price: 500, min: 0 },
          { title: n('عضوية Facial كلاسيكي شهري', 'Monthly Classic Facial Membership'), price: 350, min: 0 },
          { title: n('عضوية سبراي تان موسمية (3 جلسات/شهر)', 'Seasonal Spray Tan Membership'), price: 400, min: 0 },
          { title: n('نادي الأظافر (تغيير جل غير محدود)', 'Nail Club (unlimited gel polish changes)'), price: 300, min: 0 },
          { title: n('بطاقة أولوية VIP وحجوزات', 'VIP Priority Booking & Discounts Pass'), price: 600, min: 0 },
          { title: n('عضوية عافية (يوغا + ساونا)', 'Wellness Membership (yoga classes + sauna)'), price: 450, min: 0 },
          { title: n('باقة نقاط ولاء (شراء رصيد مسبق)', 'Loyalty Point Booster Package'), price: 250, min: 0 },
        ],
      },
    ],
  },

  // ===== 25. VIRTUAL & REMOTE =====
  {
    cat: n('استشارات وخدمات افتراضية', 'Virtual & Remote Consultations'),
    slug: 'virtual-remote',
    icon: '💻',
    subcategories: [
      {
        cat: n('خدمات عن بُعد', 'Remote Services'),
        slug: 'remote-services',
        services: [
          { title: n('تحليل بشرة افتراضي', 'Virtual Skin Analysis & Routine Planning'), price: 150, min: 45 },
          { title: n('درس مكياج افتراضي (فيديو خاص)', 'Virtual Makeup Lesson (1-on-1 video)'), price: 180, min: 60 },
          { title: n('إرشاد قص شعر منزلي', 'Virtual Haircut Guidance'), price: 100, min: 30 },
          { title: n('تدريب شخصي أونلاين', 'Online Personal Training Session'), price: 120, min: 60 },
          { title: n('يوغا / تأمل عن بُعد', 'Remote Yoga / Meditation Class'), price: 80, min: 60 },
          { title: n('استشارة عافية افتراضية', 'Virtual Wellness Coaching'), price: 150, min: 60 },
          { title: n('تحليل ألوان بالمكالمة الفيديو', 'Video Call Colour Analysis'), price: 180, min: 45 },
          { title: n('تخطيط زمني للعروس أونلاين', 'Online Bridal Beauty Timeline Planning'), price: 200, min: 60 },
        ],
      },
    ],
  },

  // ===== 26. NICHE & HYBRID =====
  {
    cat: n('خدمات مميزة وهجينة إضافية', 'Additional Niche & Hybrid Services'),
    slug: 'niche-hybrid',
    icon: '🌟',
    subcategories: [
      {
        cat: n('خدمات مميزة', 'Niche Services'),
        slug: 'niche-services',
        services: [
          { title: n('قائمة حواجب ورموش سريعة', 'Brow & Lash Bar Express Menu'), price: 100, min: 30 },
          { title: n('تاتو شعر الرأس لتكثيفه', 'Scalp Micropigmentation for Thinning Hair'), price: 900, min: 180 },
          { title: n('تظليل الجذور (نمو بدون خط)', 'Hair Smudging / Root Shadow'), price: 150, min: 60 },
          { title: n('تصفيف وتجهيز الباروكة', 'Wig & Topper Styling, Fitting, Customisation'), price: 300, min: 90 },
          { title: n('حناء / نقش لليدين والقدمين', 'Henna / Mehndi for Hands and Feet'), price: 200, min: 90 },
          { title: n('Facial كريستالات', 'Crystal Healing Facial'), price: 280, min: 60 },
          { title: n('استحمام في الغابة / علاج طبيعي', 'Forest Bathing / Guided Nature Therapy'), price: 250, min: 120 },
          { title: n('جلسة كاكاو + تأمل', 'Cacao Ceremony + Guided Reflection'), price: 200, min: 90 },
          { title: n('علاج بالفن / رسم تأملي', 'Art Therapy / Mindful Painting Session'), price: 180, min: 90 },
          { title: n('جلسة تصوير إلهة (شعر، مكياج، ستايلنج + صور)', 'Goddess Photo Shoot'), price: 800, min: 180 },
          { title: n('تنظيف لمفاوي بالفرشاة الجافة', 'Lymphatic Dry Body Brushing (standalone)'), price: 100, min: 30 },
          { title: n('تنظيف الأذن بالشمعة', 'Ear Candling'), price: 120, min: 45 },
          { title: n('تبخيرة نسائية مع استشارة أعشاب', 'Vaginal Steaming / Yoni Steam'), price: 220, min: 45 },
          { title: n('ربط البطن (تقليدي، ما بعد الولادة)', 'Belly Binding (postpartum, traditional)'), price: 150, min: 45 },
        ],
      },
    ],
  },
];

// =============================================================================
// SEED FUNCTION
// =============================================================================

async function seed() {
  console.log('🌌 Seeding Galaxy of Beauty catalog...\n');

  // Clear existing catalog data (order matters due to FK constraints)
  console.log('🧹 Clearing existing catalog data...');
  await prisma.zatcaInvoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.serviceAddon.deleteMany();
  await prisma.serviceTagAssignment.deleteMany();
  await prisma.serviceVariant.deleteMany();
  await prisma.technicianService.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  console.log('🧹 Cleared existing catalog data');

  let serviceCount = 0;
  let catCount = 0;

  for (const main of catalog) {
    // Create main category
    const mainCat = await prisma.category.create({
      data: {
        nameJson: main.cat,
        slug: main.slug,
        sortOrder: catCount,
      },
    });
    catCount++;
    console.log(`📁 ${main.cat.ar}`);

    for (const sub of main.subcategories) {
      // Create subcategory
      const subCat = await prisma.category.create({
        data: {
          nameJson: sub.cat,
          slug: sub.slug,
          parentId: mainCat.id,
          sortOrder: catCount,
        },
      });
      catCount++;

      for (const svc of sub.services) {
        await prisma.service.create({
          data: {
            categoryId: subCat.id,
            titleJson: svc.title,
            basePrice: svc.price,
            durationMin: svc.min,
            isActive: true,
            sortOrder: serviceCount,
          },
        });
        serviceCount++;
      }

      console.log(`  📋 ${sub.cat.ar} → ${sub.services.length} services`);
    }
  }

  console.log(`\n✅ Done! ${catCount} categories, ${serviceCount} services`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
