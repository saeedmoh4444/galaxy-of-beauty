import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }
interface CareCard { emoji: string; title: string; subtitle: string; color: string; bg: string; tips: Tip[]; }

const CARDS: CareCard[] = [
  {
    emoji: '✨', title: 'عناية بالحواجب', subtitle: 'حواجب متناسقة — إطار الوجه',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '📐', text: 'تحديد الشكل — لا تتبعي الصيحة اتبعي وجهك' },
      { emoji: '🪞', text: 'لا تنتفي كثيراً — الشعر قد لا ينمو مجدداً' },
      { emoji: '🖌️', text: 'تعبئة الفراغات — قلم حواجب بلون مطابق' },
      { emoji: '💆', text: 'زيت الخروع — يساعد على تكثيف الحواجب' },
    ],
  },
  {
    emoji: '👁️', title: 'عناية بالرموش', subtitle: 'رموش كثيفة وصحية',
    color: '#7c3aed', bg: '#f5f3ff',
    tips: [
      { emoji: '🧹', text: 'تنظيف لطيف — مزيل مكياج خالٍ من الزيوت' },
      { emoji: '💆', text: 'زيت الخروع — يطبق ليلاً لتقوية الرموش' },
      { emoji: '🚫', text: 'لا تفركي — الفرك يسبب تساقط الرموش' },
      { emoji: '⏰', text: 'استراحة — خذي استراحة من الرموش الصناعية' },
    ],
  },
  {
    emoji: '🧖', title: 'عناية بالجسم', subtitle: 'بشرة ناعمة من الرأس للقدمين',
    color: '#0d9488', bg: '#f0fdfa',
    tips: [
      { emoji: '🧖', text: 'تقشير أسبوعي — يزيل الخلايا الميتة ويجدد البشرة' },
      { emoji: '🧴', text: 'ترطيب بعد الاستحمام — البشرة تمتص المرطب أفضل' },
      { emoji: '☀️', text: 'واقي للجسم — لا تنسي رقبتك ويديك وقدميك' },
      { emoji: '💧', text: 'شرب الماء — بشرة الجسم تحتاج ترطيب من الداخل' },
    ],
  },
  {
    emoji: '🦷', title: 'ابتسامة مشرقة', subtitle: 'عناية بالأسنان لجمال ابتسامتك',
    color: '#0284c7', bg: '#f0f9ff',
    tips: [
      { emoji: '🪥', text: 'تنظيف مرتين — صباحاً ومساءً دقيقتان' },
      { emoji: '🦷', text: 'خيط الأسنان — يومياً يمنع التسوس' },
      { emoji: '🍓', text: 'تبييض طبيعي — فراولة + بيكربونات' },
      { emoji: '👩‍⚕️', text: 'فحص دوري — كل 6 أشهر عند الطبيب' },
    ],
  },
  { emoji:'🛁',title:'حمام مغربي',subtitle:'طقس الجمال التقليدي',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'🧖',text:'الصابون البلدي — أساس الحمام المغربي'},{emoji:'🧤',text:'الليفة المغربية — تقشير عميق للجسم'},{emoji:'🌿',text:'طين الغاسول — ينقي ويشد البشرة'},{emoji:'💧',text:'ماء الورد — لإنعاش بعد الحمام'}]},
  { emoji:'🌿',title:'العلاج بالروائح',subtitle:'زيوت عطرية لجمالك وصحتك',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'🌸',text:'اللافندر — للاسترخاء والنوم العميق'},{emoji:'🍋',text:'الليمون — منعش ومنشط للطاقة'},{emoji:'🌹',text:'الورد — مهدئ للبشرة الحساسة'},{emoji:'🍃',text:'النعناع — للصداع وتنشيط الدورة'}]},
  { emoji:'🪥',title:'التقشير الجاف',subtitle:'تنظيف عميق بدون ماء',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'⬆️',text:'من الأسفل للأعلى — دائماً باتجاه القلب'},{emoji:'☀️',text:'قبل الاستحمام — على بشرة جافة تماماً'},{emoji:'📅',text:'2-3 مرات أسبوعياً — لا يومياً'},{emoji:'🧴',text:'بعدها — زيت أو كريم مرطب فوراً'}]},
  { emoji:'🧊',title:'مكعبات الثلج للوجه',subtitle:'سر إشراقة الصباح',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'✨',text:'يقلص المسام — بشرة أنعم فوراً'},{emoji:'🌅',text:'صباحاً — يقلل الانتفاخ تحت العين'},{emoji:'🌸',text:'ثلج ماء الورد — مهدئ للبشرة'},{emoji:'⏱️',text:'30 ثانية لكل منطقة — لا تطيلي'}]},
  { emoji:'💨',title:'بخار الوجه',subtitle:'سبا منزلي بسيط',color:'#e11d48',bg:'#fff1f2',tips:[{emoji:'🌿',text:'أضيفي أعشاب — بابونج أو نعناع أو روزماري'},{emoji:'⏱️',text:'5-10 دقائق — مرتين أسبوعياً'},{emoji:'💧',text:'مسافة آمنة — 30 سم عن الوجه'},{emoji:'🧴',text:'بعد البخار — سيروم أو مرطب فوراً'}]},
];

export default function PersonalCareScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>✨ العناية الشخصية</Text>
      <Text style={styles.subtitle}>تفاصيل صغيرة — تأثير كبير</Text>
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
  container: { flex: 1, backgroundColor: '#fffbeb' },
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
