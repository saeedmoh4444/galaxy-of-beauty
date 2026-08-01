import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function RecommendationsScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).services.list.query({}) as any).then((d: any) => { setServices(d?.items || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const getRelated = (serviceId: number) => { setSelectedId(serviceId); setRelatedLoading(true); ((trpc as any).recommendations.frequentlyBookedTogether.query({ serviceId }) as any).then((d: any) => { setRelated(d || []); setRelatedLoading(false); }).catch(() => setRelatedLoading(false)); };
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#ec4899']} />}>
      <Text style={styles.t}>💡 توصيات ذكية</Text>
      {services.slice(0, 10).map((s: any) => (<TouchableOpacity key={s.id} onPress={() => getRelated(s.id)} style={[styles.sc, selectedId === s.id && styles.sca]}><Text style={styles.se}>{s.emoji as string ?? '💆‍♀️'}</Text><Text style={styles.sn}>{(s.titleJson as any)?.ar as string ?? s.nameAr as string}</Text></TouchableOpacity>))}
      {relatedLoading && <SkeletonList count={3} />}
      {related.length > 0 && !relatedLoading && <Text style={styles.st}>🔗 غالباً تُحجز مع:</Text>}
      {related.map((r: any) => (<View key={r.id} style={styles.card}><Text style={styles.re}>🔗</Text><View style={{flex:1}}><Text style={styles.rn}>{r.title as string}</Text><Text style={styles.rp}>{(r.basePrice as number)?.toLocaleString()} ر.س</Text></View><View style={styles.rb}><Text style={styles.rbt}>{r.bookedTogether as number}x</Text></View></View>))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  sc: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 2, borderColor: '#e5e7eb' },
  sca: { borderColor: '#db2777', backgroundColor: '#fdf2f8' }, se: { fontSize: 26 }, sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  re: { fontSize: 24 }, rn: { fontSize: 14, fontWeight: '600', color: '#111827' }, rp: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  rb: { backgroundColor: '#fdf2f8', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }, rbt: { fontSize: 12, fontWeight: '700', color: '#db2777' },
});
