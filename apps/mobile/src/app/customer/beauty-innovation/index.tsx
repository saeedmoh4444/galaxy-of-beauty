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
    emoji: '️',
    title: 'مساعد صوتي',
    subtitle: 'اسألي ليلى — مستشارة جمالك',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '️', text: 'قوائم: اسألي عن روتين، منتج، أو نصيحة' },
      { emoji: '', text: 'تشغيل صوتي — بدون لمس الشاشة' },
      { emoji: '', text: 'بالعربية — تفهم لهجتكِ' },
      { emoji: '', text: 'خصوصية تامة — محادثاتكِ آمنة' },
    ],
  },
  {
    emoji: '',
    title: 'فلوق الجمال',
    subtitle: 'يوم في حياة نورة',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'الفئة: مكياج — 8 دقائق' },
      { emoji: '', text: 'تقديم: نورة — خبيرة تجميل' },
      { emoji: '️', text: '1,234 مشاهدة' },
      { emoji: '', text: 'شاهدي الفلوق — تعلمي روتين جديد' },
    ],
  },
  {
    emoji: '',
    title: 'قائمة تشغيل',
    subtitle: 'موسيقى لجلسة عنايتك',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'موسيقى هادئة — لجلسة المساج' },
      { emoji: '', text: 'أصوات طبيعة — للاسترخاء' },
      { emoji: '', text: 'قوائم جاهزة — حسب المزاج' },
      { emoji: '', text: 'تحديث أسبوعي — قوائم جديدة' },
    ],
  },
  {
    emoji: '️',
    title: 'طقس الجمال',
    subtitle: 'حار — 42 درجة مئوية',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '️', text: 'نصيحة: واقي شمس SPF 50+ اليوم' },
      { emoji: '', text: 'مرطب جل خفيف — مناسب للحر' },
      { emoji: '', text: 'مكياج مقاوم للماء — ضروري' },
      { emoji: '', text: 'سبراي مرطب — للانتعاش' },
    ],
  },
  {
    emoji: '',
    title: 'ليلة في الخارج',
    subtitle: 'متاح — احجزي الآن',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'باقة ليلية — مكياج + شعر' },
      { emoji: '', text: 'متاح اليوم — قبل 8 مساءً' },
      { emoji: '', text: 'أظافر سريعة — 30 دقيقة' },
      { emoji: '', text: 'مناسبة خاصة — خدمة VIP' },
    ],
  },
  {
    emoji: '',
    title: 'خدمة الكونسيرج',
    subtitle: 'مساعدكِ الشخصي للجمال',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'حجز مواعيد — أي صالون' },
      { emoji: '', text: 'شراء هدايا — توصيل للمنزل' },
      { emoji: '', text: 'استشارة — توصيات مخصصة' },
      { emoji: '', text: 'خدمة 24/7 — دائماً متاحة' },
    ],
  },
  {
    emoji: '',
    title: 'عمل طيب عشوائي',
    subtitle: 'فاجئي شخصاً تحبينه',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'أرسلي باقة ورود — بدون مناسبة' },
      { emoji: '', text: 'بطاقة شكر — بخط اليد' },
      { emoji: '', text: 'هدية صغيرة — لمن تحبين' },
      { emoji: '', text: 'أفعلي خيراً — الجمال في العطاء' },
    ],
  },
];

export default function BeautyInnovationScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}> الابتكار</Text>
      <Text style={s.sub}>تقنيات وأدوات ذكية لجمالكِ</Text>
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
  c: { flex: 1, backgroundColor: '#f5f3ff' },
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
