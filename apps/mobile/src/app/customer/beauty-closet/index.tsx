import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { trpc as trpcReact } from '@/lib/trpc-react';
import { useState, useEffect, useCallback } from 'react';

const CATS = ['💄 مكياج','🧴 عناية','💇‍♀️ شعر','💅 أظافر','🌿 طبيعي'];

export default function BeautyClosetScreen(): JSX.Element {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string|null>(null);
  const loyalty = (trpcReact as any).loyalty?.getAccount?.useQuery?.();

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).restockReminder.list.query() as any).then((d:any)=>{setProducts(d||[]);setLoading(false);setRefreshing(false);}).catch(()=>{setLoading(false);setRefreshing(false);});
  },[]);
  useEffect(()=>{fetch();},[fetch]);

  if(loading) return (<ScrollView style={styles.c} contentContainerStyle={styles.i}><Text style={styles.t}>👗 خزانة الجمال</Text></ScrollView>);

  const filtered = filter ? products.filter((p:any)=>(p.category as string)===filter) : products;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>fetch(true)} colors={['#8b5cf6']}/>}>
      <Text style={styles.t}>👗 خزانة الجمال</Text>
      <Text style={styles.sub}>منتجاتكِ ومستحضراتكِ الشخصية</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}}>
        <View style={{flexDirection:'row',gap:8}}>
          <TouchableOpacity onPress={()=>setFilter(null)} style={[styles.fc,!filter&&styles.fca]}><Text style={[styles.ft,!filter&&styles.fta]}>الكل</Text></TouchableOpacity>
          {CATS.map(c=>(<TouchableOpacity key={c} onPress={()=>setFilter(c)} style={[styles.fc,filter===c&&styles.fca]}><Text style={[styles.ft,filter===c&&styles.fta]}>{c}</Text></TouchableOpacity>))}
        </View>
      </ScrollView>

      {filtered.length===0?<Text style={styles.e}>👗 أضيفي منتجاتكِ الأولى!</Text>:
        <View style={styles.grid}>{filtered.map((p:any,i:number)=>(
          <View key={i} style={styles.card}>
            <Text style={styles.pe}>{p.emoji as string??'🧴'}</Text>
            <Text style={styles.pn}>{p.productName as string}</Text>
            {p.openDate&&<Text style={styles.pd}>فتح: {new Date(p.openDate as string).toLocaleDateString('ar-SA')}</Text>}
            <View style={styles.pu}><View style={[styles.puf,{width:'60%'}]}/></View>
            <Text style={styles.pm}>متبقي ~60%</Text>
          </View>
        ))}</View>}

      <TouchableOpacity style={styles.addBtn}><Text style={styles.addBt}>+ إضافة منتج جديد</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#faf5ff'},i:{padding:16,paddingTop:30,paddingBottom:40},
  t:{fontSize:24,fontWeight:'800',color:'#7c3aed',textAlign:'center',marginBottom:4},
  sub:{fontSize:13,color:'#9ca3af',textAlign:'center',marginBottom:16},
  e:{fontSize:14,color:'#9ca3af',textAlign:'center',marginTop:40},
  fc:{paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:'#fff',borderWidth:1,borderColor:'#e5e7eb'},
  fca:{backgroundColor:'#7c3aed',borderColor:'#7c3aed'},ft:{fontSize:12,fontWeight:'600',color:'#6b7280'},fta:{color:'#fff'},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  card:{width:'47%',backgroundColor:'#fff',borderRadius:14,padding:14,alignItems:'center'},
  pe:{fontSize:36},pn:{fontSize:13,fontWeight:'600',color:'#111827',marginTop:6,textAlign:'center'},pd:{fontSize:10,color:'#9ca3af',marginTop:2},
  pu:{height:4,backgroundColor:'#f3f4f6',borderRadius:2,width:'100%',marginTop:8},puf:{height:4,backgroundColor:'#7c3aed',borderRadius:2},pm:{fontSize:10,color:'#6b7280',marginTop:2},
  addBtn:{backgroundColor:'#7c3aed',borderRadius:14,padding:16,alignItems:'center',marginTop:20},addBt:{color:'#fff',fontSize:14,fontWeight:'700'},
});
