import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function PriceDropAlertsScreen() {
  const [tracked, setTracked] = useState<Record<string, unknown>[]>([]);
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([(trpc.priceDropAlerts.tracked.query() as any), (trpc.priceDropAlerts.myAlerts.query() as any)])
      .then(([t, a]) => { setTracked(t || []); setAlerts(a || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#dc2626" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔔 تنبيهات الأسعار</Text>
      {tracked.length > 0 && <Text style={styles.s}>📉 انخفض سعرها</Text>}
      {tracked.map((s: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}><Text style={styles.cardEmoji}>{s.emoji as string}</Text><View style={{flex:1}}><Text style={styles.name}>{s.nameAr as string}</Text>
          <View style={styles.prices}><Text style={styles.old}>{s.prevPrice as number} ر.س</Text><Text style={styles.new}>{s.price as number} ر.س</Text></View></View></View>
      ))}
      {alerts.map((a: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.alert}><Text>{a.emoji as string} {a.serviceName as string}</Text><Text style={styles.target}>{a.targetPrice as number} ر.س</Text></View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 16 },
  s: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 8, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 14, padding: 12, marginBottom: 8, gap: 8 },
  cardEmoji: { fontSize: 28 }, name: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right' },
  prices: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 4 },
  old: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  new: { fontSize: 14, fontWeight: '800', color: '#059669' },
  alert: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6 },
  target: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
});
