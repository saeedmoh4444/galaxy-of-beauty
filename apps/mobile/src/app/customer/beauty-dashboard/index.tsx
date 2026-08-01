import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyDashboardScreen(): JSX.Element {
  const [loyalty, setLoyalty] = useState<any>(null);
  const [cashback, setCashback] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    Promise.all([((trpc as any).loyalty.status.query() as any).catch(()=>null),((trpc as any).cashback.info.query() as any).catch(()=>null),((trpc as any).bookings.list.query({ page: 1, limit: 3 }) as any).catch(()=>({bookings:[]}))])
      .then(([l,c,b]:any[]) => { setLoyalty(l); setCashback(c); setBookings(b?.bookings||[]); setLoading(false); setRefreshing(false); }).catch(()=>{setLoading(false);setRefreshing(false);});
  },[]);
  useEffect(()=>{fetch();},[fetch]);
  if(loading) return <SkeletonList count={3}/>;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>fetch(true)} colors={['#ec4899']}/>}>
      <Text style={styles.t}>👑 لوحة الجمال</Text>
      <View style={styles.kr}>
        <View style={[styles.k,{backgroundColor:'#fef3c7'}]}><Text style={styles.ke}>⭐</Text><Text style={styles.kv}>{loyalty?.points as number ?? 0}</Text><Text style={styles.kl}>نقاط</Text></View>
        <View style={[styles.k,{backgroundColor:'#dcfce7'}]}><Text style={styles.ke}>💰</Text><Text style={[styles.kv,{color:'#059669'}]}>{(cashback?.balance as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kl}>كاش باك</Text></View>
        <View style={[styles.k,{backgroundColor:'#dbeafe'}]}><Text style={styles.ke}>📅</Text><Text style={[styles.kv,{color:'#2563eb'}]}>{bookings.length}</Text><Text style={styles.kl}>قادم</Text></View>
      </View>
      {bookings.length > 0 && <Text style={styles.st}>📅 أقرب الحجوزات</Text>}
      {bookings.map((b:any)=>(<View key={b.id} style={styles.bc}><Text style={styles.bcd}>{b.bookingCode as string}</Text><Text style={styles.bdt}>{new Date(b.startAt as string).toLocaleDateString('ar-SA',{month:'short',day:'numeric'})}</Text></View>))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:'#fdf2f8'},i:{padding:16,paddingTop:30,paddingBottom:40},
  t:{fontSize:24,fontWeight:'800',color:'#db2777',textAlign:'center',marginBottom:20},
  kr:{flexDirection:'row',gap:8,marginBottom:16},
  k:{flex:1,borderRadius:16,padding:14,alignItems:'center'},
  ke:{fontSize:28,marginBottom:4},kv:{fontSize:20,fontWeight:'800',color:'#111827'},kl:{fontSize:10,color:'#6b7280'},
  st:{fontSize:16,fontWeight:'700',color:'#111827',marginBottom:10},
  bc:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'#fff',borderRadius:12,padding:12,marginBottom:4},
  bcd:{fontSize:13,fontWeight:'600',color:'#111827',fontFamily:'monospace'},bdt:{fontSize:12,color:'#6b7280'},
});
