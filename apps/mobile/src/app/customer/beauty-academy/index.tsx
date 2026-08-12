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
    title: 'موسوعة الجمال',
    subtitle: 'فيتامين سي — دليلك الشامل',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'مضاد أكسدة قوي — يفتح البشرة ويوحد لونها' },
      { emoji: '️', text: 'صباحاً قبل واقي الشمس — نتائج أفضل' },
      { emoji: '️', text: 'وقت القراءة: 5 دقائق — معلومات موثقة' },
      { emoji: '', text: 'معلومة موثقة — مراجعة من خبراء' },
    ],
  },
  {
    emoji: '',
    title: 'اختبار البشرة',
    subtitle: 'اكتشفي نوع بشرتكِ',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'كيف تبدو بشرتكِ بعد غسلها؟' },
      { emoji: '️', text: 'كيف تتصرف في الطقس الحار؟' },
      { emoji: '', text: 'هل بشرتكِ حساسة للمنتجات الجديدة؟' },
      { emoji: '', text: '3 أسئلة — نتيجة فورية لنوع بشرتك' },
    ],
  },
  {
    emoji: '',
    title: 'أسئلة trivia',
    subtitle: 'هل تعرفين إجابات الجمال؟',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'أي فيتامين يسمى فيتامين الجمال؟' },
      { emoji: '', text: 'ما هو أقوى مضاد أكسدة في العناية؟' },
      { emoji: '', text: 'كم وزن ماء يستطيع حمض الهيالورونيك حمله؟' },
      { emoji: '', text: 'أسئلة ممتعة — تعلمي أثناء اللعب' },
    ],
  },
  {
    emoji: '',
    title: 'خرافات الجمال',
    subtitle: 'الحقيقة العلمية وراء الأساطير',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: '"معجون الأسنان يعالج الحبوب" — خرافة!' },
      { emoji: '', text: '"الشعر يطول أسرع بالقص المتكرر" — غير صحيح' },
      { emoji: '', text: 'كل خرافة مع تفسير علمي مبسط' },
      { emoji: '', text: 'مصادر موثقة — من أطباء جلدية' },
    ],
  },
  {
    emoji: '',
    title: 'المسار الوظيفي',
    subtitle: 'فنانة مكياج',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'المستوى: مبتدئ — 3 دورات أساسية' },
      { emoji: '', text: 'شهادة معتمدة — بعد إكمال 8 وحدات' },
      { emoji: '', text: 'المدة التقريبية: 6 أشهر' },
      { emoji: '‍', text: 'مشروع تخرج — جلسة تصوير كاملة' },
    ],
  },
  {
    emoji: '',
    title: 'وصفات طبيعية',
    subtitle: 'قناع الأفوكادو والعسل',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'المكونات: نصف أفوكادو + ملعقة عسل' },
      { emoji: '️', text: 'المدة: 15 دقيقة على البشرة' },
      { emoji: '', text: 'النتيجة: ترطيب عميق وإشراقة' },
      { emoji: '', text: 'مرة أسبوعياً — مناسب للبشرة الجافة' },
    ],
  },
  {
    emoji: '',
    title: 'إنفوجرافيك',
    subtitle: 'الحماية من الشمس',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '️', text: 'أشعة UVA — 95% تخترق الغيوم والزجاج' },
      { emoji: '️', text: 'SPF 30 — 97% نسبة الحماية' },
      { emoji: '', text: 'المصدر: منظمة الصحة العالمية' },
      { emoji: '', text: 'طبقي واقي الشمس يومياً حتى في البيت' },
    ],
  },
  {
    emoji: '',
    title: 'نصيحة سريعة',
    subtitle: 'طبقي المرطب على بشرة رطبة',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'التصنيف: ترطيب — الفئة: عناية يومية' },
      { emoji: '', text: 'بعد الغسول مباشرة — قبل أن تجف البشرة' },
      { emoji: '', text: 'المرطب يحبس الرطوبة — بشرة أنعم' },
      { emoji: '', text: 'صباح ومساء — للحصول على أفضل نتيجة' },
    ],
  },
  {
    emoji: '',
    title: 'التراث السعودي',
    subtitle: 'الحناء — فن وجمال',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'نبات طبيعي — يبرد البشرة ويزينها' },
      { emoji: '', text: 'نقوش سعودية تقليدية — فن عمره قرون' },
      { emoji: '', text: 'مناسبة: الأعراس والأعياد' },
      { emoji: '', text: 'فوائد: تقوية الشعر وتبريد الجسم' },
    ],
  },
  {
    emoji: '',
    title: 'شهادة العناية',
    subtitle: 'مسار العناية بالبشرة',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: '8 وحدات دراسية — من أساسيات إلى متقدم' },
      { emoji: '', text: 'مكتمل: 3 من 8 — تقدم 38%' },
      { emoji: '', text: 'الوحدة القادمة: التقشير الكيميائي' },
      { emoji: '', text: 'شهادة معتمدة عند إكمال المسار' },
    ],
  },
];

export default function BeautyAcademyScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}> أكاديمية الجمال</Text>
      <Text style={s.sub}>تعلمي كل شيء عن عالم التجميل والعناية</Text>
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
  c: { flex: 1, backgroundColor: '#fffbeb' },
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
