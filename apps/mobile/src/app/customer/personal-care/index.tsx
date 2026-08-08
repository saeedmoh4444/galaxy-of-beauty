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
  { emoji:'🛏️',title:'وسادة الحرير',subtitle:'سر جمالي أثناء النوم',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'💇',text:'يمنع تكسر الشعر — احتكاك أقل من القطن'},{emoji:'✨',text:'يمنع تجاعيد النوم — بشرة أنعم صباحاً'},{emoji:'💧',text:'يحافظ على ترطيب البشرة — لا يمتص الزيوت'},{emoji:'🧼',text:'اغسليها كل أسبوع — بماء بارد وصابون لطيف'}]},
  { emoji:'🕯️',title:'إزالة الشعر',subtitle:'أي طريقة تناسبك؟',color:'#e11d48',bg:'#fff1f2',tips:[{emoji:'🍯',text:'حلاوة — طبيعية ألم أقل من الشمع'},{emoji:'🕯️',text:'شمع — نتيجة تدوم 3-4 أسابيع'},{emoji:'💡',text:'ليزر — نتيجة شبه دائمة 6 جلسات'},{emoji:'🧵',text:'فتلة — للوجه دقيقة جداً'}]},
  { emoji:'🍓',title:'ماء الديتوكس',subtitle:'مشروبات طبيعية لبشرة متوهجة',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🍋',text:'ليمون + نعناع — منعش يطرد السموم'},{emoji:'🍓',text:'فراولة + ريحان — مضاد أكسدة بشرة مشرقة'},{emoji:'🥒',text:'خيار + زنجبيل — مهدئ يقلل الالتهابات'},{emoji:'🍊',text:'برتقال + قرفة — فيتامين C كولاجين طبيعي'}]},
  { emoji:'💡',title:'قناع LED',subtitle:'العلاج بالضوء في منزلك',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'🔴',text:'أحمر — كولاجين مضاد للشيخوخة'},{emoji:'🔵',text:'أزرق — يقتل البكتيريا لعلاج الحبوب'},{emoji:'🟡',text:'أصفر — يفتح البقع يقلل التصبغات'},{emoji:'🟢',text:'أخضر — مهدئ يقلل الاحمرار'}]},
  { emoji:'💎',title:'روتين القواشا',subtitle:'تدليك يومي — 5 دقائق فقط',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'🧴',text:'زيت أو سيروم — لتزلق الأداة على البشرة'},{emoji:'⬆️',text:'دائماً للأعلى وللخارج — ضد الجاذبية'},{emoji:'💆',text:'5 تمريرات لكل منطقة — بلطف وليس بقوة'},{emoji:'❄️',text:'خزني الحجر في الثلاجة — لانتعاش إضافي'}]},
  { emoji:'⚡',title:'المايكروكرنت',subtitle:'تيار كهربائي خفيف — شد فوري',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'💪',text:'يحفز العضلات — يشد ملامح الوجه'},{emoji:'⬆️',text:'للأعلى وللخارج — ضد الجاذبية'},{emoji:'⏱️',text:'5-10 دقائق — 3-4 مرات أسبوعياً'},{emoji:'🧴',text:'جل موصل — ضروري لتوصيل التيار'}]},
  { emoji:'📡',title:'الراديو فريكونسي',subtitle:'موجات حرارية — كولاجين جديد',color:'#e11d48',bg:'#fff1f2',tips:[{emoji:'🔥',text:'يسخن الأدمة — يحفز إنتاج الكولاجين'},{emoji:'✨',text:'يشد الجلد — يقلل الترهلات والخطوط'},{emoji:'⏱️',text:'جلسة 30-45 دقيقة — مرة شهرياً'},{emoji:'🔴',text:'احمرار مؤقت — يختفي خلال ساعات'}]},
  { emoji:'❄️',title:'عصا الكرايو',subtitle:'تبريد عميق — انتعاش فوري',color:'#4f46e5',bg:'#eef2ff',tips:[{emoji:'🧊',text:'يقلص المسام — بشرة أنعم وأكثر إشراقاً'},{emoji:'💆',text:'تدليك بارد — يقلل الانتفاخ تحت العين'},{emoji:'🌅',text:'صباحاً — ينشط الدورة الدموية'},{emoji:'⏱️',text:'3-5 دقائق — لا تطيلي على منطقة واحدة'}]},
  { emoji:'🔊',title:'الموجات فوق الصوتية',subtitle:'ملعقة تنظيف المسام',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'🧹',text:'اهتزازات عالية — تطرد الرؤوس السوداء'},{emoji:'💧',text:'على بشرة رطبة — أفضل نتائج'},{emoji:'⬆️',text:'حركي للأعلى — بطول المسام'},{emoji:'📅',text:'مرة أسبوعياً — لا تفرطي في الاستخدام'}]},
  { emoji:'⚡',title:'التردد العالي',subtitle:'غاز الأرجون — علاج الحبوب',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'🔴',text:'يجفف الحبوب — يقتل البكتيريا المسببة'},{emoji:'✨',text:'يحسن الدورة الدموية — بشرة متوهجة'},{emoji:'🧴',text:'على بشرة جافة — مع شاش واقي'},{emoji:'⏱️',text:'3-5 دقائق — مرتين أسبوعياً'}]},
  { emoji:'🍊',title:'السيلوليت',subtitle:'علاج مظهر قشر البرتقال',color:'#ea580c',bg:'#fff7ed',tips:[{emoji:'💆',text:'مساج التصريف اللمفاوي — يقلل الاحتباس'},{emoji:'🏃',text:'رياضة منتظمة — تحسن الدورة الدموية'},{emoji:'💧',text:'اشربي ماء — الترطيب يحسن مظهر الجلد'},{emoji:'🫒',text:'كافيين موضعي — كريمات تنشط الدورة'}]},
  { emoji:'〰️',title:'علامات التمدد',subtitle:'علاج وتخفيف الخطوط',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'🧴',text:'زبدة الكاكاو — ترطيب يومي أثناء الحمل'},{emoji:'💧',text:'زيت ثمر الورد — يحسن مظهر العلامات'},{emoji:'🔬',text:'مايكرونيدلنغ — لتحفيز الكولاجين'},{emoji:'⏰',text:'العلاج المبكر — أفضل النتائج'}]},
  { emoji:'💪',title:'نحت الجسم',subtitle:'تقنيات غير جراحية',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'❄️',text:'تجميد الدهون — كريوليبوليسز'},{emoji:'📡',text:'راديو فريكونسي — حرارة تشد الجلد'},{emoji:'🔊',text:'ألتراساوند — موجات تذيب الدهون'},{emoji:'💉',text:'حقن — إذابة دهون موضعية'}]},
  { emoji:'🎁',title:'لفافات الجسم',subtitle:'علاجات سبا للجسم',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🌿',text:'طين البحر — ينظف ويزيل السموم'},{emoji:'🍫',text:'شوكولاتة — مضاد أكسدة يرطب وينعم'},{emoji:'🌱',text:'أعشاب بحرية — يغذي وينشط البشرة'},{emoji:'☕',text:'قهوة — كافيين يشد وينشط'}]},
  { emoji:'💆',title:'التصريف اللمفاوي',subtitle:'مساج لإزالة السموم',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'🔄',text:'حركات خفيفة — باتجاه الغدد اللمفاوية'},{emoji:'💧',text:'يقلل احتباس السوائل — جسم أنحف'},{emoji:'🛡️',text:'يقوي المناعة — ينشط الجهاز اللمفاوي'},{emoji:'📅',text:'مرة أسبوعياً — أو قبل المناسبات'}]},
  { emoji:'💄',title:'تخزين المكياج',subtitle:'حافظي على منتجاتك نظيفة',color:'#ec4899',bg:'#fdf2f8',tips:[{emoji:'🌡️',text:'مكان بارد وجاف — ليس في الحمام'},{emoji:'📦',text:'منظمات أكريليك شفافة'},{emoji:'☀️',text:'بعيداً عن الشمس — الضوء يدمر المنتجات'},{emoji:'🗂️',text:'قسميها: يومي — أسبوعي — مناسبات'}]},
  { emoji:'⏳',title:'مدة صلاحية المنتجات',subtitle:'متى تتخلصين من منتجاتك؟',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'💄',text:'ماسكارا: 3-6 أشهر'},{emoji:'🧴',text:'كريمات: 6-12 شهر بعد الفتح'},{emoji:'🎨',text:'بودرة: سنتان — الأطول عمراً'},{emoji:'💅',text:'طلاء أظافر: سنة — يسمك مع الوقت'}]},
  { emoji:'🪞',title:'تنظيم التسريحة',subtitle:'ركن جمالكِ المثالي',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'💡',text:'إضاءة طبيعية — قرب النافذة'},{emoji:'🗃️',text:'أدراج مقسمة — كل فئة في درج'},{emoji:'🪞',text:'مرآة مكبرة — للتفاصيل الدقيقة'},{emoji:'🧹',text:'نظفي التسريحة أسبوعياً'}]},
  { emoji:'🎒',title:'تعبئة حقيبة السفر',subtitle:'الأساسيات — بدون فوضى',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'🧪',text:'عبوات سفر صغيرة — أعيدي تعبئتها'},{emoji:'🎨',text:'باليت متعدد — خدود + عيون + هايلايتر'},{emoji:'📋',text:'قائمة أساسيات — لا تنسي شيئاً'},{emoji:'✈️',text:'حقيبة شفافة — للمطار'}]},
  { emoji:'🧹',title:'ترتيب وتنظيف',subtitle:'تخلصي من الفوضى',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🗑️',text:'تخلصي من: تغير لون أو رائحة أو قوام'},{emoji:'📅',text:'كل 3 أشهر — راجعي مجموعتكِ'},{emoji:'❤️',text:'احتفظي بما تستخدمينه فعلاً'},{emoji:'🎁',text:'تبرعي بالجديد غير المستخدم'}]},
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
