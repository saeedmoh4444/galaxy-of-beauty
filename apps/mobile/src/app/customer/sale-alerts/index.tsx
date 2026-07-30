import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SaleAlertsScreen() {
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);
  const [deals, setDeals] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([(trpc.saleAlerts.myAlerts.query() as any), (trpc.saleAlerts.activeDeals.query() as any)])
      .then(([a, d]) => { setAlerts(a || []); setDeals(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#dc2626" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🛒 تنبيهات العروض</Text>
      {deals.map((d: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.dealCard}>
          <Text style={styles.dealEmoji}>{d.emoji as string}</Text><Text style={styles.dealTitle}>{d.titleAr as string}</Text>
          <Text style={styles.dealDiscount}>-{d.discount as number}%</Text><Text style={styles.dealEnds}>⏰ {d.endsIn as string}</Text>
        </View>
      ))}
      {alerts.map((a: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.alert}><Text>{a.active ? '🟢' : '⚫'} {(a.categories as string[])?.join(', ')}</Text><Text>خصم {a.maxDiscount as number}%+</Text></View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 16 },
  dealCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dealEmoji: { fontSize: 28 }, dealTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'right' },
  dealDiscount: { fontSize: 16, fontWeight: '800', color: '#dc2626' }, dealEnds: { fontSize: 10, color: '#9ca3af' },
  alert: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 4 },
});
