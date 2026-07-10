import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function WalletScreen() {
  const [balance, setBalance] = useState<Record<string, unknown> | null>(null);
  const [txs, setTxs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([trpc.wallet.getBalance.query(), trpc.wallet.getTransactions.query({ page: 1, limit: 20 } as never)])
      .then(([b, t]) => {
        setBalance(b as unknown as Record<string, unknown>);
        setTxs((t?.transactions ?? []) as Record<string, unknown>[]);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>المحفظة</Text>
      <View style={styles.balanceRow}>
        <View style={styles.balanceCard}><Text style={styles.bLabel}>الرصيد الكلي</Text><Text style={styles.bValue}>{Number(balance?.totalBalance ?? 0).toFixed(2)} ر.س</Text></View>
        <View style={styles.balanceCard}><Text style={styles.bLabel}>قابل للسحب</Text><Text style={[styles.bValue, { color: '#10b981' }]}>{Number(balance?.balance ?? 0).toFixed(2)} ر.س</Text></View>
        <View style={styles.balanceCard}><Text style={styles.bLabel}>المكافآت</Text><Text style={[styles.bValue, { color: '#f59e0b' }]}>{Number(balance?.bonusBalance ?? 0).toFixed(2)} ر.س</Text></View>
      </View>
      <Text style={styles.sectionTitle}>المعاملات</Text>
      {txs.length === 0 ? <Text style={styles.empty}>لا توجد معاملات</Text> : txs.map((t: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.txRow}>
          <View style={{ flex: 1 }}><Text style={styles.txDesc}>{t.description as string}</Text><Text style={styles.txDate}>{new Date(t.createdAt as string).toLocaleDateString('ar-SA')}</Text></View>
          <Text style={[styles.txAmount, { color: t.type === 'CREDIT' ? '#10b981' : '#ef4444' }]}>{t.type === 'CREDIT' ? '+' : '-'}{Number(t.amount).toFixed(2)} ر.س</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  balanceCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, alignItems: 'center' },
  bLabel: { fontSize: 11, color: '#6b7280' },
  bValue: { fontSize: 16, fontWeight: '700', color: '#7c3aed', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  txDesc: { fontSize: 14, fontWeight: '500', color: '#111827' },
  txDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 20 },
});
