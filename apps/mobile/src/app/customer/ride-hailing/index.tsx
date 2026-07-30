import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function RideHailingScreen(): JSX.Element {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    ((trpc as any).rideHailing.providers.query() as any).then((d: any) => { setProviders(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const book = (provider: string) => {
    ((trpc as any).rideHailing.book.mutate({ bookingId: 1, provider, pickupAddress: 'موقعي الحالي' }) as any).then((d: any) => setResult(d));
  };

  if (loading) return <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>🚗 توصيل للموعد</Text>
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultEmoji}>🚗</Text>
          <Text style={styles.resultTitle}>تم الحجز!</Text>
          <Text style={styles.driverName}>{result.driverName as string} · {result.carModel as string}</Text>
          <Text style={styles.driverMeta}>{result.plateNumber as string} · {result.estimatedArrival as string}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🚗 توصيل للموعد</Text>
      <Text style={styles.sub}>احجزي توصيل لمشواركِ لصالون التجميل</Text>
      {providers.length === 0 ? <Text style={styles.e}>لا يوجد مزودين</Text> :
        providers.map((p: any) => (
          <View key={p.key} style={styles.card}>
            <Text style={styles.provEmoji}>{p.emoji as string}</Text>
            <View style={{flex:1}}>
              <Text style={styles.provName}>{p.nameAr as string}</Text>
              <Text style={styles.provMeta}>⏱️ {p.estimatedTime as string} · {(p.estimatedPrice as number)?.toLocaleString()} ر.س</Text>
            </View>
            <TouchableOpacity onPress={() => book(p.key as string)} style={styles.bookBtn}><Text style={styles.bookBtnText}>احجز</Text></TouchableOpacity>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  provEmoji: { fontSize: 36 }, provName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  provMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  bookBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  resultCard: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac', flexDirection: 'column' },
  resultEmoji: { fontSize: 56 }, resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  driverName: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 4 },
  driverMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
