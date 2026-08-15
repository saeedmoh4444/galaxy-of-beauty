import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface RideProvider {
  key: string;
  emoji: string;
  nameAr: string;
  estimatedTime: string;
  estimatedPrice: number;
}

interface BookingResult {
  driverName?: string;
  carModel?: string;
  plateNumber?: string;
  estimatedArrival?: string;
}

export default function RideHailingScreen(): JSX.Element {
  const [result, setResult] = useState<BookingResult | null>(null);
  const providersQ = trpc.rideHailing.providers.useQuery();
  const providers: RideProvider[] =
    (providersQ.data as unknown as RideProvider[] | undefined) ?? [];

  const bookMut = trpc.rideHailing.book.useMutation({
    onSuccess: (d) => setResult(d as unknown as BookingResult),
  });
  const book = (provider: string) => {
    bookMut.mutate({
      bookingId: 1,
      provider: provider as 'uber' | 'careem',
      pickupAddress: 'موقعي الحالي',
    });
  };
  if (providersQ.isLoading) return <SkeletonList count={3} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}> توصيل للموعد</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rt}>تم الحجز!</Text>
          <Text style={styles.rn}>
            {result.driverName} · {result.carModel}
          </Text>
          <Text style={styles.rm}>
            {result.plateNumber} · {result.estimatedArrival}
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
          refreshing={providersQ.isRefetching}
          onRefresh={() => providersQ.refetch()}
          colors={['#2563eb']}
        />
      }
    >
      <Text style={styles.t}> توصيل للموعد</Text>
      {providers.map((p) => (
        <View key={p.key} style={styles.card}>
          <Text style={styles.pe}>{p.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.pn}>{p.nameAr}</Text>
            <Text style={styles.pm}>
              ️ {p.estimatedTime} · {p.estimatedPrice?.toLocaleString()} ر.س
            </Text>
          </View>
          <TouchableOpacity onPress={() => book(p.key)} style={styles.bb}>
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
