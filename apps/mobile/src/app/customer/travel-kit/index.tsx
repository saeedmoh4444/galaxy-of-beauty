import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function TravelKitScreen(): JSX.Element {
  const [dests, setDests] = useState<any[]>([]);
  const [kit, setKit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).travelKit.destinations.query() as any).then((d: any) => { setDests(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#0891b2']} />}>
      <Text style={styles.t}>🧳 حقيبة السفر</Text>
      {dests.map((d: any, i: number) => (<TouchableOpacity key={i} style={styles.card} onPress={() => setKit(d)}><Text style={styles.de}>{d.emoji as string ?? '🌍'}</Text><View style={{flex:1}}><Text style={styles.dn}>{d.nameAr as string}</Text><Text style={styles.dd}>{d.descAr as string}</Text></View></TouchableOpacity>))}
      {kit && <View style={styles.kc}><Text style={styles.kt}>🧳 محتويات الحقيبة - {kit.nameAr as string}</Text>{(kit.items as any[])?.map((item: any, i: number) => (<View key={i} style={styles.ki}><Text style={styles.kie}>{item.emoji as string}</Text><Text style={styles.kit}>{item.nameAr as string}</Text></View>))}</View>}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  de: { fontSize: 36 }, dn: { fontSize: 15, fontWeight: '700', color: '#111827' }, dd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  kc: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 12 }, kt: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  ki: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }, kie: { fontSize: 24 }, kit: { fontSize: 13, color: '#374151' },
});
