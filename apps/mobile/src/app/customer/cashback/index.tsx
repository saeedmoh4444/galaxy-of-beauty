import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CashbackScreen(): JSX.Element {
  const [info, setInfo] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).cashback.info.query() as any),
      ((trpc as any).cashback.history.query({ page: 1, limit: 20 }) as any),
    ]).then(([i, h]: any[]) => { setInfo(i); setHistory(h); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  const items = (history?.items ?? []) as any[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💰 استرداد نقدي</Text>
      <Text style={styles.sub}>٥٪ استرداد على كل حجز + ٥٠ ر.س مكافأة أول حجز</Text>

      <View style={styles.balanceRow}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>رصيد الكاش باك</Text>
          <Text style={styles.balanceAmount}>{(info?.balance as number ?? 0)?.toLocaleString()} ر.س</Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد الإجمالي</Text>
          <Text style={[styles.balanceAmount, {color:'#7c3aed'}]}>{(info?.totalBalance as number ?? 0)?.toLocaleString()} ر.س</Text>
        </View>
      </View>

      {info?.isFirstBooking && (
        <View style={styles.bonusCard}>
          <Text style={styles.bonusEmoji}>🎁</Text>
          <Text style={styles.bonusText}>مكافأة أول حجز: {info.firstBookingBonus as number} ر.س</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>📋 سجل الاسترداد</Text>
      <Text style={styles.totalCashback}>إجمالي المسترد: {(history?.totalCashback as number ?? 0)?.toLocaleString()} ر.س</Text>

      {items.length === 0 ? <Text style={styles.e}>لا توجد عمليات</Text> :
        items.map((t: any) => (
          <View key={t.id} style={styles.txnCard}>
            <Text style={styles.txnEmoji}>💵</Text>
            <View style={{flex:1}}>
              <Text style={styles.txnAmount}>+{(t.amount as number)?.toLocaleString()} ر.س</Text>
              <Text style={styles.txnDate}>{new Date(t.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            </View>
            <Text style={styles.txnRate}>{(info?.rate as number ?? 5)}%</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  balanceRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  balanceCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center' },
  balanceLabel: { fontSize: 11, color: '#6b7280' },
  balanceAmount: { fontSize: 20, fontWeight: '800', color: '#059669', marginTop: 4 },
  bonusCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, marginBottom: 20 },
  bonusEmoji: { fontSize: 24 }, bonusText: { fontSize: 14, fontWeight: '700', color: '#d97706' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  totalCashback: { fontSize: 13, color: '#059669', fontWeight: '600', marginBottom: 12 },
  txnCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 4 },
  txnEmoji: { fontSize: 24 }, txnAmount: { fontSize: 14, fontWeight: '700', color: '#059669' },
  txnDate: { fontSize: 11, color: '#9ca3af' }, txnRate: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
});
