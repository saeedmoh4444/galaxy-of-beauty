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
    emoji: '⏰',
    title: 'كبسولة الزمن',
    subtitle: 'رسالة لنفسكِ المستقبلية',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '📅', text: 'تاريخ الحفظ: 6 أغسطس 2026' },
      { emoji: '🔮', text: 'تفتح في: 6 أغسطس 2027' },
      { emoji: '✍️', text: 'رسالة: أهداف جمالكِ للعام القادم' },
      { emoji: '📸', text: 'مرفق: صورة بشرتكِ الآن' },
    ],
  },
  {
    emoji: '🎨',
    title: 'لوحة الأحلام',
    subtitle: 'أحلامكِ على لوحة واحدة',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '💇', text: 'شعر طويل صحي — هدفي للعام القادم' },
      { emoji: '👰', text: 'إطلالة زفاف مثالية — حلم العمر' },
      { emoji: '💄', text: 'إتقان المكياج — دورة احترافية' },
      { emoji: '🧘', text: 'روتين عناية يومي — التزام' },
    ],
  },
  {
    emoji: '🎅',
    title: 'سكرت سانتا',
    subtitle: 'تبادل هدايا — عرايس الرياض',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '👥', text: 'المجموعة: عرايس الرياض — 12 مشتركة' },
      { emoji: '💰', text: 'الميزانية: 200 ر.س للهدية' },
      { emoji: '🎁', text: 'القرعة: 15 ديسمبر — تبادل الهدايا' },
      { emoji: '🎉', text: 'حفل التبادل: 25 ديسمبر' },
    ],
  },
  {
    emoji: '🤝',
    title: 'شريك المساءلة',
    subtitle: 'نورة — 12 يوم تواصل',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '👯', text: 'الشريك: نورة — روتين عناية يومي' },
      { emoji: '🔥', text: '12 يوم متواصل — الهدف 30 يوم' },
      { emoji: '📱', text: 'تذكير يومي — الساعة 9 مساءً' },
      { emoji: '🏆', text: 'المكافأة: خصم 10% عند 30 يوم' },
    ],
  },
  {
    emoji: '💝',
    title: 'دائرة الامتنان',
    subtitle: 'شكراً لكِ — كلمات طيبة',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '💌', text: 'نورة → مها: شكراً لنصيحة البشرة!' },
      { emoji: '💌', text: 'مها → ريم: أنتِ ملهمة دائماً' },
      { emoji: '💌', text: 'ريم → سارة: شكراً لدعمكِ المتواصل' },
      { emoji: '➕', text: 'أرسلي كلمة شكر — تضيء يوم أحد' },
    ],
  },
  {
    emoji: '💭',
    title: 'توكيدات إيجابية',
    subtitle: 'أنا جميلة — أنا قوية',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '✨', text: 'أنا أستحق العناية بنفسي كل يوم' },
      { emoji: '💪', text: 'جمالي ينبع من ثقتي بنفسي' },
      { emoji: '🌟', text: 'كل يوم أكون فيه أفضل من الأمس' },
      { emoji: '💖', text: 'أحب نفسي كما أنا — وهذه قوتي' },
    ],
  },
  {
    emoji: '🙏',
    title: 'يوميات الامتنان',
    subtitle: '15 تدوينة — استمري',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '📝', text: '15 تدوينة — 15 يوماً من الشكر' },
      { emoji: '🔥', text: '5 أيام متواصلة' },
      { emoji: '✨', text: 'آخر تدوينة: بشرة مشرقة اليوم' },
      { emoji: '🎯', text: 'الهدف: 30 يوم امتنان' },
    ],
  },
  {
    emoji: '📹',
    title: 'فلوق الجمال',
    subtitle: 'يوم في حياة نورة',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '💄', text: 'الفئة: مكياج — 8 دقائق' },
      { emoji: '👩', text: 'تقديم: نورة — خبيرة تجميل' },
      { emoji: '👁️', text: '1,234 مشاهدة' },
      { emoji: '🎬', text: 'شاهدي الفلوق — تعلمي روتين جديد' },
    ],
  },
];

export default function BeautyExtrasScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>🌟 إضافات الجمال</Text>
      <Text style={s.sub}>مجتمع، امتنان، وأحلام</Text>
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
