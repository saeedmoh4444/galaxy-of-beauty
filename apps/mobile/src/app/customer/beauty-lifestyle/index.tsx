import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Tip { emoji: string; text: string; }
interface Card { emoji: string; title: string; subtitle: string; color: string; bg: string; tips: Tip[]; }

const CARDS: Card[] = [
  { emoji: '🏆', title: 'مكافآت الجمال', subtitle: '1250 نقطة — المستوى الذهبي', color: '#d97706', bg: '#fffbeb', tips: [{ emoji: '⭐', text: '1250 نقطة — قابلة للاستبدال' },{ emoji: '🥇', text: 'المستوى: ذهبي — خصم 15%' },{ emoji: '🎁', text: 'الهدية القادمة: قناع وجه مجاني' },{ emoji: '📅', text: 'تنتهي النقاط بعد 12 شهراً' }] },
  { emoji: '💎', title: 'الاشتراك المميز', subtitle: 'باقة Premium الشهرية', color: '#7c3aed', bg: '#f5f3ff', tips: [{ emoji: '💇', text: 'خصم 20% على جميع الخدمات' },{ emoji: '🎫', text: 'حجز أولوية — قبل 48 ساعة' },{ emoji: '🎁', text: 'هدية شهرية — منتج تجميل' },{ emoji: '⭐', text: 'نقاط مضاعفة — x2 على كل ريال' }] },
  { emoji: '📉', title: 'تنبيهات الأسعار', subtitle: 'انخفاض في الأسعار', color: '#e11d48', bg: '#fff1f2', tips: [{ emoji: '💅', text: 'مانيكير سبا — من 150 إلى 99 ر.س' },{ emoji: '💄', text: 'مكياج كامل — من 350 إلى 299 ر.س' },{ emoji: '🔔', text: 'فعّلي التنبيهات — لتلقي العروض' },{ emoji: '⏰', text: 'العروض تنتهي خلال 48 ساعة' }] },
  { emoji: '🎯', title: 'محطات الادخار', subtitle: '1500 ر.س مدخرة', color: '#059669', bg: '#ecfdf5', tips: [{ emoji: '✅', text: '500 ر.س — تم التحقيق 🎉' },{ emoji: '✅', text: '1000 ر.س — تم التحقيق 🎉' },{ emoji: '🎯', text: '2000 ر.س — الهدف القادم' },{ emoji: '🏆', text: '5000 ر.س — الهدف النهائي' }] },
  { emoji: '📊', title: 'مخطط الميزانية', subtitle: 'تتبعي إنفاقك على الجمال', color: '#0284c7', bg: '#f0f9ff', tips: [{ emoji: '💰', text: 'الميزانية الشهرية: 500 ر.س' },{ emoji: '📊', text: 'المصروف هذا الشهر: 320 ر.س' },{ emoji: '✅', text: 'المتبقي: 180 ر.س' },{ emoji: '💡', text: 'نصيحة: وفرّي 20% للطوارئ' }] },
  { emoji: '🎁', title: 'قسيمة الجمال', subtitle: 'خصم 50 ر.س على خدمتك القادمة', color: '#db2777', bg: '#fdf2f8', tips: [{ emoji: '🎫', text: 'الكود: BEAUTY50 — صالح لمرة واحدة' },{ emoji: '📅', text: 'ينتهي: 30 سبتمبر 2026' },{ emoji: '💇', text: 'لجميع الخدمات فوق 200 ر.س' },{ emoji: '⚠️', text: 'لا يدمج مع عروض أخرى' }] },
];

export default function BeautyLifestyleScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>💎 نمط حياة الجمال</Text>
      <Text style={s.sub}>مكافآت، توفير، واشتراكات</Text>
      <View style={s.grid}>{CARDS.map((c,i)=>(<View key={i} style={[s.card,{borderColor:c.color+'30'}]}><View style={s.ch}><Text style={s.ce}>{c.emoji}</Text><View style={s.cw}><Text style={[s.ct,{color:c.color}]}>{c.title}</Text><Text style={s.cs}>{c.subtitle}</Text></View></View><View style={s.tl}>{c.tips.map((t,j)=>(<View key={j} style={[s.tr,{backgroundColor:c.bg}]}><Text style={s.te}>{t.emoji}</Text><Text style={[s.tt,{color:c.color}]}>{t.text}</Text></View>))}</View></View>))}</View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c:{flex:1,backgroundColor:'#fffbeb'}, i:{padding:16,paddingTop:40,paddingBottom:60},
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
