import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }

interface IngredientCard {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  tips: Tip[];
}

const INGREDIENTS: IngredientCard[] = [
  {
    emoji: '🍊', title: 'فيتامين سي', subtitle: 'مضاد الأكسدة الأقوى',
    color: '#ea580c', bg: '#fff7ed',
    tips: [
      { emoji: '☀️', text: 'صباحاً — قبل واقي الشمس' },
      { emoji: '✨', text: 'يفتح التصبغات ويوحد اللون' },
      { emoji: '🛡️', text: 'يعزز حماية واقي الشمس' },
      { emoji: '🧪', text: 'L-Ascorbic Acid — أقوى صيغة' },
    ],
  },
  {
    emoji: '⏳', title: 'الريتينول', subtitle: 'المكون السحري للبشرة',
    color: '#7c3aed', bg: '#f5f3ff',
    tips: [
      { emoji: '🌙', text: 'مساءً فقط — يتحسس من الشمس' },
      { emoji: '💧', text: 'كمية حبة بازلاء — للوجه كله' },
      { emoji: '📅', text: 'ابدئي مرة أسبوعياً — ثم زيدي تدريجياً' },
      { emoji: '☀️', text: 'واقي شمس في الصباح — ضروري جداً' },
    ],
  },
  {
    emoji: '💧', title: 'حمض الهيالورونيك', subtitle: 'ملك الترطيب',
    color: '#0284c7', bg: '#f0f9ff',
    tips: [
      { emoji: '💧', text: 'يحمل 1000 ضعف وزنه ماء' },
      { emoji: '🧴', text: 'يطبق على بشرة رطبة — وليس جافة' },
      { emoji: '🤝', text: 'مع فيتامين سي — ثنائي رائع' },
      { emoji: '✨', text: 'يناسب جميع أنواع البشرة' },
    ],
  },
  {
    emoji: '💊', title: 'نياسيناميد', subtitle: 'فيتامين B3 المتعدد الفوائد',
    color: '#0d9488', bg: '#f0fdfa',
    tips: [
      { emoji: '🔍', text: 'يقلص المسام — بشرة أنعم' },
      { emoji: '✨', text: 'يوحد اللون — يقلل التصبغات' },
      { emoji: '🛡️', text: 'يقوي حاجز البشرة' },
      { emoji: '🤝', text: 'آمن مع معظم المكونات — صباح ومساء' },
    ],
  },
  {
    emoji: '🌿', title: 'حمض الأزيليك', subtitle: 'المكون اللطيف متعدد الفوائد',
    color: '#e11d48', bg: '#fff1f2',
    tips: [
      { emoji: '🔴', text: 'يعالج حبوب الشباب والوردية' },
      { emoji: '✨', text: 'يفتح التصبغات — آمن للحوامل' },
      { emoji: '🌿', text: 'لطيف — مناسب للبشرة الحساسة' },
      { emoji: '🤝', text: 'مع النياسيناميد — ثنائي مهدئ' },
    ],
  },
  {
    emoji: '🧱', title: 'السيراميد', subtitle: 'طوب بناء حاجز البشرة',
    color: '#059669', bg: '#ecfdf5',
    tips: [
      { emoji: '🛡️', text: 'يعيد بناء حاجز البشرة' },
      { emoji: '💧', text: 'يمنع فقدان الرطوبة' },
      { emoji: '🌿', text: 'ممتاز للبشرة الحساسة والجافة' },
      { emoji: '🤝', text: 'مع النياسيناميد — ثنائي مرمم' },
    ],
  },
  {
    emoji: '🧬', title: 'الببتيدات', subtitle: 'بروتينات صغيرة — نتائج كبيرة',
    color: '#059669', bg: '#ecfdf5',
    tips: [
      { emoji: '🔬', text: 'تحفز الكولاجين — بشرة أكثر شباباً' },
      { emoji: '☀️', text: 'يمكن استخدامها صباحاً ومساءً' },
      { emoji: '🤝', text: 'آمنة مع معظم المكونات الأخرى' },
      { emoji: '⏳', text: 'النتائج تحتاج 4-8 أسابيع' },
    ],
  },
  {
    emoji: '🧪', title: 'أحماض البشرة', subtitle: 'دليل AHA و BHA و PHA',
    color: '#0d9488', bg: '#f0fdfa',
    tips: [
      { emoji: '🍋', text: 'AHA — يذيب السطح للتجاعيد' },
      { emoji: '🧹', text: 'BHA — ينظف المسام للحبوب' },
      { emoji: '🌿', text: 'PHA — لطيف للبشرة الحساسة' },
      { emoji: '⚠️', text: 'لا تخلطي أحماض مع ريتينول معاً' },
    ],
  },
  {
    emoji: '💦', title: 'رذاذ الوجه', subtitle: 'انتعاش فوري للبشرة',
    color: '#e11d48', bg: '#fff1f2',
    tips: [
      { emoji: '🌹', text: 'ماء الورد — مهدئ ومنعش طبيعي' },
      { emoji: '💧', text: 'قبل المرطب — يمتص بشكل أفضل' },
      { emoji: '☀️', text: 'فوق المكياج — إشراقة منتصف اليوم' },
      { emoji: '✈️', text: 'في الطائرة — يحمي من الجفاف' },
    ],
  },
  {
    emoji: '🫒', title: 'زيوت الوجه', subtitle: 'متى وكيف تستخدمينها',
    color: '#d97706', bg: '#fffbeb',
    tips: [
      { emoji: '🌙', text: 'آخر خطوة في المساء — تغلق الترطيب' },
      { emoji: '💧', text: '2-3 قطرات فقط — بين راحة اليد' },
      { emoji: '🫒', text: 'ثمر الورد — للتصبغات والتجاعيد' },
      { emoji: '🥥', text: 'جوجوبا — الأقرب لزيوت البشرة' },
    ],
  },
  { emoji:'✨',title:'البشرة الزجاجية',subtitle:'سر البشرة الكورية الصافية',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'💧',text:'7 طبقات ترطيب — تونر خفيف يطبق 7 مرات'},{emoji:'✨',text:'طبقات رقيقة — كل طبقة تمتص قبل التالية'},{emoji:'🧖',text:'تقشير منتظم — أساس البشرة الزجاجية'},{emoji:'☀️',text:'واقي شمس يومي — حماية من التصبغات'}]},
  { emoji:'🎭',title:'قناع الورقة',subtitle:'علاج مكثف في 15 دقيقة',color:'#e11d48',bg:'#fff1f2',tips:[{emoji:'🧹',text:'بعد التنظيف — البشرة النظيفة تمتص أفضل'},{emoji:'⏱️',text:'15-20 دقيقة — لا تتركيه حتى يجف'},{emoji:'💆',text:'دلكي الفائض — لا تغسلي وجهك بعده'},{emoji:'📅',text:'2-3 مرات أسبوعياً — لا يومياً'}]},
  { emoji:'💧',title:'الإسينس',subtitle:'الخطوة السحرية في الروتين الكوري',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'🔄',text:'بعد التونر — وقبل السيروم'},{emoji:'💧',text:'قوام مائي خفيف — يخترق الطبقات العميقة'},{emoji:'✨',text:'يهيئ البشرة — يمتص السيروم بشكل أفضل'},{emoji:'🤲',text:'يطبق باليدين — ربتي ولا تفركي'}]},
  { emoji:'🐌',title:'مادة الحلزون',subtitle:'سر الترطيب الكوري',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🔬',text:'غني بالجليكوليك أسيد — مقشر لطيف طبيعي'},{emoji:'💧',text:'ألانتوين — يهدئ ويرطب بعمق'},{emoji:'✨',text:'يعالج الندبات والتصبغات'},{emoji:'🤝',text:'آمن مع معظم المكونات — صباح ومساء'}]},
  { emoji:'🌿',title:'سينتيلا (Cica)',subtitle:'عشبة النمر — مهدئ خارق',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'🧯',text:'يهدئ الالتهابات — ممتاز للبشرة الحساسة'},{emoji:'🩹',text:'يسرع التئام الجروح — يحفز الكولاجين'},{emoji:'🔴',text:'يقلل الاحمرار — بشرة هادئة ومتجانسة'},{emoji:'💧',text:'يقوي حاجز البشرة — يمنع فقدان الرطوبة'}]},
  { emoji:'🧪',title:'التقشير الكيميائي',subtitle:'تجديد البشرة بطريقة احترافية',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'🌿',text:'سطحي — أحماض خفيفة لا وقت تعافي'},{emoji:'🍋',text:'متوسط — يخترق أعمق 3-5 أيام تقشير'},{emoji:'🧪',text:'عميق — طبيب فقط نتائج قوية'},{emoji:'☀️',text:'بعد الجلسة — واقي شمس ضروري جداً'}]},
  { emoji:'🔬',title:'المايكرونيدلنغ',subtitle:'إبر دقيقة — نتائج مذهلة',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'✨',text:'يحفز الكولاجين — إبر دقيقة تخترق الجلد'},{emoji:'🔬',text:'يعالج الندبات والمسام الواسعة'},{emoji:'⏱️',text:'جلسة كل 4-6 أسابيع — 3-6 جلسات'},{emoji:'🧴',text:'بعد الجلسة — سيروم هيالورونيك أسيد'}]},
  { emoji:'💦',title:'الهيدروفيشل',subtitle:'تنظيف عميق بضغط الماء',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'🧹',text:'ينظف المسام بعمق — بدون ألم أو احمرار'},{emoji:'💧',text:'يرطب ويغذي — في نفس الجلسة'},{emoji:'⏱️',text:'30-45 دقيقة — نتائج فورية'},{emoji:'📅',text:'مرة شهرياً — للحفاظ على النتائج'}]},
  { emoji:'🌱',title:'الباكوتشيول',subtitle:'بديل الريتينول الطبيعي',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🌿',text:'نباتي 100% — مستخلص من نبات البسوراليا'},{emoji:'☀️',text:'آمن نهاراً — لا يتحسس من الشمس'},{emoji:'🤰',text:'آمن للحوامل — بديل ممتاز للريتينول'},{emoji:'✨',text:'يحفز الكولاجين — بدون تهيج أو تقشير'}]},
  { emoji:'⚗️',title:'خلط المكونات',subtitle:'ما يصلح معاً — وما لا يصلح',color:'#e11d48',bg:'#fff1f2',tips:[{emoji:'✅',text:'فيتامين C + واقي شمس — ثنائي مثالي'},{emoji:'✅',text:'ريتينول + ببتيدات — مضاد شيخوخة قوي'},{emoji:'❌',text:'ريتينول + أحماض — تهيج شديد'},{emoji:'❌',text:'فيتامين C + أحماض — يبطل مفعولهم'}]},
  { emoji:'💨',title:'فيشل الأكسجين',subtitle:'أكسجين مضغوط — بشرة مشرقة',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'✨',text:'يرش الأكسجين — مع سيروم مغذي'},{emoji:'💧',text:'ترطيب فوري — بشرة ممتلئة'},{emoji:'⏱️',text:'30-45 دقيقة — بدون ألم'},{emoji:'🌟',text:'قبل المناسبات — نتيجة فورية'}]},
  { emoji:'💎',title:'فيشل الألماس',subtitle:'سنفرة الألماس — بشرة جديدة',color:'#4f46e5',bg:'#eef2ff',tips:[{emoji:'✨',text:'رأس ماسي — يقشر السطح بلطف'},{emoji:'🔬',text:'يحفز الكولاجين — بشرة أنعم'},{emoji:'🧹',text:'يزيل الخلايا الميتة'},{emoji:'📅',text:'كل 4-6 أسابيع — نتائج مثالية'}]},
  { emoji:'👑',title:'فيشل الذهب',subtitle:'ذهب 24 قيراط — ترفيه ملكي',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'✨',text:'رقائق ذهب حقيقية — على الوجه'},{emoji:'💫',text:'يحسن مرونة البشرة — يبطئ الشيخوخة'},{emoji:'🌟',text:'يعكس الضوء — بشرة متوهجة فوراً'},{emoji:'💰',text:'فاخر — للمناسبات الخاصة'}]},
  { emoji:'🩸',title:'فيشل البلازما',subtitle:'PRP — بلازما دمكِ لجمالكِ',color:'#ef4444',bg:'#fef2f2',tips:[{emoji:'💉',text:'تسحب عينة دم — تستخلص البلازما'},{emoji:'🔬',text:'حقن البلازما — تحفز الكولاجين بقوة'},{emoji:'✨',text:'نتائج طبيعية 100% — من جسمكِ'},{emoji:'⏱️',text:'3-4 جلسات — بينها شهر'}]},
  { emoji:'🐟',title:'فيشل الكافيار',subtitle:'كافيار فاخر — تغذية عميقة',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'🧬',text:'غني بالأحماض الأمينية — يغذي بعمق'},{emoji:'💧',text:'أوميغا 3 — يرطب ويجدد'},{emoji:'✨',text:'يحسن المرونة — يقلل الخطوط'},{emoji:'👑',text:'فاخر — من أفخم علاجات التجميل'}]},
  { emoji:'👁️',title:'الهالات السوداء',subtitle:'أسبابها وعلاجها من جذورها',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'💤',text:'قلة النوم — السبب الأول'},{emoji:'🩸',text:'نقص الحديد — سبب شائع'},{emoji:'🧬',text:'وراثة — ميل طبيعي'},{emoji:'💧',text:'جفاف — البشرة رقيقة تحت العين'}]},
  { emoji:'👀',title:'انتفاخ تحت العين',subtitle:'أكياس العين — حلول سريعة',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'🧊',text:'كمادات باردة — 10 دقائق صباحاً'},{emoji:'☕',text:'كافيين موضعي — يضيق الأوعية'},{emoji:'🛏️',text:'وسادة مرتفعة — تقلل السوائل'},{emoji:'🧂',text:'قللي الملح — يسبب الاحتباس'}]},
  { emoji:'😊',title:'خطوط حول العين',subtitle:'أقدام الغراب — وقاية وعلاج',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'🕶️',text:'نظارة شمس — تمنع التحديق'},{emoji:'💆',text:'تربيت خفيف — لا تفركي'},{emoji:'🧴',text:'كريم عيون ببتيدات — صباح ومساء'},{emoji:'💉',text:'بوتوكس — للخطوط العميقة'}]},
  { emoji:'💆',title:'مساج العين',subtitle:'3 دقائق — لعيون مشرقة',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'☝️',text:'البنصر — الأخف للتربيت'},{emoji:'🔄',text:'من الداخل للخارج — بحركة دائرية'},{emoji:'🧴',text:'مع كريم أو زيت — لتزلق الأصابع'},{emoji:'⏱️',text:'3 دقائق — صباحاً للانتفاخ'}]},
  { emoji:'🧪',title:'سيروم العين',subtitle:'دليل اختيار السيروم المناسب',color:'#e11d48',bg:'#fff1f2',tips:[{emoji:'☕',text:'كافيين — للهالات والانتفاخ'},{emoji:'🧬',text:'ببتيدات — للتجاعيد والخطوط'},{emoji:'💧',text:'هيالورونيك — للترطيب العميق'},{emoji:'🌟',text:'فيتامين C — لتفتيح الهالات'}]},
];

export default function SkincareGuideScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>🧴 دليل المكونات</Text>
      <Text style={styles.subtitle}>كل ما تحتاجين معرفته عن المكونات الفعالة للعناية بالبشرة</Text>

      <View style={styles.grid}>
        {INGREDIENTS.map((ingredient, i) => (
          <View key={i} style={[styles.card, { borderColor: ingredient.color + '30' }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{ingredient.emoji}</Text>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: ingredient.color }]}>{ingredient.title}</Text>
                <Text style={styles.cardSubtitle}>{ingredient.subtitle}</Text>
              </View>
            </View>
            <View style={styles.tipsList}>
              {ingredient.tips.map((tip, j) => (
                <View key={j} style={[styles.tipRow, { backgroundColor: ingredient.bg }]}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={[styles.tipText, { color: ingredient.color }]}>{tip.text}</Text>
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
  card: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1,
    padding: 16, marginBottom: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
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
