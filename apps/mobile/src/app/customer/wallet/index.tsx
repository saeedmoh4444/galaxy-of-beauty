import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function WalletScreen(): JSX.Element {
  const { data, loading, error, refetch } = useQuery(() => trpc.wallet.getBalance.query());

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;
  if (error) return <ErrorAlert message="فشل تحميل المحفظة" onRetry={refetch} />;

  const balance = data as Record<string, unknown> | null;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💰 المحفظة</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
        <Text style={styles.balanceAmount}>{((balance?.balance as number) ?? 0).toLocaleString()} ر.س</Text>
        {((balance?.bonusBalance as number) ?? 0) > 0 && (
          <Text style={styles.bonus}>+ {(balance?.bonusBalance as number).toLocaleString()} ر.س رصيد إضافي</Text>
        )}
      </View>
      <View style={styles.actions}>
        <View style={styles.actionBtn}><Text style={styles.actionIcon}>💳</Text><Text style={styles.actionText}>شحن</Text></View>
        <View style={styles.actionBtn}><Text style={styles.actionIcon}>💸</Text><Text style={styles.actionText}>سحب</Text></View>
        <View style={styles.actionBtn}><Text style={styles.actionIcon}>📊</Text><Text style={styles.actionText}>كشف</Text></View>
        <View style={styles.actionBtn}><Text style={styles.actionIcon}>🎁</Text><Text style={styles.actionText}>كاش باك</Text></View>
      </View>
      <Text style={styles.sectionTitle}>آخر العمليات</Text>
      <Text style={styles.empty}>لا توجد عمليات حديثة</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  balanceCard: { backgroundColor: '#7c3aed', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
  balanceLabel: { fontSize: 13, color: '#ddd6fe', marginBottom: 4 },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: '#fff' },
  bonus: { fontSize: 13, color: '#c4b5fd', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  actionBtn: { alignItems: 'center' },
  actionIcon: { fontSize: 28, marginBottom: 4 },
  actionText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 12 },
  empty: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
});
