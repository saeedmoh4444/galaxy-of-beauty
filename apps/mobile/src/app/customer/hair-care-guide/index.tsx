import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }

interface HairCard {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  tips: Tip[];
}

const HAIR_CARDS: HairCard[] = [
  {
    emoji: '🚿', title: 'غسيل الشعر', subtitle: 'الطريقة الصحيحة',
    color: '#0284c7', bg: '#f0f9ff',
    tips: [
      { emoji: '💧', text: 'بللي الشعر تماماً — 1-2 دقيقة' },
      { emoji: '🧴', text: 'الشامبو لفروة الرأس فقط' },
      { emoji: '💆', text: 'البلسم للأطراف فقط — وليس الجذور' },
      { emoji: '❄️', text: 'اشطفي بماء بارد — يغلق البشرة ويضيف لمعان' },
    ],
  },
  {
    emoji: '💆‍♀️', title: 'ماسك الشعر', subtitle: 'وصفات طبيعية للشعر',
    color: '#7c3aed', bg: '#f5f3ff',
    tips: [
      { emoji: '🥑', text: 'أفوكادو + عسل — للشعر الجاف' },
      { emoji: '🥚', text: 'بيض + زيت زيتون — للشعر الضعيف' },
      { emoji: '🍌', text: 'موز + زبادي — للشعر التالف' },
      { emoji: '🍎', text: 'خل تفاح — لمعان وتنظيف الفروة' },
    ],
  },
  {
    emoji: '🫒', title: 'زيوت الشعر', subtitle: 'أي زيت لشعرك؟',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '🥥', text: 'جوز الهند — يخترق الشعرة ترطيب عميق' },
      { emoji: '🫒', text: 'الأرغان — ذهبي للمعان وتغذية' },
      { emoji: '🌿', text: 'إكليل الجبل — يحفز نمو الشعر' },
      { emoji: '💧', text: 'الجوجوبا — يشبه زيوت فروة الرأس' },
    ],
  },
  {
    emoji: '🔥', title: 'حماية من الحرارة', subtitle: 'احمي شعرك من التلف',
    color: '#ea580c', bg: '#fff7ed',
    tips: [
      { emoji: '🛡️', text: 'واقي حراري — دائماً قبل المجفف أو المكواة' },
      { emoji: '🌡️', text: 'حرارة متوسطة — لا القصوى' },
      { emoji: '⏰', text: 'لا تمرري المكواة على نفس الخصلة مرتين' },
      { emoji: '📅', text: 'يوم بدون حرارة في الأسبوع' },
    ],
  },
  {
    emoji: '💆‍♀️', title: 'فروة الرأس', subtitle: 'بشرة صحية = شعر صحي',
    color: '#0d9488', bg: '#f0fdfa',
    tips: [
      { emoji: '🧹', text: 'تقشير فروة الرأس — مرة شهرياً' },
      { emoji: '💆', text: 'تدليك يومي — 5 دقائق بزيت دافئ' },
      { emoji: '🌡️', text: 'ماء فاتر — ليس ساخناً' },
      { emoji: '🧴', text: 'سيروم لفروة الرأس — قبل النوم' },
    ],
  },
  {
    emoji: '🎨', title: 'صبغ الشعر', subtitle: 'نصائح قبل الصبغة',
    color: '#db2777', bg: '#fdf2f8',
    tips: [
      { emoji: '📅', text: 'لا تغسلي شعرك 48 ساعة قبل الصبغة' },
      { emoji: '🧴', text: 'استخدمي شامبو وبلسم للشعر المصبوغ' },
      { emoji: '☀️', text: 'احمي شعرك من الشمس بعد الصبغة' },
      { emoji: '⏰', text: 'جديدي الصبغة كل 4-6 أسابيع' },
    ],
  },
  {
    emoji: '💇‍♀️', title: 'تسريحة الشعر', subtitle: 'حسب نوع شعرك',
    color: '#7c3aed', bg: '#f5f3ff',
    tips: [
      { emoji: '🔄', text: 'الشعر المجعد — كريم ليف ان بعد الغسيل' },
      { emoji: '📏', text: 'الشعر الناعم — موس رفع الجذور' },
      { emoji: '🌊', text: 'الشعر المموج — سبراي ملح البحر' },
      { emoji: '👑', text: 'الشعر المتعرج — زبدة شعر + ضفائر' },
    ],
  },
  {
    emoji: '🌸', title: 'شعر العروس', subtitle: 'تحضير للعرس',
    color: '#db2777', bg: '#fdf2f8',
    tips: [
      { emoji: '📅', text: 'ابدئي العناية 6 أشهر قبل الزفاف' },
      { emoji: '💇', text: 'آخر قصة قبل الزفاف بأسبوعين' },
      { emoji: '🎨', text: 'آخر صبغة قبل الزفاف بأسبوع' },
      { emoji: '💆', text: 'حمام زيت أسبوعياً في الشهر الأخير' },
    ],
  },
  {
    emoji: '☀️', title: 'شعر الصيف', subtitle: 'حماية من الشمس والبحر',
    color: '#ea580c', bg: '#fff7ed',
    tips: [
      { emoji: '🧢', text: 'قبعة أو وشاح — حماية من الأشعة' },
      { emoji: '💧', text: 'بللي شعرك بماء عذب قبل البحر' },
      { emoji: '🧴', text: 'سبراي حماية من الشمس للشعر' },
      { emoji: '❄️', text: 'اشطفي فوراً بعد المسبح' },
    ],
  },
  {
    emoji: '🧕', title: 'شعر المحجبة', subtitle: 'عناية خاصة تحت الحجاب',
    color: '#059669', bg: '#ecfdf5',
    tips: [
      { emoji: '🧵', text: 'غطاء قطني تحت الحجاب — يمتص العرق' },
      { emoji: '💨', text: 'فكي شعرك 15 دقيقة يومياً للتهوية' },
      { emoji: '💧', text: 'رطبي شعرك جيداً قبل لبس الحجاب' },
      { emoji: '🧴', text: 'تجنبي ربط الشعر بشدة تحت الحجاب' },
    ],
  },
];

export default function HairCareGuideScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>💇‍♀️ دليل العناية بالشعر</Text>
      <Text style={styles.subtitle}>كل ما تحتاجينه لشعر صحي وجميل</Text>

      <View style={styles.grid}>
        {HAIR_CARDS.map((card, i) => (
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
  container: { flex: 1, backgroundColor: '#f5f3ff' },
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
