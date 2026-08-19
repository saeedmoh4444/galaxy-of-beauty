import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';

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
    title: 'فن الأظافر',
    subtitle: 'أفكار وأساليب',
    color: '#c026d3',
    bg: '#fdf4ff',
    tips: [
      { emoji: '', text: 'فرنسي — كلاسيك طرف أبيض' },
      { emoji: '', text: 'جليتر — لامع للمناسبات' },
      { emoji: '', text: 'Ombre — تدرج لونين' },
      { emoji: '', text: 'طبيعي Nude — لكل يوم' },
    ],
  },
  {
    emoji: '',
    title: 'أشكال الأظافر',
    subtitle: 'أي شكل يناسب يدك؟',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'دائري — لأصابع قصيرة' },
      { emoji: '⬜', text: 'مربع — لأصابع طويلة' },
      { emoji: '', text: 'بيضاوي — يناسب الجميع' },
      { emoji: '', text: 'لوزي — يطول الأصابع' },
    ],
  },
  {
    emoji: '🩺',
    title: 'صحة الأظافر',
    subtitle: 'علامات تحذيرية',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'بقع بيضاء — نقص زنك أو إصابة' },
      { emoji: '', text: 'اصفرار — فطريات أو طلاء بدون base coat' },
      { emoji: '〰️', text: 'خطوط أفقية — إجهاد أو مرض' },
      { emoji: '🩺', text: 'تغيرات مستمرة — راجعي الطبيب' },
    ],
  },
  {
    emoji: '️',
    title: 'طلاء الأظافر',
    subtitle: 'لتطبيق مثالي',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '️', text: 'Base coat — يحمي الظفر من التصبغ' },
      { emoji: '', text: 'طبقتان رقيقتان' },
      { emoji: '', text: 'Top coat — لمعان وحماية' },
      { emoji: '', text: 'انتظري 2-3 دقائق بين الطبقات' },
    ],
  },
  {
    emoji: '',
    title: 'جل الأظافر',
    subtitle: 'عناية خاصة للجل',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '️', text: 'لا تعرضي الجل للشمس — يبهت' },
      { emoji: '', text: 'قفازات للتنظيف — تحمي الجل' },
      { emoji: '', text: 'زيّتي البشرة حول الظفر يومياً' },
      { emoji: '', text: 'لا تقشري الجل — يضعف الظفر' },
    ],
  },
  {
    emoji: '️',
    title: 'حمام البارافين',
    subtitle: 'شمع دافئ — أيدي ناعمة',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'شمع دافئ — يفتح المسام ويرطب بعمق' },
      { emoji: '', text: 'يعالج الجفاف — ممتاز للشتاء' },
      { emoji: '️', text: '15-20 دقيقة — تغمس الأيدي 3-5 مرات' },
      { emoji: '', text: 'بعد الجلسة — كريم مرطب لليدين' },
    ],
  },
  {
    emoji: '',
    title: 'قناع اليدين',
    subtitle: 'سبا منزلي ليديكِ',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'كريم كثيف — طبقة سميكة على اليدين' },
      { emoji: '', text: 'قفازات قطنية — للنوم طوال الليل' },
      { emoji: '', text: 'صباحاً — أيدي ناعمة كالحرير' },
      { emoji: '', text: 'مرة أسبوعياً — أو قبل المناسبات' },
    ],
  },
  {
    emoji: '',
    title: 'نقع القدمين',
    subtitle: 'طقس استرخاء للقدمين',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'ملح إبسوم — يخفف الآلام' },
      { emoji: '', text: 'لافندر — للاسترخاء قبل النوم' },
      { emoji: '', text: 'ليمون — منعش يزيل الروائح' },
      { emoji: '', text: 'حليب + عسل — ترطيب فاخر' },
    ],
  },
  {
    emoji: '',
    title: 'تقوية الأظافر',
    subtitle: 'أظافر قوية — بدون تكسر',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'مقوي أظافر — طبقة أساس قبل الطلاء' },
      { emoji: '', text: 'زيت الأظافر — يومياً' },
      { emoji: '', text: 'بيوتين وزنك — من الداخل للخارج' },
      { emoji: '', text: 'قفازات للتنظيف — احمي أظافركِ' },
    ],
  },
  {
    emoji: '',
    title: 'عناية بالكالو',
    subtitle: 'قدمان ناعمتان',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '🪨', text: 'حجر الخفاف — بعد النقع مباشرة' },
      { emoji: '', text: 'كريم يوريا — يرطب ويزيل الجلد الميت' },
      { emoji: '', text: 'جوارب قطنية — بعد الكريم طوال الليل' },
      { emoji: '', text: 'مرتين أسبوعياً — للصيف خصوصاً' },
    ],
  },
];

export default function NailCareGuideScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('mobile.nailCareGuide.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.nailCareGuide.subtitle')}</Text>
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
