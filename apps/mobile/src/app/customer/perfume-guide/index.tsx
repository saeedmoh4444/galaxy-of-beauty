import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }

interface PerfumeCard {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  tips: Tip[];
}

const PERFUME_CARDS: PerfumeCard[] = [
  {
    emoji: '🌸', title: 'طبقات العطر', subtitle: 'كيف تختارين عطرك',
    color: '#c026d3', bg: '#fdf4ff',
    tips: [
      { emoji: '🍋', text: 'النفحة العليا: أول ما تشمين — حمضيات خفيفة' },
      { emoji: '🌹', text: 'قلب العطر: بعد 15 دقيقة — ورود وتوابل' },
      { emoji: '🪵', text: 'القاعدة: بعد ساعة — خشب مسك فانيليا' },
      { emoji: '💡', text: 'انتظري 30 دقيقة قبل الحكم على العطر' },
    ],
  },
  {
    emoji: '🪵', title: 'دهن العود', subtitle: 'ملك العطور الشرقية',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '💧', text: 'ضعيه على نقاط النبض — قطرة صغيرة تكفي' },
      { emoji: '🌡️', text: 'دفء الجسم — يفوح العطر طوال اليوم' },
      { emoji: '🇸🇦', text: 'العود السعودي — من أفخر الأنواع' },
      { emoji: '💎', text: 'استثمار — العود الحقيقي ثمين ويدوم' },
    ],
  },
  {
    emoji: '🦌', title: 'المسك', subtitle: 'أساس العطور العربية',
    color: '#7c3aed', bg: '#f5f3ff',
    tips: [
      { emoji: '🤍', text: 'المسك الأبيض — أنقى وأخف أنواع المسك' },
      { emoji: '🌸', text: 'يدمج مع الورد — للعطور النسائية' },
      { emoji: '🪵', text: 'يدمج مع العود — للعطور القوية' },
      { emoji: '💧', text: 'زيت المسك — يدوم أطول من العطر الكحولي' },
    ],
  },
  {
    emoji: '🌹', title: 'الورد الطائفي', subtitle: 'ذهب الطائف السائل',
    color: '#e11d48', bg: '#fff1f2',
    tips: [
      { emoji: '🏔️', text: 'يزرع في جبال الطائف — 2000 متر فوق البحر' },
      { emoji: '🌅', text: 'يقطف عند الفجر — لأعلى تركيز عطري' },
      { emoji: '💧', text: 'ماء الورد — تونر طبيعي ومنعش' },
      { emoji: '🇸🇦', text: 'من أندر وأغلى الزيوت العطرية في العالم' },
    ],
  },
  {
    emoji: '🧪', title: 'مزج العطور', subtitle: 'اصنعي عطرك الخاص',
    color: '#7c3aed', bg: '#f5f3ff',
    tips: [
      { emoji: '📝', text: 'القاعدة: قاعدة + قلب + نفحة عليا' },
      { emoji: '🧪', text: 'النسب: 50% قاعدة 30% قلب 20% عليا' },
      { emoji: '⏰', text: 'اتركيه 48 ساعة — لتتجانس المكونات' },
      { emoji: '💧', text: 'زيت جوجوبا — حامل مثالي للزيوت العطرية' },
    ],
  },
  {
    emoji: '📦', title: 'تخزين العطور', subtitle: 'حافظي على عطرك أطول',
    color: '#0284c7', bg: '#f0f9ff',
    tips: [
      { emoji: '🌡️', text: 'مكان بارد — 15-20 درجة مئوية' },
      { emoji: '☀️', text: 'بعيداً عن الشمس — الضوء يدمر العطر' },
      { emoji: '📦', text: 'في علبته الأصلية' },
      { emoji: '🚫', text: 'ليس في الحمام — الرطوبة تفسده' },
    ],
  },
  {
    emoji: '🌤️', title: 'العطر والموسم', subtitle: 'أي عطر في أي فصل',
    color: '#0284c7', bg: '#f0f9ff',
    tips: [
      { emoji: '🌸', text: 'ربيع — زهري أخضر منعش' },
      { emoji: '☀️', text: 'صيف — حمضيات بحري خفيف' },
      { emoji: '🍂', text: 'خريف — خشبي حار دافئ' },
      { emoji: '❄️', text: 'شتاء — شرقي ثقيل مسك' },
    ],
  },
  {
    emoji: '🎪', title: 'العطر والمناسبة', subtitle: 'اختيارك يعكس حضورك',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '💼', text: 'للعمل — خفيف منعش غير مزعج' },
      { emoji: '🌙', text: 'للسهرة — شرقي قوي وجذاب' },
      { emoji: '🏋️', text: 'للنادي — منعش خفيف جداً' },
      { emoji: '👰', text: 'للزواج — عطر مميز يدوم طويلاً' },
    ],
  },
  {
    emoji: '🧴', title: 'ثبات العطر', subtitle: 'أسرار تدوم طويلاً',
    color: '#059669', bg: '#ecfdf5',
    tips: [
      { emoji: '💧', text: 'رطبي بشرتك قبل العطر — يدوم أطول' },
      { emoji: '📍', text: 'ضعيه على نقاط النبض — الرسغ والرقبة' },
      { emoji: '🚫', text: 'لا تفركي الرسغين — يكسر جزيئات العطر' },
      { emoji: '👕', text: 'رشي على الملابس — يثبت أطول من الجلد' },
    ],
  },
  {
    emoji: '🌿', title: 'مكونات العطور', subtitle: 'عائلة العطور الشرقية',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '🪵', text: 'خشبية — عود صندل أرز' },
      { emoji: '🌶️', text: 'حارة — زعفران قرفة هيل' },
      { emoji: '🌸', text: 'زهرية — ورد ياسمين برتقال' },
      { emoji: '🍊', text: 'حمضية — برغموت ليمون غريب فروت' },
    ],
  },
];

export default function PerfumeGuideScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>🌸 دليل العطور</Text>
      <Text style={styles.subtitle}>كل ما تحتاجينه عن عالم العطور الشرقية والغربية</Text>

      <View style={styles.grid}>
        {PERFUME_CARDS.map((card, i) => (
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
