import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }
interface Card { emoji: string; title: string; subtitle: string; color: string; bg: string; tips: Tip[]; }

const CARDS: Card[] = [
  { emoji:'💡',title:'نصيحة جمال',subtitle:'ضعي واقي الشمس كل ساعتين',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'☀️',text:'SPF 50+ — للوجه والرقبة واليدين'},{emoji:'⏰',text:'جدديه كل ساعتين — تحت الشمس المباشرة'},{emoji:'🏠',text:'حتى في البيت — الأشعة تخترق الزجاج'},{emoji:'📅',text:'365 يوم — صيفاً وشتاءً'}]},
  { emoji:'🚨',title:'طوارئ الجمال',subtitle:'مساعدة فورية — 24 ساعة',color:'#e11d48',bg:'#fff1f2',tips:[{emoji:'📞',text:'اتصلي: 9200 — خط الطوارئ'},{emoji:'⏰',text:'وصول خلال 30 دقيقة'},{emoji:'🏠',text:'خدمة منزلية — للطوارئ'},{emoji:'🩺',text:'استشارة طبية — عند الحاجة'}]},
  { emoji:'🏩',title:'مرافق الصالون',subtitle:'واي فاي — مواقف — قهوة',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'📶',text:'واي فاي مجاني — ابقي متصلة'},{emoji:'🅿️',text:'مواقف سيارات — مجانية'},{emoji:'☕',text:'ضيافة — قهوة وشاي'},{emoji:'👶',text:'ركن أطفال — العبي بأمان'}]},
  { emoji:'🕌',title:'غرفة الصلاة',subtitle:'سجادات — عباءات — قبلة',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🧎',text:'سجادات صلاة — نظيفة ومعطرة'},{emoji:'🧕',text:'عباءات — متوفرة للصلاة'},{emoji:'🕋',text:'اتجاه القبلة — محدد بوضوح'},{emoji:'💧',text:'مكان وضوء — مجهز بالكامل'}]},
  { emoji:'⚖️',title:'مقارنة المنتجات',subtitle:'كريم A vs كريم B',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'⭐',text:'كريم A: 120 ر.س — ترطيب 24 ساعة (4.5★)'},{emoji:'💰',text:'كريم B: 80 ر.س — خفيف وسريع (4.0★)'},{emoji:'🏆',text:'الأفضل: كريم A — ترطيب عميق'},{emoji:'💡',text:'الأوفر: كريم B — قيمة ممتازة'}]},
  { emoji:'💎',title:'الاشتراك المميز',subtitle:'باقة Premium — خصم 20%',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'💇',text:'خصم 20% على جميع الخدمات'},{emoji:'🎫',text:'حجز أولوية — قبل 48 ساعة'},{emoji:'🎁',text:'هدية شهرية — منتج تجميل'},{emoji:'⭐',text:'نقاط مضاعفة — x2 على كل ريال'}]},
];

export default function BeautyServicesScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>💅 خدمات الجمال</Text>
      <Text style={s.sub}>اكتشفي كل ما تحتاجينه</Text>
      <View style={s.grid}>{CARDS.map((c,i)=>(<View key={i} style={[s.card,{borderColor:c.color+'30'}]}><View style={s.ch}><Text style={s.ce}>{c.emoji}</Text><View style={s.cw}><Text style={[s.ct,{color:c.color}]}>{c.title}</Text><Text style={s.cs}>{c.subtitle}</Text></View></View><View style={s.tl}>{c.tips.map((t,j)=>(<View key={j} style={[s.tr,{backgroundColor:c.bg}]}><Text style={s.te}>{t.emoji}</Text><Text style={[s.tt,{color:c.color}]}>{t.text}</Text></View>))}</View></View>))}</View>
    </ScrollView>
  );
}

const s=StyleSheet.create({c:{flex:1,backgroundColor:'#f0fdfa'},i:{padding:16,paddingTop:40,paddingBottom:60},h:{fontSize:24,fontWeight:'800',color:'#111827',textAlign:'center',marginBottom:6},sub:{fontSize:13,color:'#6b7280',textAlign:'center',marginBottom:24,lineHeight:22},grid:{gap:12},card:{backgroundColor:'#fff',borderRadius:16,borderWidth:1,padding:16,marginBottom:4},ch:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12},ce:{fontSize:28},cw:{flex:1},ct:{fontSize:15,fontWeight:'700'},cs:{fontSize:11,color:'#9ca3af',marginTop:2},tl:{gap:6},tr:{flexDirection:'row',alignItems:'center',gap:8,borderRadius:10,paddingHorizontal:12,paddingVertical:10},te:{fontSize:14,width:20,textAlign:'center'},tt:{fontSize:12,fontWeight:'500',flex:1,textAlign:'right'}});
