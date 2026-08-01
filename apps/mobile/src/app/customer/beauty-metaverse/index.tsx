import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyMetaverseScreen(): JSX.Element {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).beautyMetaverse.salons.query() as any).then((d: any) => { setSalons(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const enter = (salonId: number) => { ((trpc as any).beautyMetaverse.enter.mutate({ salonId, avatar: 'skin1' }) as any).then((d: any) => setResult(d)); };
  if (loading) return <SkeletonList count={4} />;
  if (result) return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎮 عالم الجمال الافتراضي</Text>
      <View style={[styles.card, styles.resultCard]}><Text style={styles.resultEmoji}>🌐</Text><Text style={styles.resultTitle}>{result.welcomeMessage as string}</Text>
        <TouchableOpacity onPress={() => setResult(null)} style={styles.exitBtn}><Text style={styles.exitBtnText}>خروج</Text></TouchableOpacity></View>
    </ScrollView>
  );
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#7c3aed']} />}>
      <Text style={styles.t}>🎮 عالم الجمال الافتراضي</Text>
      <View style={styles.grid}>
        {salons.map((s: any) => (
          <TouchableOpacity key={s.id} onPress={() => enter(s.id)} style={styles.salon}><Text style={styles.se}>{s.emoji as string}</Text><Text style={styles.sn}>{s.name as string}</Text></TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  salon: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  se: { fontSize: 40 }, sn: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  resultCard: { alignItems: 'center', borderWidth: 2, borderColor: '#c4b5fd' },
  resultEmoji: { fontSize: 56 }, resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 12, textAlign: 'center' },
  exitBtn: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 16 },
  exitBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
