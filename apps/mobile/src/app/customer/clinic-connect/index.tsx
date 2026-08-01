import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function ClinicConnectScreen(): JSX.Element {
  const [clinics, setClinics] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    Promise.all([((trpc as any).clinicConnect.clinics.query() as any), ((trpc as any).clinicConnect.myReferrals.query() as any)])
      .then(([c, r]: any[]) => { setClinics(c || []); setReferrals(r || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const refer = (clinicId: number) => { ((trpc as any).clinicConnect.refer.mutate({ clinicId, reason: 'استشارة جلدية', urgency: 'routine' }) as any); };
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#0891b2']} />}>
      <Text style={styles.t}>🏥 Clinic Connect</Text>
      {clinics.map((c: any) => (
        <View key={c.id} style={styles.card}><Text style={styles.em}>{c.emoji as string}</Text><View style={{flex:1}}><Text style={styles.nm}>{c.name as string}</Text><Text style={styles.meta}>📍 {c.city as string} · {c.specialty as string} · ⭐ {c.rating as number}</Text></View>
          <TouchableOpacity onPress={() => refer(c.id as number)} style={styles.rb}><Text style={styles.rt}>إحالة</Text></TouchableOpacity></View>
      ))}
      {referrals.length > 0 && <Text style={styles.st}>📋 إحالاتي</Text>}
      {referrals.map((r: any) => (
        <View key={r.id} style={styles.rc}><Text style={styles.rr}>{r.reason as string}</Text>
          <View style={[styles.rbadge, r.status === 'PENDING' ? styles.rp : styles.rd]}><Text style={styles.rbt}>{r.status === 'PENDING' ? 'معلقة' : 'مكتملة'}</Text></View></View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  em: { fontSize: 32 }, nm: { fontSize: 14, fontWeight: '600', color: '#111827' }, meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  rb: { backgroundColor: '#0891b2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }, rt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rc: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 4 },
  rr: { fontSize: 13, fontWeight: '600', color: '#111827' }, rbadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  rp: { backgroundColor: '#fef3c7' }, rd: { backgroundColor: '#dcfce7' }, rbt: { fontSize: 11, fontWeight: '600' },
});
