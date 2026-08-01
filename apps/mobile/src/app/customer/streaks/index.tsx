import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function StreaksScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).streaks.status.query() as any).then((d: any) => { setData(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={3} />;
  const streak = data?.currentStreak ?? 0;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#f59e0b']} />}>
      <Text style={styles.t}>🔥 الاستمرارية</Text>
      <View style={styles.card}><Text style={styles.fire}>🔥</Text><Text style={styles.num}>{streak}</Text><Text style={styles.label}>أسابيع متتالية</Text></View>
      <View style={styles.weeks}>{Array.from({length:12},(_,i)=><View key={i} style={[styles.w,i<streak&&styles.wa]}><Text style={styles.wt}>{i<streak?'🔥':'○'}</Text></View>)}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, alignItems: 'center', paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 30, width: '100%', marginBottom: 20 },
  fire: { fontSize: 48, marginBottom: 8 }, num: { fontSize: 40, fontWeight: '800', color: '#d97706' }, label: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  weeks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  w: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  wa: { backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#f59e0b' }, wt: { fontSize: 16 },
});
