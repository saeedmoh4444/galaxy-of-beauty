import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip {
  emoji: string;
  text: string;
}
interface Card {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  tips: Tip[];
}

const CARDS: Card[] = [
  {
    emoji: '',
    title: 'أساس المكياج',
    subtitle: 'primer + foundation',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'برايمر — يملأ المسام ويثبت المكياج' },
      { emoji: '', text: 'بشرة رطبة — المرطب قبل البرايمر' },
      { emoji: '', text: 'فاونديشن — طبقة رقيقة' },
      { emoji: '️', text: 'ادمجي بالإسفنجة — وليس الأصابع' },
    ],
  },
  {
    emoji: '️',
    title: 'فرش المكياج',
    subtitle: 'دليل التنظيف والاستخدام',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'نظفي الفرش أسبوعياً — بشامبو أطفال' },
      { emoji: '️', text: 'جففيها أفقياً — لا عمودياً' },
      { emoji: '', text: 'استبدلي الفرش كل 6-12 شهر' },
      { emoji: '', text: 'لا تشاركي فرشك مع أحد' },
    ],
  },
  {
    emoji: '️',
    title: 'مكياج العيون',
    subtitle: 'تقنيات أساسية',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'اللون الفاتح — على كامل الجفن' },
      { emoji: '', text: 'اللون المتوسط — على الثنية' },
      { emoji: '', text: 'اللون اللامع — في الزاوية الداخلية' },
      { emoji: '️', text: 'ادمجي جيداً — لا خطوط قاسية' },
    ],
  },
  {
    emoji: '',
    title: 'مكياج الشفاه',
    subtitle: 'لون يدوم طويلاً',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'قشري الشفاه — سكر + عسل' },
      { emoji: '', text: 'رطبي قبل 10 دقائق من اللون' },
      { emoji: '️', text: 'حددي الشفاه — يمنع التطاير' },
      { emoji: '️', text: 'طبقتان — وامسحي الزائد بمنديل' },
    ],
  },
  {
    emoji: '',
    title: 'الكونتور',
    subtitle: 'نحت الوجه',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'داكن — تحت عظمة الخد' },
      { emoji: '', text: 'فاتح — فوق عظمة الخد' },
      { emoji: '️', text: 'امزجي جيداً — لا خطوط ظاهرة' },
      { emoji: '', text: 'الكريمي أسهل من البودرة للمبتدئات' },
    ],
  },
  {
    emoji: '',
    title: 'أحمر الخدود',
    subtitle: 'لمسة حيوية',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'ضعيه على تفاحة الخد' },
      { emoji: '↗️', text: 'امزجي للأعلى نحو الصدغ' },
      { emoji: '', text: 'الكريمي — للبشرة الجافة' },
      { emoji: '', text: 'البودرة — للبشرة الدهنية' },
    ],
  },
  {
    emoji: '',
    title: 'مكياج العروس',
    subtitle: 'إطلالة الزفاف',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'جلسة تجريبية قبل الزفاف بشهر' },
      { emoji: '', text: 'رطبي بشرتك جيداً أسبوع الزفاف' },
      { emoji: '', text: 'ابدئي المكياج 3 ساعات قبل الحفل' },
      { emoji: '', text: 'مكياج دائم — للصور والفيديو' },
    ],
  },
  {
    emoji: '',
    title: 'مكياج طبيعي',
    subtitle: 'إطلالة يومية خفيفة',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '️', text: 'BB كريم — بدل الفاونديشن الثقيل' },
      { emoji: '', text: 'هايلايتر — على عظمة الخد فقط' },
      { emoji: '️', text: 'ماسكارا بنية — طبيعية أكثر' },
      { emoji: '', text: 'تينت شفاه — لون طبيعي خفيف' },
    ],
  },
  {
    emoji: '',
    title: 'مكياج لامع',
    subtitle: 'للمناسبات والسهرات',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'جليتر — على الجفن فقط' },
      { emoji: '', text: 'برايمر جليتر — يثبت اللمعان' },
      { emoji: '', text: 'هايلايتر على عظمة الترقوة' },
      { emoji: '', text: 'منطقة واحدة لامعة — ليس الوجه كله' },
    ],
  },
  {
    emoji: '',
    title: 'إزالة المكياج',
    subtitle: 'خطوة لا تهمليها',
    color: '#0891b2',
    bg: '#ecfeff',
    tips: [
      { emoji: '', text: 'ماء ميسيلار — للوجه والعيون' },
      { emoji: '🫒', text: 'زيت تنظيف — يذيب المكياج المقاوم' },
      { emoji: '', text: 'اغسلي بعد المزيل — خطوتين دائماً' },
      { emoji: '', text: 'لا تنامي أبداً بالمكياج' },
    ],
  },
  {
    emoji: '',
    title: 'أشكال الوجه',
    subtitle: 'حددي شكل وجهكِ',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'بيضاوي — متناسق يناسبه كل شيء' },
      { emoji: '️', text: 'قلب — جبهة عريضة ذقن مدبب' },
      { emoji: '', text: 'دائري — خدود ممتلئة متساوي' },
      { emoji: '⬜', text: 'مربع — فك عريض زوايا واضحة' },
    ],
  },
  {
    emoji: '',
    title: 'دليل الكونتور',
    subtitle: 'نحت الوجه حسب الشكل',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'بيضاوي: خفيف تحت عظمة الخد' },
      { emoji: '', text: 'دائري: تحت الخد بكثافة' },
      { emoji: '⬜', text: 'مربع: زوايا الفك — لتحديد وتنعيم' },
      { emoji: '️', text: 'قلب: الذقن — لتقليصه بصرياً' },
    ],
  },
  {
    emoji: '',
    title: 'موضع البلاشر',
    subtitle: 'ارفعي — لا تنزلي',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'بيضاوي: على تفاحة الخد للأعلى' },
      { emoji: '', text: 'دائري: أعلى الخد بزاوية حادة' },
      { emoji: '⬜', text: 'مربع: مركز الخد دائري لتليين' },
      { emoji: '️', text: 'قلب: منخفض تحت تفاحة الخد' },
    ],
  },
  {
    emoji: '',
    title: 'شكل الحواجب',
    subtitle: 'الحاجب المناسب لوجهكِ',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'بيضاوي: طبيعية — قوس ناعم' },
      { emoji: '', text: 'دائري: قوس مرتفع — يطيل الوجه' },
      { emoji: '⬜', text: 'مربع: زوايا حادة — توازن الفك' },
      { emoji: '️', text: 'قلب: مقوسة — تلطف الجبهة' },
    ],
  },
  {
    emoji: '',
    title: 'تحديد الشفاه',
    subtitle: 'تقنيات لشفاه أجمل',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '️', text: 'تحديد فوق الخط الطبيعي بقليل' },
      { emoji: '', text: 'هايلايتر فوق قوس كيوبيد' },
      { emoji: '', text: 'لونين — فاتح بالوسط داكن بالأطراف' },
      { emoji: '', text: 'غلوس على المركز — عمق بصري' },
    ],
  },
  {
    emoji: '',
    title: 'تحضير الحفلة',
    subtitle: 'خطة جمالية قبل المناسبة',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'قبل بأسبوع: فيشل + حواجب + إزالة شعر' },
      { emoji: '', text: 'قبل بيوم: عناية — نامي 8 ساعات' },
      { emoji: '', text: 'يوم الحفلة: مكياج قبلها بـ 3 ساعات' },
      { emoji: '', text: 'حقيبة طوارئ: روج + ورق نشاف' },
    ],
  },
  {
    emoji: '',
    title: 'إطلالة المقابلة',
    subtitle: 'ثقة — واحترافية',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '', text: 'مكياج طبيعي — BB كريم + ماسكارا' },
      { emoji: '', text: 'أظافر محايدة — Nude أو فرنسي' },
      { emoji: '', text: 'تسريحة مرتبة — كعكة منخفضة' },
      { emoji: '', text: 'عطر خفيف — منعش وغير قوي' },
    ],
  },
  {
    emoji: '',
    title: 'إطلالة التخرج',
    subtitle: 'صور تدوم — إطلالة تبقى',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'مكياج ثابت — الصور تبقى للأبد' },
      { emoji: '', text: 'أحمر شفاه مات — لا ينتقل للشهادة' },
      { emoji: '', text: 'تسريحة تتحمل القبعة' },
      { emoji: '️', text: 'واقي شمس — الحفل في النهار' },
    ],
  },
  {
    emoji: '',
    title: 'إطلالة الموعد',
    subtitle: 'جاذبية — بدون مبالغة',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'بشرة متوهجة — هايلايتر على الخد' },
      { emoji: '️', text: 'عيون سموكي ناعمة — ألوان دافئة' },
      { emoji: '', text: 'شفاه طبيعية — تينت شفاف' },
      { emoji: '', text: 'عطر على نقاط النبض' },
    ],
  },
  {
    emoji: '',
    title: 'جاهزة للصور',
    subtitle: 'مكياج جميل في الكاميرا',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '', text: 'تجنبي SPF العالي — وميض في الفلاش' },
      { emoji: '', text: 'هايلايتر بودرة — وليس كريمي' },
      { emoji: '', text: 'ألوان معتدلة — الفلاش يفتح الألوان' },
      { emoji: '', text: 'بخاخ تثبيت — آخر خطوة قبل الصور' },
    ],
  },
  {
    emoji: '',
    title: 'البشرة الفاتحة',
    subtitle: 'عناية خاصة بالبشرة الفاتحة',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '️', text: 'SPF 50+ — البشرة الفاتحة تحترق بسرعة' },
      { emoji: '', text: 'ميل للاحمرار — منتجات مهدئة' },
      { emoji: '', text: 'ألوان: وردي خوخي بيج فاتح' },
      { emoji: '', text: 'هايلايتر شمباني — وليس ذهبي' },
    ],
  },
  {
    emoji: '',
    title: 'البشرة المتوسطة',
    subtitle: 'البشرة الزيتونية والقمحية',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '️', text: 'SPF 30-50 — الميلانين يحمي جزئياً' },
      { emoji: '', text: 'ميل للتصبغات — فيتامين C أساسي' },
      { emoji: '', text: 'ألوان: برونزي خوخي تيراكوتا' },
      { emoji: '', text: 'هايلايتر ذهبي — للأندرتون الدافئ' },
    ],
  },
  {
    emoji: '',
    title: 'البشرة الداكنة',
    subtitle: 'غنية بالميلانين',
    color: '#92400e',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'ميل للجفاف — ترطيب بزبدة الشيا' },
      { emoji: '', text: 'تصبغات — فيتامين C وهيالورونيك' },
      { emoji: '', text: 'ألوان: برقوقي عنابي ذهبي' },
      { emoji: '️', text: 'SPF 30+ — حماية ضرورية' },
    ],
  },
  {
    emoji: '',
    title: 'الأندرتون',
    subtitle: 'اعرفي أندرتونكِ — تناسق',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'دافئ: عروق خضراء — الذهب يناسبك' },
      { emoji: '🩷', text: 'بارد: عروق زرقاء — الفضة تناسبك' },
      { emoji: '', text: 'محايد: مزيج — الذهب والفضة' },
      { emoji: '🩶', text: 'اختبار: ورقة بيضاء — قارني' },
    ],
  },
  {
    emoji: '',
    title: 'مطابقة الألوان',
    subtitle: 'اختاري الدرجة المثالية',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🪞', text: 'جربي على خط الفك — ليس اليد' },
      { emoji: '️', text: 'ضوء طبيعي — الإضاءة تخدع' },
      { emoji: '️', text: 'انتظري 5 دقائق — اللون يتغير' },
      { emoji: '', text: 'درجتين: صيف أغمق — شتاء أفتح' },
    ],
  },
  {
    emoji: '',
    title: 'مكياج النظارات',
    subtitle: 'إطلالة جميلة مع النظارة',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '️', text: 'رموش مرفوعة — لا تلمس العدسات' },
      { emoji: '', text: 'هايلايتر تحت الحاجب — يبرز العين' },
      { emoji: '', text: 'ظلال مات — ليس لامعاً' },
      { emoji: '️', text: 'حاجبين مرتبين — الإطار يبرزهما' },
    ],
  },
  {
    emoji: '️',
    title: 'العدسات والمكياج',
    subtitle: 'عناية آمنة لعيون جميلة',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'العدسات أولاً — ثم المكياج' },
      { emoji: '', text: 'قطرات مرطبة — قبل وبعد المكياج' },
      { emoji: '', text: 'تجنبي الجليتر — يسقط في العين' },
      { emoji: '', text: 'جديدي الماسكارا — كل 3 أشهر' },
    ],
  },
];

export default function MakeupGuideScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}> دليل المكياج</Text>
      <Text style={styles.subtitle}>كل ما تحتاجينه لإطلالة مثالية</Text>
      <View style={styles.grid}>
        {CARDS.map((card, i) => (
          <View key={i} style={[styles.card, { borderColor: card.color + '30' }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: card.color }]}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
            </View>
            <View style={styles.tipsList}>
              {card.tips.map((tip, j) => (
                <View key={j} style={[styles.tipRow, { backgroundColor: card.bg }]}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={[styles.tipText, { color: card.color }]}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' },
  content: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardEmoji: { fontSize: 28 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSubtitle: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tipsList: { gap: 6 },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipEmoji: { fontSize: 14, width: 20, textAlign: 'center' },
  tipText: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});
