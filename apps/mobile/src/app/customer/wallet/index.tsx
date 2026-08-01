import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function WalletScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.wallet.getBalance.query());
  if (loading) return <SkeletonList count={3} />;
  if (error) return <ErrorAlert message="فشل تحميل المحفظة" onRetry={refetch} />;
  const balance = data as Record<string, unknown> | null;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
      <Text style={styles.t}>💰 المحفظة</Text>
      <View style={styles.bc}><Text style={styles.bl}>الرصيد الحالي</Text><Text style={styles.ba}>{((balance?.balance as number) ?? 0).toLocaleString()} ر.س</Text>
        {((balance?.bonusBalance as number) ?? 0) > 0 && <Text style={styles.bb}>+ {(balance?.bonusBalance as number).toLocaleString()} ر.س رصيد إضافي</Text>}</View>
      <View style={styles.actions}><View style={styles.ab}><Text style={styles.ai}>💳</Text><Text style={styles.at}>شحن</Text></View><View style={styles.ab}><Text style={styles.ai}>💸</Text><Text style={styles.at}>سحب</Text></View><View style={styles.ab}><Text style={styles.ai}>📊</Text><Text style={styles.at}>كشف</Text></View><View style={styles.ab}><Text style={styles.ai}>🎁</Text><Text style={styles.at}>كاش باك</Text></View></View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  bc: { backgroundColor: '#7c3aed', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
  bl: { fontSize: 13, color: '#ddd6fe', marginBottom: 4 }, ba: { fontSize: 36, fontWeight: '800', color: '#fff' }, bb: { fontSize: 13, color: '#c4b5fd', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  ab: { alignItems: 'center' }, ai: { fontSize: 28, marginBottom: 4 }, at: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
});
