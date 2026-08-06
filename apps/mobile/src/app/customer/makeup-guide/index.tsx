import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }

interface MakeupCard {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  tips: Tip[];
}

const MAKEUP_CARDS: MakeupCard[] = [
  {
    emoji: '🎨', title: 'أساس المكياج', subtitle: 'primer + foundation',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '🧴', text: 'برايمر — يملأ المسام ويثبت المكياج' },
      { emoji: '💧', text: 'بشرة رطبة — المرطب قبل البرايمر' },
      { emoji: '🎨', text: 'فاونديشن — طبقة رقيقة' },
      { emoji: '🖌️', text: 'ادمجي بالإسفنجة — وليس الأصابع' },
    ],
  },
  {
    emoji: '🖌️', title: 'فرش المكياج', subtitle: 'دليل التنظيف والاستخدام',
    color: '#e11d48', bg: '#fff1f2',
    tips: [
      { emoji: '🧼', text: 'نظفي الفرش أسبوعياً — بشامبو أطفال' },
      { emoji: '☀️', text: 'جففيها أفقياً — لا عمودياً' },
      { emoji: '📅', text: 'استبدلي الفرش كل 6-12 شهر' },
      { emoji: '🚫', text: 'لا تشاركي فرشك مع أحد' },
    ],
  },
  {
    emoji: '👁️', title: 'مكياج العيون', subtitle: 'تقنيات أساسية',
    color: '#7c3aed', bg: '#f5f3ff',
    tips: [
      { emoji: '🎨', text: 'اللون الفاتح — على كامل الجفن' },
      { emoji: '🌑', text: 'اللون المتوسط — على الثنية' },
      { emoji: '✨', text: 'اللون اللامع — في الزاوية الداخلية' },
      { emoji: '🖌️', text: 'ادمجي جيداً — لا خطوط قاسية' },
    ],
  },
  {
    emoji: '💋', title: 'مكياج الشفاه', subtitle: 'لون يدوم طويلاً',
    color: '#db2777', bg: '#fdf2f8',
    tips: [
      { emoji: '🧹', text: 'قشري الشفاه — سكر + عسل' },
      { emoji: '💧', text: 'رطبي قبل 10 دقائق من اللون' },
      { emoji: '✏️', text: 'حددي الشفاه — يمنع التطاير' },
      { emoji: '🖌️', text: 'طبقتان — وامسحي الزائد بمنديل' },
    ],
  },
  {
    emoji: '✨', title: 'الكونتور', subtitle: 'نحت الوجه',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '🌑', text: 'داكن — تحت عظمة الخد' },
      { emoji: '✨', text: 'فاتح — فوق عظمة الخد' },
      { emoji: '🖌️', text: 'امزجي جيداً — لا خطوط ظاهرة' },
      { emoji: '💡', text: 'الكريمي أسهل من البودرة للمبتدئات' },
    ],
  },
  {
    emoji: '🌸', title: 'أحمر الخدود', subtitle: 'لمسة حيوية',
    color: '#db2777', bg: '#fdf2f8',
    tips: [
      { emoji: '🍎', text: 'ضعيه على تفاحة الخد' },
      { emoji: '↗️', text: 'امزجي للأعلى نحو الصدغ' },
      { emoji: '🎨', text: 'الكريمي — للبشرة الجافة' },
      { emoji: '💨', text: 'البودرة — للبشرة الدهنية' },
    ],
  },
  {
    emoji: '👰', title: 'مكياج العروس', subtitle: 'إطلالة الزفاف',
    color: '#7c3aed', bg: '#f5f3ff',
    tips: [
      { emoji: '📅', text: 'جلسة تجريبية قبل الزفاف بشهر' },
      { emoji: '💧', text: 'رطبي بشرتك جيداً أسبوع الزفاف' },
      { emoji: '⏰', text: 'ابدئي المكياج 3 ساعات قبل الحفل' },
      { emoji: '📸', text: 'مكياج دائم — للصور والفيديو' },
    ],
  },
  {
    emoji: '🌿', title: 'مكياج طبيعي', subtitle: 'إطلالة يومية خفيفة',
    color: '#059669', bg: '#ecfdf5',
    tips: [
      { emoji: '☀️', text: 'BB كريم — بدل الفاونديشن الثقيل' },
      { emoji: '✨', text: 'هايلايتر — على عظمة الخد فقط' },
      { emoji: '👁️', text: 'ماسكارا بنية — طبيعية أكثر' },
      { emoji: '💋', text: 'تينت شفاه — لون طبيعي خفيف' },
    ],
  },
  {
    emoji: '✨', title: 'مكياج لامع', subtitle: 'للمناسبات والسهرات',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '✨', text: 'جليتر — على الجفن فقط' },
      { emoji: '💧', text: 'برايمر جليتر — يثبت اللمعان' },
      { emoji: '🌙', text: 'للسهرات — ضعي هايلايتر على عظمة الترقوة' },
      { emoji: '⚠️', text: 'منطقة واحدة لامعة — ليس الوجه كله' },
    ],
  },
  {
    emoji: '🧹', title: 'إزالة المكياج', subtitle: 'خطوة لا تهمليها',
    color: '#0891b2', bg: '#ecfeff',
    tips: [
      { emoji: '💧', text: 'ماء ميسيلار — للوجه والعيون' },
      { emoji: '🫒', text: 'زيت تنظيف — يذيب المكياج المقاوم' },
      { emoji: '🧼', text: 'اغسلي بعد المزيل — خطوتين دائماً' },
      { emoji: '🌙', text: 'لا تنامي أبداً بالمكياج' },
    ],
  },
];

export default function MakeupGuideScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>💄 دليل المكياج</Text>
      <Text style={styles.subtitle}>كل ما تحتاجينه لإطلالة مثالية</Text>

      <View style={styles.grid}>
        {MAKEUP_CARDS.map((card, i) => (
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
