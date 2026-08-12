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
    title: 'فرقة الرياض',
    subtitle: '4 عضوات — اللقاء القادم 15 أغسطس',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'مانيكير جماعي — 15 أغسطس' },
      { emoji: '', text: '4 عضوات — نورة، مها، ريم، سارة' },
      { emoji: '', text: 'خصم المجموعة — 15%' },
      { emoji: '', text: 'الهدف: لقاء شهري' },
    ],
  },
  {
    emoji: '‍',
    title: 'خريجة متميزة',
    subtitle: 'نورة — دفعة 2025',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'التخصص: مكياج احترافي — 2025' },
      { emoji: '', text: 'المنصب: مديرة صالون' },
      { emoji: '', text: 'قصتها: من خبيرة لمالكة في سنة' },
      { emoji: '', text: 'نصيحتها: ثقي بنفسكِ وابدئي صغيراً' },
    ],
  },
  {
    emoji: '',
    title: 'منحة دراسية',
    subtitle: 'دورة مكياج احترافي — 3000 ر.س',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'قيمة المنحة: 3000 ر.س' },
      { emoji: '', text: 'المقاعد: 50 — آخر موعد 30 سبتمبر' },
      { emoji: '', text: 'الشروط: شغف بالتجميل + احتياج مالي' },
      { emoji: '', text: 'قدمي الآن — الفرصة محدودة' },
    ],
  },
  {
    emoji: '',
    title: 'قسيمة خصم',
    subtitle: 'BEAUTY20 — خصم 20%',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '️', text: 'الكود: BEAUTY20 — خصم 20%' },
      { emoji: '', text: 'الحد الأدنى: 150 ر.س' },
      { emoji: '', text: 'صالح حتى: 31 ديسمبر 2026' },
      { emoji: '', text: 'مرة واحدة لكل عميلة' },
    ],
  },
  {
    emoji: '',
    title: 'تحدي الادخار',
    subtitle: '3200/5000 ر.س — 28 مشتركة',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'الهدف: 5000 ر.س — وفرّي 3200 ' },
      { emoji: '', text: '28 مشتركة — شجعي غيركِ' },
      { emoji: '', text: '64% مكتمل — باقي 1800 ر.س' },
      { emoji: '', text: 'الجائزة: قسيمة 500 ر.س للفائزة' },
    ],
  },
  {
    emoji: '‍',
    title: 'اطلبي مرشداً',
    subtitle: 'تعلمي من الخبيرات',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'اهتماماتكِ: مكياج — إدارة الصالونات' },
      { emoji: '', text: 'مرشدة محتملة: م. سارة' },
      { emoji: '', text: 'جلسة أسبوعية — ساعة واحدة' },
      { emoji: '', text: 'المدة: 3 أشهر — خطة تطوير شخصية' },
    ],
  },
  {
    emoji: '',
    title: 'قاموس الجمال',
    subtitle: 'تعلمي مصطلحات التجميل',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'عربي → English — مصطلحات التجميل' },
      { emoji: '', text: 'كونتور — Contour' },
      { emoji: '', text: 'هايلايتر — Highlighter' },
      { emoji: '', text: 'كلمة جديدة كل يوم' },
    ],
  },
  {
    emoji: '',
    title: 'صور التقدم',
    subtitle: '3 صور — منذ 1 يونيو 2026',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: '3 صور — وثقي رحلتكِ' },
      { emoji: '', text: 'بداية التوثيق: 1 يونيو 2026' },
      { emoji: '', text: 'لاحظي الفرق — بشرة أكثر إشراقاً' },
      { emoji: '', text: 'خاص — لكِ فقط' },
    ],
  },
  {
    emoji: '',
    title: 'درع الخصوصية',
    subtitle: 'تحكمي في معلوماتكِ',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '️', text: 'اختاري من يرى صورتكِ' },
      { emoji: '', text: 'تاريخكِ — لكِ وحدكِ' },
      { emoji: '️', text: 'مشفرة — أعلى معايير الأمان' },
      { emoji: '', text: 'موافقة — قبل أي مشاركة' },
    ],
  },
];

export default function BeautyCommunityScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>‍️ مجتمع الجمال</Text>
      <Text style={s.sub}>تواصلي، تعلمي، وشاركي رحلتكِ</Text>
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

const sc = StyleSheet.create({
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
const s = sc;
