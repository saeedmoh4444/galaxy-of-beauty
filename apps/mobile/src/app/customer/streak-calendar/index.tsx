import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function StreakCalendarScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.streaks.get.query());
  if (loading) return <SkeletonList count={3} />;
  if (error) return <ErrorAlert message="فشل تحميل تقويم الاستمرارية" onRetry={refetch} />;
  const streak = (data as any)?.currentStreak || 0;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#f59e0b']} />}>
      <Text style={styles.t}>📅 تقويم الاستمرارية</Text>
      <View style={styles.sc}><Text style={styles.fire}>🔥</Text><Text style={styles.sn}>{streak}</Text><Text style={styles.sl}>أسابيع متتالية</Text></View>
      <View style={styles.weeks}>{Array.from({length:12},(_,i)=>(<View key={i} style={[styles.w,i<streak&&styles.wa]}><Text style={styles.wt}>{i<streak?'🔥':'○'}</Text></View>))}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, alignItems: 'center', paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  sc: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 30, width: '100%', marginBottom: 20 },
  fire: { fontSize: 48, marginBottom: 8 }, sn: { fontSize: 40, fontWeight: '800', color: '#d97706' }, sl: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  weeks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  w: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  wa: { backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#f59e0b' }, wt: { fontSize: 18 },
});
