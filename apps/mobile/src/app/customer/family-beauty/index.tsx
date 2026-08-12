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
    emoji: '‍',
    title: 'أمي وأنا',
    subtitle: 'نورة وابنتها سارة (8 سنوات)',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'التجربة: ميني فيشل — 250 ر.س' },
      { emoji: '', text: 'الأم: نورة — عناية بالبشرة' },
      { emoji: '', text: 'الابنة: سارة — 8 سنوات' },
      { emoji: '', text: 'علاج لطيف — مناسب للأطفال' },
    ],
  },
  {
    emoji: '',
    title: 'ثلاثة أجيال',
    subtitle: 'الجدة، الأم، والحفيدة',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'الجدة: أم خالد — مساج واسترخاء' },
      { emoji: '', text: 'الأم: نورة — عناية كاملة' },
      { emoji: '', text: 'الحفيدة: سارة — ميني مانيكير' },
      { emoji: '', text: 'باقة عائلية — 3 خدمات بسعر مخفض' },
    ],
  },
  {
    emoji: '',
    title: 'جمال المراهقات',
    subtitle: 'أول درس مكياج (12-15 سنة)',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'الخدمة: أول درس مكياج — 150 ر.س' },
      { emoji: '', text: 'المحتوى: تنظيف، ترطيب، مكياج خفيف' },
      { emoji: '', text: 'بإشراف الأم — إلزامي' },
      { emoji: '', text: 'نصائح آمنة — مناسبة للعمر' },
    ],
  },
  {
    emoji: '',
    title: 'أول فيشل',
    subtitle: 'مناسب من 14 سنة',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'العمر: 14 سنة — بشرة مختلطة' },
      { emoji: '', text: 'الأم: نورة — مرافقة' },
      { emoji: '', text: 'منتجات لطيفة — خالية من العطور' },
      { emoji: '', text: 'استشارة قبل الجلسة — تحديد الاحتياج' },
    ],
  },
  {
    emoji: '',
    title: 'قبيلة العروس',
    subtitle: 'سارة — 15 مارس 2027',
    color: '#c026d3',
    bg: '#fdf4ff',
    tips: [
      { emoji: '', text: 'العروس: سارة — باقة عروس كاملة' },
      { emoji: '', text: 'الوصيفات: نورة، مها، ريم' },
      { emoji: '', text: '3 وصيفات — مكياج + شعر' },
      { emoji: '', text: 'يوم الزفاف — خدمة منزلية' },
    ],
  },
  {
    emoji: '',
    title: 'بيبي شاور',
    subtitle: '12 ضيفة — للأم المنتظرة',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '', text: 'للأم: نورة — عناية بالأم المنتظرة' },
      { emoji: '', text: '12 ضيفة — مناسبة خاصة' },
      { emoji: '', text: 'مساج استرخاء — آمن للحمل' },
      { emoji: '', text: 'هدية — باقة عناية للأم' },
    ],
  },
  {
    emoji: '',
    title: 'قالنتاين',
    subtitle: '13 فبراير — خصم 20%',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'الصديقات: نورة، مها — 450 ر.س' },
      { emoji: '', text: 'مانيكير + باديكير — للجميع' },
      { emoji: '', text: 'شاي وقهوة — ضيافة مميزة' },
      { emoji: '', text: 'هدية — لكل صديقة' },
    ],
  },
  {
    emoji: '',
    title: 'دعم الأم الجديدة',
    subtitle: 'نورة — طفلها شهرين',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'مساج استرخاء — بعد الولادة' },
      { emoji: '', text: 'عناية بالبشرة — للتغيرات الهرمونية' },
      { emoji: '', text: 'جلسة سريعة — ساعة واحدة' },
      { emoji: '', text: 'خدمة منزلية — راحة للأم' },
    ],
  },
  {
    emoji: '',
    title: 'بشرة العروس',
    subtitle: 'خطة 6 أشهر لبشرة الزفاف',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: '6 أشهر: بدء روتين + واقي شمس يومي' },
      { emoji: '', text: '3 أشهر: أول جلسة فيشل + تحديد المشاكل' },
      { emoji: '', text: 'شهر واحد: آخر تقشير — لا تجارب جديدة' },
      { emoji: '', text: 'أسبوع الزفاف: ترطيب مكثف' },
    ],
  },
  {
    emoji: '',
    title: 'جسم العروس',
    subtitle: 'عناية شاملة قبل الزفاف',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'تقشير الجسم — مرة أسبوعياً' },
      { emoji: '', text: 'مساج استرخاء — يخفف التوتر' },
      { emoji: '️', text: 'إزالة الشعر — قبل الزفاف بـ 3-5 أيام' },
      { emoji: '', text: 'تان لطيف — قبل الزفاف بيومين' },
    ],
  },
  {
    emoji: '🆘',
    title: 'طوارئ العروس',
    subtitle: 'طقم إنقاذ يوم الزفاف',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'حبة حساسية — لأي تحسس مفاجئ' },
      { emoji: '🩹', text: 'لصقات — للكعب من الحذاء' },
      { emoji: '', text: 'ورق نشاف — لإزالة اللمعان' },
      { emoji: '', text: 'أحمر شفاه — للمسات سريعة' },
    ],
  },
  {
    emoji: '',
    title: 'تجربة العروس',
    subtitle: 'بروفة المكياج والشعر',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '', text: 'قبل الزفاف بشهر — الوقت المثالي' },
      { emoji: '', text: 'صوري الإطلالة — لتقييمها لاحقاً' },
      { emoji: '', text: 'ارتدي أبيض — للتناسق مع الفستان' },
      { emoji: '', text: 'كوني صريحة — هذه تجربتكِ' },
    ],
  },
  {
    emoji: '',
    title: 'إشراقة العروس',
    subtitle: 'توهجي في يومكِ الكبير',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: '8 أكواب ماء — لمدة شهر قبل الزفاف' },
      { emoji: '', text: 'غذاء صحي — أفوكادو سلمون مكسرات' },
      { emoji: '', text: '8 ساعات نوم — أهم سر للبشرة' },
      { emoji: '', text: 'تأمل 10 دقائق — هدوء وثقة' },
    ],
  },
  {
    emoji: '',
    title: 'إشراقة الحامل',
    subtitle: 'بشرة متوهجة أثناء الحمل',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'الهرمونات تزيد تدفق الدم — بشرة وردية' },
      { emoji: '', text: 'زيت الورد أو اللوز — لترطيب البطن' },
      { emoji: '', text: 'نامي جيداً — الإرهاق يظهر على بشرتكِ' },
      { emoji: '', text: 'تغذية صحية — فيتامينات الحمل' },
    ],
  },
  {
    emoji: '',
    title: 'مساج الحامل',
    subtitle: 'آمن — بعد الشهر الثالث',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '️', text: 'الاستلقاء على الجانب — ليس على البطن' },
      { emoji: '', text: 'بعد الشهر الثالث — بأمان' },
      { emoji: '', text: 'تجنبي الزيوت القوية' },
      { emoji: '', text: 'يخفف آلام الظهر — ويحسن النوم' },
    ],
  },
  {
    emoji: '',
    title: 'جمال المرضعة',
    subtitle: 'عناية آمنة أثناء الرضاعة',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'اشربي ماء أكثر — الرضاعة تجفف الجسم' },
      { emoji: '', text: 'كريمات آمنة — بدون ريتينول' },
      { emoji: '', text: 'شعركِ قد يتساقط — فيتامينات' },
      { emoji: '️', text: 'روتين سريع — 5 دقائق تكفي' },
    ],
  },
  {
    emoji: '',
    title: 'عناية ما بعد الولادة',
    subtitle: 'نفسكِ مهمة — مثل طفلكِ',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '🪞', text: '5 دقائق لكِ — غسل وجه وتنفس عميق' },
      { emoji: '', text: 'لا تنعزلي — تحدثي مع صديقة' },
      { emoji: '🩺', text: 'اكتئاب ما بعد الولادة — ليس ضعفاً' },
      { emoji: '', text: 'أنتِ أم رائعة — لا تقسي على نفسكِ' },
    ],
  },
];

export default function FamilyBeautyScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>‍‍‍ جمال العائلة</Text>
      <Text style={s.sub}>لحظات جميلة تجمع الأحباب</Text>
      <View style={s.grid}>
        {CARDS.map((c, i) => (
          <View key={i} style={[s.card, { borderColor: c.color + '30' }]}>
            <View style={s.ch}>
              <Text style={s.ce}>{c.emoji}</Text>
              <View style={s.cw}>
                <Text style={[s.ct, { color: c.color }]}>{c.title}</Text>
                <Text style={s.cs}>{c.subtitle}</Text>
              </View>
            </View>
            <View style={s.tl}>
              {c.tips.map((t, j) => (
                <View key={j} style={[s.tr, { backgroundColor: c.bg }]}>
                  <Text style={s.te}>{t.emoji}</Text>
                  <Text style={[s.tt, { color: c.color }]}>{t.text}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  grid: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 4 },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  ce: { fontSize: 28 },
  cw: { flex: 1 },
  ct: { fontSize: 15, fontWeight: '700' },
  cs: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tl: { gap: 6 },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  te: { fontSize: 14, width: 20, textAlign: 'center' },
  tt: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});
