import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }
interface Card { emoji: string; title: string; subtitle: string; color: string; bg: string; tips: Tip[]; }

const CARDS: Card[] = [
  { emoji:'🌸',title:'مراحل الحياة',subtitle:'28 سنة — لكل مرحلة جمالها',color:'#db2777',bg:'#fdf2f8',tips:[{emoji:'📅',text:'العمر: 28 سنة — مرحلة الشباب'},{emoji:'✨',text:'التركيز: وقاية وترطيب وروتين ثابت'},{emoji:'🎯',text:'النصيحة: ابدئي بالريتينول تدريجياً'},{emoji:'🧴',text:'أساسيات: واقي شمس، مرطب، سيروم فيتامين سي'}]},
  { emoji:'👰',title:'رحلة العروس',subtitle:'الزفاف: 15 يونيو 2027',color:'#c026d3',bg:'#fdf4ff',tips:[{emoji:'✅',text:'قبل 6 أشهر: بدء روتين العناية — تم ✓'},{emoji:'✅',text:'قبل 5 أشهر: علاجات البشرة — تم ✓'},{emoji:'🎯',text:'قبل 4 أشهر: تجربة المكياج — قادم'},{emoji:'📅',text:'قبل 3 أشهر: جلسة شعر تجريبية — قادم'}]},
  { emoji:'👑',title:'الجمال الذهبي',subtitle:'للمرأة فوق 50',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'💆',text:'تركيز على الترطيب العميق والتغذية'},{emoji:'🧴',text:'منتجات غنية بالسيراميد والببتيدات'},{emoji:'✨',text:'تقشير لطيف — مرة أسبوعياً'},{emoji:'💖',text:'الجمال الحقيقي — الثقة والراحة'}]},
  { emoji:'💼',title:'جمال المهنة',subtitle:'للمرأة العاملة',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'⏰',text:'روتين سريع — 10 دقائق صباحاً'},{emoji:'💄',text:'مكياج عملي — BB كريم + ماسكارا + بلسم'},{emoji:'🧴',text:'سبراي مرطب — للانتعاش طوال اليوم'},{emoji:'📅',text:'جلسة أسبوعية — للعناية المركزة'}]},
  { emoji:'🤰',title:'عناية ما بعد الولادة',subtitle:'للأم الجديدة',color:'#0d9488',bg:'#f0fdfa',tips:[{emoji:'💆',text:'مساج استرخاء — يخفف التوتر'},{emoji:'🧖',text:'عناية بالبشرة — للتغيرات الهرمونية'},{emoji:'⏰',text:'جلسات قصيرة — 45 دقيقة'},{emoji:'🏠',text:'خدمة منزلية — لراحة الأم'}]},
  { emoji:'👩‍🎓',title:'دليل بشرة المراهقات',subtitle:'12-18 سنة',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🧴',text:'أساسيات: غسول لطيف + مرطب + واقي شمس'},{emoji:'🚫',text:'تجنبي: المنتجات القاسية والمقشرات'},{emoji:'💡',text:'نصيحة: الأقل هو الأكثر'},{emoji:'👩',text:'دائماً: استشيري مختصة قبل أي علاج'}]},
  { emoji:'🌱',title:'العناية في العشرينات',subtitle:'أساس قوي لمستقبل بشرتك',color:'#0284c7',bg:'#f0f9ff',tips:[{emoji:'☀️',text:'واقي شمس يومي — أهم استثمار لبشرتك'},{emoji:'🧴',text:'روتين أساسي — منظف مرطب واقي شمس'},{emoji:'✨',text:'فيتامين C — ابدئي مبكراً'},{emoji:'🚫',text:'لا ريبتينول بعد — بشرتك تنتجه طبيعياً'}]},
  { emoji:'🌸',title:'العناية في الثلاثينات',subtitle:'وقاية وعلاج — بشرة متوازنة',color:'#7c3aed',bg:'#f5f3ff',tips:[{emoji:'⏳',text:'ابدئي الريتينول — الكولاجين ينخفض'},{emoji:'👁️',text:'كريم عيون — أولى الخطوط الرفيعة'},{emoji:'🧖',text:'تقشير منتظم — مرة أسبوعياً AHA/BHA'},{emoji:'💧',text:'سيروم هيالورونيك — ترطيب مكثف'}]},
  { emoji:'🌹',title:'العناية في الأربعينات',subtitle:'تجديد وتقوية — بشرة ناضجة',color:'#e11d48',bg:'#fff1f2',tips:[{emoji:'🧬',text:'ببتيدات — تحفز الكولاجين وتشد البشرة'},{emoji:'🛡️',text:'سيراميد — يقوي حاجز البشرة'},{emoji:'💆',text:'مساج وجه — يحسن الدورة ويرفع البشرة'},{emoji:'🔬',text:'علاجات احترافية — ميكرونيدلنغ أو ليزر'}]},
  { emoji:'👑',title:'العناية في الخمسينات',subtitle:'جمال ناضج — عناية فاخرة',color:'#d97706',bg:'#fffbeb',tips:[{emoji:'💧',text:'زيوت غنية — سكوالين أرغان ثمر الورد'},{emoji:'🧴',text:'مرطبات كثيفة — كريمات وليس جل'},{emoji:'🩺',text:'فحوصات هرمونية — الجمال بعد انقطاع الطمث'},{emoji:'✨',text:'الجمال الحقيقي — الثقة والعناية الذاتية'}]},
  { emoji:'💎',title:'العناية في الستينات',subtitle:'بشرة جميلة في كل عمر',color:'#059669',bg:'#ecfdf5',tips:[{emoji:'🧴',text:'ترطيب مكثف — كريمات غنية بالسيراميد'},{emoji:'💆',text:'مساج دوري — يحسن مرونة البشرة'},{emoji:'☀️',text:'حماية دائمة — البشرة الرقيقة تحتاج عناية'},{emoji:'❤️',text:'الجمال من الداخل — تغذية نوم سعادة'}]},
];

export default function LifeEventsScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>🌸 مراحل الحياة</Text>
      <Text style={s.sub}>لكل مرحلة عمرية جمالها الخاص</Text>
      <View style={s.grid}>{CARDS.map((c,i)=>(<View key={i} style={[s.card,{borderColor:c.color+'30'}]}><View style={s.ch}><Text style={s.ce}>{c.emoji}</Text><View style={s.cw}><Text style={[s.ct,{color:c.color}]}>{c.title}</Text><Text style={s.cs}>{c.subtitle}</Text></View></View><View style={s.tl}>{c.tips.map((t,j)=>(<View key={j} style={[s.tr,{backgroundColor:c.bg}]}><Text style={s.te}>{t.emoji}</Text><Text style={[s.tt,{color:c.color}]}>{t.text}</Text></View>))}</View></View>))}</View>
    </ScrollView>
  );
}

const s=StyleSheet.create({c:{flex:1,backgroundColor:'#fdf2f8'},i:{padding:16,paddingTop:40,paddingBottom:60},h:{fontSize:24,fontWeight:'800',color:'#111827',textAlign:'center',marginBottom:6},sub:{fontSize:13,color:'#6b7280',textAlign:'center',marginBottom:24,lineHeight:22},grid:{gap:12},card:{backgroundColor:'#fff',borderRadius:16,borderWidth:1,padding:16,marginBottom:4},ch:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:12},ce:{fontSize:28},cw:{flex:1},ct:{fontSize:15,fontWeight:'700'},cs:{fontSize:11,color:'#9ca3af',marginTop:2},tl:{gap:6},tr:{flexDirection:'row',alignItems:'center',gap:8,borderRadius:10,paddingHorizontal:12,paddingVertical:10},te:{fontSize:14,width:20,textAlign:'center'},tt:{fontSize:12,fontWeight:'500',flex:1,textAlign:'right'}});
