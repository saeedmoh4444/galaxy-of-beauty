import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

const OCCASIONS = [
  {key:'birthday',emoji:'🎂',name:'عيد ميلاد'},
  {key:'eid',emoji:'🌙',name:'العيد'},
  {key:'wedding',emoji:'👰',name:'زفاف'},
  {key:'graduation',emoji:'🎓',name:'تخرج'},
  {key:'valentine',emoji:'💝',name:'عيد الحب'},
  {key:'mothersday',emoji:'🌸',name:'عيد الأم'},
];

export default function BeautyWishlistGiftsScreen(): JSX.Element {
  const [, setItems] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState('birthday');
  const [shareMode, setShareMode] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).wishlist.list.query() as any).then((d:any)=>{setItems(d?.items||[]);setLoading(false);setRefreshing(false);}).catch(()=>{setLoading(false);setRefreshing(false);});
  },[]);
  useEffect(()=>{fetch();},[fetch]);

  const occasion = OCCASIONS.find(o=>o.key===selectedOccasion)!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>fetch(true)} colors={['#ec4899']}/>}>
      <Text style={styles.t}>🎁 قائمة الهدايا</Text>
      <Text style={styles.sub}>شاركي قائمة أمنياتكِ مع الأصدقاء والعائلة</Text>

      <Text style={styles.st}>💝 المناسبة</Text>
      <View style={styles.occasions}>
        {OCCASIONS.map(o=>(<TouchableOpacity key={o.key} onPress={()=>setSelectedOccasion(o.key)} style={[styles.oc,selectedOccasion===o.key&&styles.oca]}><Text style={styles.oe}>{o.emoji}</Text><Text style={[styles.on,selectedOccasion===o.key&&styles.ona]}>{o.name}</Text></TouchableOpacity>))}
      </View>

      <View style={styles.shareCard}>
        <Text style={styles.shareTitle}>🔗 رابط المشاركة</Text>
        <View style={styles.shareRow}>
          <Text style={styles.shareLink}>galaxyofbeauty.sa/wishlist/sara-{occasion.key}</Text>
          <TouchableOpacity onPress={()=>setShareMode(!shareMode)} style={styles.shareBtn}><Text style={styles.shareBt}>{shareMode?'✅ تم النسخ':'📋 نسخ'}</Text></TouchableOpacity>
        </View>
      </View>

      <Text style={styles.st}>🎁 أمنياتي ({occasion.emoji} {occasion.name})</Text>
      <View style={styles.gifts}>
        {[
          {emoji:'💆‍♀️',name:'جلسة مساج سويدي',price:350,priority:'أولوية'},
          {emoji:'💅',name:'مانيكير جل',price:180,priority:'مهم'},
          {emoji:'🧖‍♀️',name:'جلسة عناية بالبشرة',price:250,priority:'جميل'},
          {emoji:'💇‍♀️',name:'تصفيف شعر',price:200,priority:'جميل'},
        ].map((g,i)=>(<View key={i} style={styles.gift}>
          <Text style={styles.ge}>{g.emoji}</Text>
          <View style={{flex:1}}><Text style={styles.gn}>{g.name}</Text><Text style={styles.gp}>{g.price.toLocaleString()} ر.س</Text></View>
          <View style={[styles.gpr,{backgroundColor:g.priority==='أولوية'?'#fee2e2':g.priority==='مهم'?'#fef3c7':'#f3f4f6'}]}><Text style={styles.gpt}>{g.priority}</Text></View>
        </View>))}
      </View>

      <TouchableOpacity style={styles.btn}><Text style={styles.bt}>+ إضافة أمنية</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#fdf2f8'},i:{padding:16,paddingTop:30,paddingBottom:40},
  t:{fontSize:24,fontWeight:'800',color:'#db2777',textAlign:'center',marginBottom:4},
  sub:{fontSize:13,color:'#9ca3af',textAlign:'center',marginBottom:20},
  st:{fontSize:16,fontWeight:'700',color:'#111827',marginBottom:10,marginTop:8},
  occasions:{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:16},
  oc:{backgroundColor:'#fff',borderRadius:20,paddingHorizontal:14,paddingVertical:8,alignItems:'center',borderWidth:1,borderColor:'#e5e7eb'},
  oca:{borderColor:'#db2777',backgroundColor:'#fdf2f8'},oe:{fontSize:16},on:{fontSize:11,fontWeight:'600',color:'#6b7280',marginTop:2},ona:{color:'#db2777'},
  shareCard:{backgroundColor:'#fff',borderRadius:14,padding:14,marginBottom:16,borderWidth:2,borderColor:'#fbcfe8'},
  shareTitle:{fontSize:14,fontWeight:'600',color:'#111827',marginBottom:8},
  shareRow:{flexDirection:'row',alignItems:'center',gap:8},shareLink:{flex:1,fontSize:11,color:'#db2777',fontFamily:'monospace'},shareBtn:{backgroundColor:'#db2777',borderRadius:8,paddingHorizontal:12,paddingVertical:6},shareBt:{color:'#fff',fontSize:11,fontWeight:'600'},
  gifts:{gap:8,marginBottom:16},gift:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'#fff',borderRadius:12,padding:12},ge:{fontSize:28},gn:{fontSize:14,fontWeight:'600',color:'#111827'},gp:{fontSize:12,color:'#6b7280',marginTop:2},
  gpr:{borderRadius:6,paddingHorizontal:8,paddingVertical:2},gpt:{fontSize:10,fontWeight:'700'},
  btn:{backgroundColor:'#db2777',borderRadius:14,padding:16,alignItems:'center'},bt:{color:'#fff',fontSize:14,fontWeight:'700'},
});
