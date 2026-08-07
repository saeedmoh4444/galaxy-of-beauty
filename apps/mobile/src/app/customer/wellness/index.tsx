import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }
interface Card { emoji: string; title: string; subtitle: string; color: string; bg: string; tips: Tip[]; }

const CARDS: Card[] = [
  { emoji: '😴', title: 'نوم الجمال', subtitle: '8 ساعات — سر الجمال الحقيقي', color: '#7c3aed', bg: '#f5f3ff', tips: [{ emoji: '🌙', text: 'نامي قبل 11 مساءً — هرمون النمو يعمل ليلاً' },{ emoji: '📱', text: 'أطفئي الجوال قبل النوم بـ 30 دقيقة' },{ emoji: '🛏️', text: 'غرفة مظلمة وباردة — 18-20 درجة' },{ emoji: '⏰', text: 'نفس موعد النوم يومياً — حتى الإجازة' }] },
  { emoji: '💧', title: 'شرب الماء', subtitle: '8 أكواب يومياً لجمالك', color: '#0284c7', bg: '#f0f9ff', tips: [{ emoji: '☀️', text: 'كوبان عند الاستيقاظ — ينشط الجسم' },{ emoji: '🍋', text: 'أضيفي ليمون أو نعناع — طعم منعش' },{ emoji: '📱', text: 'تطبيق تذكير — يساعدك على التتبع' },{ emoji: '💧', text: 'قبل كل وجبة — كوب ماء' }] },
  { emoji: '🥗', title: 'تغذية الجمال', subtitle: 'ما تأكلينه يظهر على بشرتك', color: '#059669', bg: '#ecfdf5', tips: [{ emoji: '🥑', text: 'دهون صحية — أفوكادو مكسرات زيت زيتون' },{ emoji: '🍓', text: 'مضادات أكسدة — توت فراولة رمان' },{ emoji: '🐟', text: 'أوميغا 3 — سلمون تونة' },{ emoji: '🥬', text: 'خضار ورقية — سبانخ كيل جرير' }] },
  { emoji: '🏃', title: 'رياضة الجمال', subtitle: 'حركة = بشرة متوهجة', color: '#ea580c', bg: '#fff7ed', tips: [{ emoji: '🚶', text: '30 دقيقة مشي يومياً — الحد الأدنى' },{ emoji: '🧘', text: 'يوغا — مرونة وهدوء' },{ emoji: '💪', text: 'تمارين مقاومة — مرتين أسبوعياً' },{ emoji: '🤸', text: 'بيلاتس — جسم مشدود' }] },
  { emoji: '🧘', title: 'تأمل واسترخاء', subtitle: '5 دقائق يومياً', color: '#0d9488', bg: '#f0fdfa', tips: [{ emoji: '🫁', text: 'تنفس عميق — شهيق 4 عدات زفير 6' },{ emoji: '☀️', text: 'صباحاً — 5 دقائق قبل بدء اليوم' },{ emoji: '📵', text: 'بدون جوال — مكان هادئ' },{ emoji: '🎵', text: 'موسيقى هادئة أو أصوات طبيعة' }] },
  { emoji: '😊', title: 'ابتسامة وثقة', subtitle: 'جمالك من الداخل', color: '#db2777', bg: '#fdf2f8', tips: [{ emoji: '🪞', text: 'قفي أمام المرآة — قولي شيئاً إيجابياً' },{ emoji: '✍️', text: 'اكتبي 3 أشياء ممتنة لها يومياً' },{ emoji: '👯', text: 'أحطي نفسك بأشخاص إيجابيين' },{ emoji: '🎯', text: 'حددي أهدافاً صغيرة واحتفلي بها' }] },
  { emoji: '☀️', title: 'واقي الشمس', subtitle: 'يومياً — حتى في البيت', color: '#d97706', bg: '#fffbeb', tips: [{ emoji: '🧴', text: 'SPF 50+ — للوجه والرقبة واليدين' },{ emoji: '⏰', text: 'جددي كل ساعتين تحت الشمس' },{ emoji: '🏠', text: 'حتى في البيت — الأشعة تخترق الزجاج' },{ emoji: '📅', text: '365 يوم — صيفاً وشتاءً' }] },
  { emoji: '📏', title: 'وقفة الجمال', subtitle: 'ظهر مستقيم = ثقة', color: '#4f46e5', bg: '#eef2ff', tips: [{ emoji: '🧍', text: 'أكتاف للخلف — ذقن موازي للأرض' },{ emoji: '🪑', text: 'لا تجلسي طويلاً — قومي كل 30 دقيقة' },{ emoji: '📱', text: 'ارفعي الجوال لمستوى العين' },{ emoji: '💆', text: 'مساج رقبة — يخفف التوتر' }] },
];

export default function WellnessScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>🌿 الصحة والعافية</Text>
      <Text style={s.sub}>جمالكِ يبدأ من صحتكِ</Text>
      <View style={s.grid}>{CARDS.map((c,i)=>(<View key={i} style={[s.card,{borderColor:c.color+'30'}]}><View style={s.ch}><Text style={s.ce}>{c.emoji}</Text><View style={s.cw}><Text style={[s.ct,{color:c.color}]}>{c.title}</Text><Text style={s.cs}>{c.subtitle}</Text></View></View><View style={s.tl}>{c.tips.map((t,j)=>(<View key={j} style={[s.tr,{backgroundColor:c.bg}]}><Text style={s.te}>{t.emoji}</Text><Text style={[s.tt,{color:c.color}]}>{t.text}</Text></View>))}</View></View>))}</View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c:{flex:1,backgroundColor:'#f5f3ff'}, i:{padding:16,paddingTop:40,paddingBottom:60},
  h:{fontSize:24,fontWeight:'800',color:'#111827',textAlign:'center',marginBottom:6},
  sub:{fontSize:13,color:'#6b7280',textAlign:'center',marginBottom:24,lineHeight:22},
  grid:{gap:12},
  card:{backgroundColor:'#fff',borderRadius:16,borderWidth:1,padding:16,marginBottom:4},
  ch:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12},
  ce:{fontSize:28}, cw:{flex:1},
  ct:{fontSize:15,fontWeight:'700'}, cs:{fontSize:11,color:'#9ca3af',marginTop:2},
  tl:{gap:6}, tr:{flexDirection:'row',alignItems:'center',gap:8,borderRadius:10,paddingHorizontal:12,paddingVertical:10},
  te:{fontSize:14,width:20,textAlign:'center'}, tt:{fontSize:12,fontWeight:'500',flex:1,textAlign:'right'},
});
