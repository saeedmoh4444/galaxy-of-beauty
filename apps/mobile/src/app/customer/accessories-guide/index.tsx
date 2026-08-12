import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip {
  emoji: string;
  text: string;
}
interface AccCard {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  tips: Tip[];
}

const CARDS: AccCard[] = [
  {
    emoji: '',
    title: 'تنسيق الإكسسوارات',
    subtitle: 'اللمسة الأخيرة لإطلالتك',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'أقراط — طويلة = وجه أنحف' },
      { emoji: '', text: 'عقد — يناسب فتحة الرقبة' },
      { emoji: '', text: 'ساعة — كلاسيك لكل مناسبة' },
      { emoji: '', text: 'خواتم — 2-3 كحد أقصى' },
    ],
  },
  {
    emoji: '',
    title: 'حقيبة الجمال',
    subtitle: 'أساسيات لا تستغني عنها',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '', text: 'أحمر شفاه — لون ناعم للإطلالة اليومية' },
      { emoji: '🪞', text: 'مرآة صغيرة — للمسات السريعة' },
      { emoji: '', text: 'مرطب سفر — حجم صغير للطوارئ' },
      { emoji: '️', text: 'واقي شمس — Mini size للشنطة' },
    ],
  },
  {
    emoji: '',
    title: 'أناقة الحجاب',
    subtitle: 'أفكار لتنسيق حجابك',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'ألوان متناسقة — الحجاب مع لون الفستان' },
      { emoji: '', text: 'تثبيت محكم — دبابيس غير ظاهرة' },
      { emoji: '', text: 'بطانة حرير — تحمي الشعر من التكسر' },
      { emoji: '', text: 'تغيير الأسلوب — جربي لفات جديدة' },
    ],
  },
];

export default function AccessoriesGuideScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}> دليل الإكسسوارات</Text>
      <Text style={styles.subtitle}>اللمسة الأخيرة لإطلالة متكاملة</Text>
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
  container: { flex: 1, backgroundColor: '#fdf4ff' },
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
