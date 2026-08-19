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
    title: 'نوم الجمال',
    subtitle: '8 ساعات — سر الجمال الحقيقي',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'نامي قبل 11 مساءً — هرمون النمو يعمل ليلاً' },
      { emoji: '', text: 'أطفئي الجوال قبل النوم بـ 30 دقيقة' },
      { emoji: '️', text: 'غرفة مظلمة وباردة — 18-20 درجة' },
      { emoji: '', text: 'نفس موعد النوم يومياً — حتى الإجازة' },
    ],
  },
  {
    emoji: '',
    title: 'شرب الماء',
    subtitle: '8 أكواب يومياً لجمالك',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '️', text: 'كوبان عند الاستيقاظ — ينشط الجسم' },
      { emoji: '', text: 'أضيفي ليمون أو نعناع — طعم منعش' },
      { emoji: '', text: 'تطبيق تذكير — يساعدك على التتبع' },
      { emoji: '', text: 'قبل كل وجبة — كوب ماء' },
    ],
  },
  {
    emoji: '',
    title: 'تغذية الجمال',
    subtitle: 'ما تأكلينه يظهر على بشرتك',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'دهون صحية — أفوكادو مكسرات زيت زيتون' },
      { emoji: '', text: 'مضادات أكسدة — توت فراولة رمان' },
      { emoji: '', text: 'أوميغا 3 — سلمون تونة' },
      { emoji: '', text: 'خضار ورقية — سبانخ كيل جرير' },
    ],
  },
  {
    emoji: '',
    title: 'رياضة الجمال',
    subtitle: 'حركة = بشرة متوهجة',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '', text: '30 دقيقة مشي يومياً — الحد الأدنى' },
      { emoji: '', text: 'يوغا — مرونة وهدوء' },
      { emoji: '', text: 'تمارين مقاومة — مرتين أسبوعياً' },
      { emoji: '', text: 'بيلاتس — جسم مشدود' },
    ],
  },
  {
    emoji: '',
    title: 'تأمل واسترخاء',
    subtitle: '5 دقائق يومياً',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🫁', text: 'تنفس عميق — شهيق 4 عدات زفير 6' },
      { emoji: '️', text: 'صباحاً — 5 دقائق قبل بدء اليوم' },
      { emoji: '', text: 'بدون جوال — مكان هادئ' },
      { emoji: '', text: 'موسيقى هادئة أو أصوات طبيعة' },
    ],
  },
  {
    emoji: '',
    title: 'ابتسامة وثقة',
    subtitle: 'جمالك من الداخل',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🪞', text: 'قفي أمام المرآة — قولي شيئاً إيجابياً' },
      { emoji: '️', text: 'اكتبي 3 أشياء ممتنة لها يومياً' },
      { emoji: '', text: 'أحطي نفسك بأشخاص إيجابيين' },
      { emoji: '', text: 'حددي أهدافاً صغيرة واحتفلي بها' },
    ],
  },
  {
    emoji: '️',
    title: 'واقي الشمس',
    subtitle: 'يومياً — حتى في البيت',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'SPF 50+ — للوجه والرقبة واليدين' },
      { emoji: '', text: 'جددي كل ساعتين تحت الشمس' },
      { emoji: '', text: 'حتى في البيت — الأشعة تخترق الزجاج' },
      { emoji: '', text: '365 يوم — صيفاً وشتاءً' },
    ],
  },
  {
    emoji: '',
    title: 'وقفة الجمال',
    subtitle: 'ظهر مستقيم = ثقة',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '', text: 'أكتاف للخلف — ذقن موازي للأرض' },
      { emoji: '🪑', text: 'لا تجلسي طويلاً — قومي كل 30 دقيقة' },
      { emoji: '', text: 'ارفعي الجوال لمستوى العين' },
      { emoji: '', text: 'مساج رقبة — يخفف التوتر' },
    ],
  },
  {
    emoji: '',
    title: 'عناية رمضان',
    subtitle: 'روتين الجمال في الشهر الكريم',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'اشربي الماء بين الفطور والسحور — 8 أكواب' },
      { emoji: '', text: 'روتين ليلي بسيط — مرطب كثيف قبل النوم' },
      { emoji: '️', text: 'واقي شمس — حتى في رمضان' },
      { emoji: '', text: 'سيروم مرطب — الجفاف هو العدو الأول' },
    ],
  },
  {
    emoji: '️',
    title: 'عناية بعد الرياضة',
    subtitle: 'بشرة نظيفة بعد التمرين',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'اغسلي وجهك فوراً — العرق يسد المسام' },
      { emoji: '', text: 'ماء بارد — يغلق المسام ويهدئ البشرة' },
      { emoji: '', text: 'مرطب خفيف — البشرة تمتصه أفضل' },
      { emoji: '', text: 'غيري ملابسك — البكتيريا تتراكم على القماش' },
    ],
  },
  {
    emoji: '',
    title: 'حقيبة سفر الجمال',
    subtitle: 'أساسيات لا تنسينها',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '', text: 'عبوات صغيرة — أقل من 100 مل للطائرة' },
      { emoji: '️', text: 'واقي شمس — أهم منتج في أي سفر' },
      { emoji: '', text: 'منتجات متعددة — أحمر شفاه = بلاشر' },
      { emoji: '', text: 'مناديل ميسيلار — للتنظيف بدون ماء' },
    ],
  },
  {
    emoji: '',
    title: 'كبسولة الجمال',
    subtitle: 'الأقل هو الأكثر',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: '5 منتجات فقط — منظف مرطب واقي سيروم مقشر' },
      { emoji: '', text: '3 مستحضرات — BB كريم ماسكارا أحمر شفاه' },
      { emoji: '', text: 'منتج متعدد = مساحة أقل' },
      { emoji: '', text: 'كل 3 أشهر — راجعي منتجاتك وتخلصي من القديم' },
    ],
  },
  {
    emoji: '',
    title: 'طقوس النوم',
    subtitle: 'روتين الجمال قبل النوم',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'نظفي وجهك — مزدوج: زيت + غسول' },
      { emoji: '', text: 'سيروم ليلي — وقت الإصلاح أثناء النوم' },
      { emoji: '', text: 'تدليك 3 دقائق — يحفز الدورة الدموية' },
      { emoji: '', text: 'أطفئي الجوال — الضوء الأزرق يمنع الميلاتونين' },
    ],
  },
  {
    emoji: '',
    title: 'الكولاجين',
    subtitle: 'بروتين الشباب — بشرة مشدودة',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'كولاجين سائل — أسرع امتصاصاً' },
      { emoji: '', text: 'مع فيتامين C — ضروري للامتصاص' },
      { emoji: '', text: 'بعد 25 سنة — الإنتاج يبدأ بالانخفاض' },
      { emoji: '', text: 'يفيد البشرة الشعر الأظافر والمفاصل' },
    ],
  },
  {
    emoji: '',
    title: 'البيوتين',
    subtitle: 'فيتامين B7 — للشعر والأظافر',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '', text: 'يقوي الشعر — يقلل التساقط ويزيد الكثافة' },
      { emoji: '', text: 'يقوي الأظافر — يقلل التكسر والتقصف' },
      { emoji: '', text: 'موجود طبيعياً — بيض مكسرات أفوكادو' },
      { emoji: '️', text: '3-6 أشهر — لرؤية نتائج واضحة' },
    ],
  },
  {
    emoji: '',
    title: 'الجلوتاثيون',
    subtitle: 'ملك مضادات الأكسدة',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'يفتح البشرة — يقلل إنتاج الميلانين' },
      { emoji: '️', text: 'مضاد أكسدة قوي — يحمي من التلف' },
      { emoji: '', text: 'حقن أو كبسولات — تحت إشراف طبي' },
      { emoji: '', text: 'مصادر طبيعية — طماطم سبانخ ثوم' },
    ],
  },
  {
    emoji: '',
    title: 'أوميغا 3',
    subtitle: 'دهون صحية لبشرة جميلة',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '', text: 'يرطب البشرة — يقوي حاجز الدهون الطبيعي' },
      { emoji: '', text: 'يقلل الالتهابات — ممتاز للحبوب' },
      { emoji: '', text: 'سلمون تونة سردين — أو كبسولات' },
      { emoji: '', text: 'مصادر نباتية — جوز بذور كتان شيا' },
    ],
  },
  {
    emoji: '',
    title: 'البروبيوتيك',
    subtitle: 'بكتيريا نافعة — بشرة صافية',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'صحة الأمعاء = بشرة نقية — اتصال مباشر' },
      { emoji: '', text: 'يقلل الالتهابات — مفيد للحبوب والإكزيما' },
      { emoji: '', text: 'زبادي كفير مخللات — مصادر طبيعية' },
      { emoji: '', text: 'كبسولات بروبيوتيك — تركيز أعلى' },
    ],
  },
  {
    emoji: '',
    title: 'الشاي الأخضر',
    subtitle: 'مشروب الجمال اليومي',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '️', text: 'مضاد أكسدة قوي — يحمي البشرة' },
      { emoji: '', text: 'يقلل الالتهابات — للحبوب والاحمرار' },
      { emoji: '', text: '2-3 أكواب يومياً — بدون سكر' },
      { emoji: '', text: 'أكياس الشاي — للعيون المنتفخة' },
    ],
  },
  {
    emoji: '',
    title: 'الماتشا',
    subtitle: 'أقوى 10x من الشاي الأخضر',
    color: '#16a34a',
    bg: '#f0fdf4',
    tips: [
      { emoji: '', text: 'مركز — مضادات أكسدة أكثر' },
      { emoji: '', text: 'كلوروفيل — ينقي البشرة من الداخل' },
      { emoji: '', text: 'L-Theanine — استرخاء بدون نعاس' },
      { emoji: '', text: 'مع الحليب — لاتيه ماتشا لذيذ' },
    ],
  },
  {
    emoji: '',
    title: 'لاتيه الكركم',
    subtitle: 'الحليب الذهبي للبشرة',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'كركمين — أقوى مضاد التهاب طبيعي' },
      { emoji: '', text: 'يهدئ البشرة — للحبوب والوردية' },
      { emoji: '', text: 'حليب + كركم + فلفل أسود + عسل' },
      { emoji: '', text: 'قبل النوم — يهدئ ويساعد على الاسترخاء' },
    ],
  },
  {
    emoji: '',
    title: 'الكلوروفيل',
    subtitle: 'دم النبات — لبشرة نقية',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'ينقي البشرة — يقلل الحبوب' },
      { emoji: '🩸', text: 'يشبه الهيموجلوبين — ينقي الدم' },
      { emoji: '', text: '15 قطرة في كوب ماء — صباحاً' },
      { emoji: '', text: 'طبيعي 100% — مستخلص من البرسيم' },
    ],
  },
  {
    emoji: '🫒',
    title: 'عصير الشمندر',
    subtitle: 'الإشراقة الوردية من الداخل',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '', text: 'يحسن الدورة الدموية — بشرة وردية' },
      { emoji: '🩸', text: 'غني بالحديد — يحارب شحوب البشرة' },
      { emoji: '', text: 'فيتامين C — يحفز إنتاج الكولاجين' },
      { emoji: '', text: 'شمندر + برتقال + زنجبيل' },
    ],
  },
  {
    emoji: '',
    title: 'يوغا الوجه',
    subtitle: 'تمارين لشد الوجه طبيعياً',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'تمرين O —— افتحي فمكِ 5 ثوانٍ' },
      { emoji: '', text: 'تمرين القبلة —— مدي شفاهكِ للأمام' },
      { emoji: '', text: 'رفع الخدود —— ابتسمي بدون عيون' },
      { emoji: '️', text: '5 دقائق يومياً — نتائج 4-6 أسابيع' },
    ],
  },
  {
    emoji: '🩰',
    title: 'تمارين الباري',
    subtitle: 'رشاقة راقصة الباليه',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '', text: 'ينحت الساقين — تمارين صغيرة ومركزة' },
      { emoji: '', text: 'يحسن الوقفة — ظهر مستقيم' },
      { emoji: '', text: 'يقوي العضلات الصغيرة — جسم مشدود' },
      { emoji: '', text: 'مناسب لكل الأعمار — بدون قفز' },
    ],
  },
  {
    emoji: '',
    title: 'مكياج مقاوم للعرق',
    subtitle: 'إطلالة ثابتة أثناء التمرين',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '', text: 'برايمر مات — أساس المكياج الرياضي' },
      { emoji: '', text: 'تينت شفاه وخدود — بدل الكريمي' },
      { emoji: '️', text: 'ماسكارا مقاومة للماء — ضرورية' },
      { emoji: '', text: 'ورق نشاف — للمسة بعد التمرين' },
    ],
  },
  {
    emoji: '',
    title: 'شعر ما بعد الرياضة',
    subtitle: 'شعر منتعش بدون غسيل يومي',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '', text: 'شامبو جاف — قبل التمرين لامتصاص العرق' },
      { emoji: '', text: 'كعكة عالية — تمنع التعرق على الرقبة' },
      { emoji: '', text: 'بلسم يترك — بعد التمرين' },
      { emoji: '', text: 'لا تغسلي يومياً — 2-3 مرات أسبوعياً' },
    ],
  },
  {
    emoji: '',
    title: 'إشراقة الرياضة',
    subtitle: 'توهج طبيعي بعد التمرين',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🩸', text: 'الرياضة تحسن الدورة — بشرة وردية' },
      { emoji: '', text: 'العرق ينظف المسام — بشرة أنقى' },
      { emoji: '', text: 'نظفي وجهك بعد التمرين — 10 دقائق' },
      { emoji: '', text: 'اشربي ماء — الرياضة تجفف الجسم' },
    ],
  },
  {
    emoji: '',
    title: 'وضعية النوم',
    subtitle: 'كيف تنامين لجمال بشرتكِ',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '️', text: 'على الظهر — الأفضل للبشرة والرقبة' },
      { emoji: '🫂', text: 'على الجانب — يسبب تجاعيد الوجه' },
      { emoji: '', text: 'على البطن — الأسوأ للرقبة والظهر' },
      { emoji: '', text: 'وسادة حرير — تقلل احتكاك البشرة' },
    ],
  },
  {
    emoji: '',
    title: 'روتين ما قبل النوم',
    subtitle: '30 دقيقة — لبشرة أجمل صباحاً',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '', text: 'نظفي وجهك — إزالة المكياج بالكامل' },
      { emoji: '', text: 'سيروم + مرطب ليلي — تجدد البشرة' },
      { emoji: '', text: 'أطفئي الجوال — 30 دقيقة قبل النوم' },
      { emoji: '️', text: 'أجواء هادئة — شمعة كتاب تأمل' },
    ],
  },
];

export default function WellnessScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.wellness.title')}</Text>
      <Text style={s.sub}>{t('mobile.wellness.subtitle')}</Text>
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

const s = StyleSheet.create({
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
