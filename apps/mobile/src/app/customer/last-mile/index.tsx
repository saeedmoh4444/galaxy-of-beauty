import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface LastMileProduct {
  id: number;
  emoji: string;
  nameAr: string;
  deliveryTime: string;
  price: number;
}

interface OrderResult {
  product?: string;
  estimatedDelivery?: string;
  total?: number;
}

export default function LastMileScreen(): JSX.Element {
  const [result, setResult] = useState<OrderResult | null>(null);

  const productsQ = trpc.lastMileDelivery.products.useQuery();
  const products: LastMileProduct[] = (productsQ.data as LastMileProduct[] | undefined) ?? [];

  const orderMut = trpc.lastMileDelivery.order.useMutation({
    onSuccess: (d) => setResult(d as unknown as OrderResult),
  });
  const order = (productId: number) => {
    orderMut.mutate({
      productId,
      address: 'الرياض',
      paymentMethod: 'wallet',
    });
  };
  if (productsQ.isLoading) return <SkeletonList count={4} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}> توصيل سريع</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rtt}>تم الطلب!</Text>
          <Text style={styles.rp}>{result.product}</Text>
          <Text style={styles.rm}>
            {result.estimatedDelivery} · {result.total?.toLocaleString()} ر.س
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
          refreshing={productsQ.isRefetching}
          onRefresh={() => productsQ.refetch()}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> توصيل سريع</Text>
      {products.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.pe}>{p.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.pn}>{p.nameAr}</Text>
            <Text style={styles.pd}>️ {p.deliveryTime}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.pp}>{p.price?.toLocaleString()} ر.س</Text>
            <TouchableOpacity onPress={() => order(p.id)} style={styles.ob}>
              <Text style={styles.ot}>اطلب</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  pe: { fontSize: 28 },
  pn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  pd: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  pp: { fontSize: 14, fontWeight: '700', color: '#d97706' },
  ob: { backgroundColor: '#d97706', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  ot: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rc: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac', flexDirection: 'column' },
  re: { fontSize: 56 },
  rtt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  rp: { fontSize: 15, fontWeight: '600', color: '#d97706', marginTop: 2 },
  rm: { fontSize: 12, color: '#6b7280', marginTop: 4 },
});
