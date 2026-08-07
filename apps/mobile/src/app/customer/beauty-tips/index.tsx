import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }
interface TipsCard { emoji: string; title: string; subtitle: string; color: string; bg: string; tips: Tip[]; }

const CARDS: TipsCard[] = [
  {
    emoji: '💡', title: 'نصائح المكياج', subtitle: 'لإطلالة تدوم طويلاً',
    color: '#e11d48', bg: '#fff1f2',
    tips: [
      { emoji: '🧴', text: 'الترطيب أولاً — بشرة مرطبة = مكياج أجمل وأثبت' },
      { emoji: '🖌️', text: 'نظفي فرشك — أسبوعياً البكتيريا تتراكم' },
      { emoji: '📅', text: 'تاريخ الصلاحية — جددِي مكياجك كل 6-12 شهر' },
      { emoji: '🌙', text: 'أزيلي المكياج — لا تنامي أبداً بالمكياج' },
    ],
  },
  {
    emoji: '🌸', title: 'تذكير الربيع', subtitle: 'روتينكِ يتغير مع الفصول',
    color: '#db2777', bg: '#fdf2f8',
    tips: [
      { emoji: '🧹', text: 'جددي روتين التقشير — بشرة أنعم' },
      { emoji: '🧴', text: 'انتقلي لمرطب أخف — مع ارتفاع الحرارة' },
      { emoji: '☀️', text: 'اهتمي بالحماية من الشمس مبكراً' },
      { emoji: '🎨', text: 'جربي ألوان باستيل — منعشة وناعمة' },
    ],
  },
  {
    emoji: '☀️', title: 'تذكير الصيف', subtitle: 'حماية وانتعاش',
    color: '#ea580c', bg: '#fff7ed',
    tips: [
      { emoji: '☀️', text: 'SPF 50+ يومياً — حتى في الظل' },
      { emoji: '💧', text: 'مرطب جل خفيف — بدل الكريم الثقيل' },
      { emoji: '🚰', text: 'اشربي ماء كثيراً — 8 أكواب يومياً' },
      { emoji: '🌿', text: 'تجنبي المكياج الثقيل — خففي الطبقات' },
    ],
  },
  {
    emoji: '❄️', title: 'تذكير الشتاء', subtitle: 'ترطيب وحماية',
    color: '#0284c7', bg: '#f0f9ff',
    tips: [
      { emoji: '🧴', text: 'مرطب غني — يحمي من الهواء الجاف' },
      { emoji: '💋', text: 'بلسم شفاه — ضروري في الشتاء' },
      { emoji: '🧖', text: 'قناع ترطيب أسبوعي — بشرة نضرة' },
      { emoji: '🧣', text: 'احمي بشرتكِ من الهواء البارد' },
    ],
  },
  {
    emoji: '📈', title: 'رائج الآن', subtitle: 'أحدث صيحات الجمال',
    color: '#e11d48', bg: '#fff1f2',
    tips: [
      { emoji: '✨', text: 'البشرة الزجاجية — الترطيب قبل المكياج 🔥🔥🔥' },
      { emoji: '🎨', text: 'ألوان الباستيل — ناعمة وأنثوية 🔥🔥' },
      { emoji: '💋', text: 'العناية بالشفاه — تينت طبيعي 🔥' },
      { emoji: '🌿', text: 'المكياج الطبيعي — بشرة أولى 🔥🔥' },
    ],
  },
  {
    emoji: '🧪', title: 'حمض الهيالورونيك', subtitle: 'مرطب A+ يحمل 1000 ضعف وزنه ماء',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '💧', text: 'يوجد طبيعياً في البشرة — آمن تماماً' },
      { emoji: '✨', text: 'مناسب لجميع أنواع البشرة' },
      { emoji: '🤝', text: 'يدمج مع جميع المكونات — ثنائي رائع' },
      { emoji: '🧴', text: 'يطبق على بشرة رطبة — وليس جافة' },
    ],
  },
  {
    emoji: '🎯', title: 'تحليل الأسلوب', subtitle: 'اكتشفي أسلوبكِ المثالي',
    color: '#c026d3', bg: '#fdf4ff',
    tips: [
      { emoji: '👗', text: 'كلاسيكي — أنيق وخالد 92%' },
      { emoji: '✨', text: 'عصري — متجدد وجريء 78%' },
      { emoji: '🌿', text: 'بوهيمي — ناعم وطبيعي 65%' },
      { emoji: '💎', text: 'فاخر — فخم ومتكامل 55%' },
    ],
  },
  {
    emoji: '💧', title: 'تحدي الترطيب', subtitle: 'تحدي 5 دقائق يومياً',
    color: '#0d9488', bg: '#f0fdfa',
    tips: [
      { emoji: '☀️', text: 'الصباح — مرطب + واقي شمس' },
      { emoji: '💧', text: 'طوال اليوم — 8 أكواب ماء' },
      { emoji: '🌙', text: 'المساء — سيروم + مرطب ليلي' },
      { emoji: '📅', text: 'أسبوعياً — قناع ترطيب' },
    ],
  },
];

export default function BeautyTipsScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>💡 نصائح وإرشادات</Text>
      <Text style={styles.subtitle}>كل ما تحتاجينه للعناية بجمالك</Text>
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
  header: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  grid: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardEmoji: { fontSize: 28 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSubtitle: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tipsList: { gap: 6 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  tipEmoji: { fontSize: 14, width: 20, textAlign: 'center' },
  tipText: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});
