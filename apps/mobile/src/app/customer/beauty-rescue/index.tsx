import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const EMERGENCIES = [
  {key:'pimple',emoji:'🔴',name:'بثرة طارئة',desc:'ظهور بثرة قبل مناسبة',price:50,time:'30 دقيقة',tips:['علاج موضعي سريع','تغطية احترافية','نصيحة وقائية']},
  {key:'smudge',emoji:'💄',name:'مكياج متلطخ',desc:'تلطخ المكياج فجأة',price:40,time:'20 دقيقة',tips:['إصلاح سريع','لمسات نهائية','تثبيت المكياج']},
  {key:'hair',emoji:'💇‍♀️',name:'شعر طارئ',desc:'تسريحة تفسد فجأة',price:60,time:'30 دقيقة',tips:['إعادة تصفيف سريع','تثبيت','لمسات نهائية']},
  {key:'nail',emoji:'💅',name:'ظفر مكسور',desc:'كسر ظفر قبل مناسبة',price:35,time:'15 دقيقة',tips:['إصلاح سريع','تطبيق لون مطابق','تقوية']},
  {key:'dry',emoji:'🏜️',name:'بشرة جافة',desc:'جفاف مفاجئ للبشرة',price:45,time:'25 دقيقة',tips:['ترطيب طارئ','قناع سريع','تجهيز للمكياج']},
  {key:'redness',emoji:'🔴',name:'احمرار البشرة',desc:'احمرار أو تهيج مفاجئ',price:55,time:'30 دقيقة',tips:['تهدئة فورية','قناع مهدئ','تغطية خفيفة']},
];

export default function BeautyRescueScreen(): JSX.Element {
  const [selected, setSelected] = useState<string|null>(null);
  const [booked, setBooked] = useState(false);

  const emergency = EMERGENCIES.find(e=>e.key===selected);

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🚨 إنقاذ الجمال</Text>
      <Text style={styles.sub}>خدمات تجميل طارئة — نصل لكِ خلال ساعة</Text>

      {booked && emergency?(
        <View style={styles.confirmed}>
          <Text style={styles.cfEmoji}>🚗</Text>
          <Text style={styles.cfTitle}>تم الطلب!</Text>
          <Text style={styles.cfText}>خبيرة التجميل في الطريق — تصل خلال {emergency.time}</Text>
          <Text style={styles.cfPrice}>{(emergency.price*1.5).toLocaleString()} ر.س (شامل رسوم الطوارئ)</Text>
          <TouchableOpacity onPress={()=>{setBooked(false);setSelected(null);}} style={styles.cfBtn}><Text style={styles.cfBt}>تم</Text></TouchableOpacity>
        </View>
      ):(
        <>
          <View style={styles.grid}>
            {EMERGENCIES.map(e=>(<TouchableOpacity key={e.key} onPress={()=>setSelected(e.key)} style={[styles.card,selected===e.key&&styles.cardActive]}><Text style={styles.ce}>{e.emoji}</Text><Text style={styles.cn}>{e.name}</Text><Text style={styles.cd}>{e.desc}</Text><Text style={styles.cp}>{e.price} ر.س · {e.time}</Text></TouchableOpacity>))}
          </View>

          {emergency&&(<View style={styles.detail}>
            <Text style={styles.dt}>{emergency.emoji} {emergency.name}</Text>
            <Text style={styles.dsub}>العلاج يشمل:</Text>
            {emergency.tips.map((t,i)=>(<View key={i} style={styles.dr}><Text style={styles.db}>✓</Text><Text style={styles.dx}>{t}</Text></View>))}
            <View style={styles.dp}><Text style={styles.dpl}>السعر العادي: {emergency.price} ر.س</Text><Text style={styles.dpe}>السعر الطارئ: {(emergency.price*1.5).toLocaleString()} ر.س</Text></View>
            <TouchableOpacity onPress={()=>setBooked(true)} style={styles.btn}><Text style={styles.bt}>🚨 احجزي الآن — نصل خلال {emergency.time}</Text></TouchableOpacity>
          </View>)}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#fef2f2'},i:{padding:16,paddingTop:30,paddingBottom:40},
  t:{fontSize:24,fontWeight:'800',color:'#dc2626',textAlign:'center',marginBottom:4},
  sub:{fontSize:13,color:'#9ca3af',textAlign:'center',marginBottom:20},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  card:{width:'47%',backgroundColor:'#fff',borderRadius:14,padding:14,borderWidth:2,borderColor:'#e5e7eb'},
  cardActive:{borderColor:'#dc2626',backgroundColor:'#fef2f2'},
  ce:{fontSize:36},cn:{fontSize:14,fontWeight:'700',color:'#111827',marginTop:4},cd:{fontSize:11,color:'#6b7280',marginTop:2},cp:{fontSize:12,fontWeight:'600',color:'#dc2626',marginTop:6},
  detail:{backgroundColor:'#fff',borderRadius:16,padding:16,marginTop:16,borderWidth:2,borderColor:'#fca5a5'},
  dt:{fontSize:18,fontWeight:'700',color:'#111827',marginBottom:4},dsub:{fontSize:13,color:'#6b7280',marginBottom:8},
  dr:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:4},db:{fontSize:14,color:'#059669'},dx:{fontSize:13,color:'#374151'},
  dp:{flexDirection:'row',justifyContent:'space-between',marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#e5e7eb'},
  dpl:{fontSize:13,color:'#9ca3af',textDecorationLine:'line-through'},dpe:{fontSize:15,fontWeight:'800',color:'#dc2626'},
  btn:{backgroundColor:'#dc2626',borderRadius:14,padding:16,alignItems:'center',marginTop:12},bt:{color:'#fff',fontSize:14,fontWeight:'700'},
  confirmed:{backgroundColor:'#fff',borderRadius:20,padding:24,alignItems:'center',borderWidth:2,borderColor:'#86efac'},
  cfEmoji:{fontSize:64},cfTitle:{fontSize:20,fontWeight:'800',color:'#059669',marginTop:8},cfText:{fontSize:14,color:'#6b7280',marginTop:4,textAlign:'center'},
  cfPrice:{fontSize:18,fontWeight:'700',color:'#dc2626',marginTop:8},cfBtn:{backgroundColor:'#f3f4f6',borderRadius:12,paddingHorizontal:24,paddingVertical:12,marginTop:16},cfBt:{fontSize:14,fontWeight:'600',color:'#6b7280'},
});
