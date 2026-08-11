import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function RideHailingScreen(): JSX.Element {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).rideHailing.providers.query() as any)
      .then((d: any) => {
        setProviders(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const book = (provider: string) => {
    (
      (trpc as any).rideHailing.book.mutate({
        bookingId: 1,
        provider,
        pickupAddress: 'موقعي الحالي',
      }) as any
    ).then((d: any) => setResult(d));
  };
  if (loading) return <SkeletonList count={3} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>🚗 توصيل للموعد</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}>🚗</Text>
          <Text style={styles.rt}>تم الحجز!</Text>
          <Text style={styles.rn}>
            {result.driverName as string} · {result.carModel as string}
          </Text>
          <Text style={styles.rm}>
            {result.plateNumber as string} · {result.estimatedArrival as string}
          </Text>
        </View>
      </ScrollView>
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#2563eb']}
        />
      }
    >
      <Text style={styles.t}>🚗 توصيل للموعد</Text>
      {providers.map((p: any) => (
        <View key={p.key} style={styles.card}>
          <Text style={styles.pe}>{p.emoji as string}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.pn}>{p.nameAr as string}</Text>
            <Text style={styles.pm}>
              ⏱️ {p.estimatedTime as string} · {(p.estimatedPrice as number)?.toLocaleString()} ر.س
            </Text>
          </View>
          <TouchableOpacity onPress={() => book(p.key as string)} style={styles.bb}>
            <Text style={styles.bt}>احجز</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  pe: { fontSize: 36 },
  pn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  pm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  bb: { backgroundColor: '#2563eb', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  bt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rc: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac', flexDirection: 'column' },
  re: { fontSize: 56 },
  rt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  rn: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 4 },
  rm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
