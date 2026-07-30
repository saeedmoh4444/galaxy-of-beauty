import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.wallet.getBalance.query() as any as Promise<Record<string, unknown>>)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>💰 المحفظة</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
          <Text style={styles.balanceAmount}>{((data?.balance as number) ?? 0).toLocaleString()} ر.س</Text>
          {((data?.bonusBalance as number) ?? 0) > 0 && (
            <Text style={styles.bonus}>+ {(data?.bonusBalance as number).toLocaleString()} ر.س رصيد إضافي</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
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
