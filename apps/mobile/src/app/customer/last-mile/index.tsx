import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function LastMileScreen(): JSX.Element {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    ((trpc as any).lastMileDelivery.products.query() as any).then((d: any) => { setProducts(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const order = (productId: number) => {
    ((trpc as any).lastMileDelivery.order.mutate({ productId, address: 'الرياض', paymentMethod: 'wallet' }) as any).then((d: any) => setResult(d));
  };

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>📦 توصيل سريع</Text>
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultEmoji}>✅</Text>
          <Text style={styles.resultTitle}>تم الطلب!</Text>
          <Text style={styles.resultProduct}>{result.product as string}</Text>
          <Text style={styles.resultMeta}>📦 {result.estimatedDelivery as string} · {(result.total as number)?.toLocaleString()} ر.س</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📦 توصيل سريع</Text>
      <Text style={styles.sub}>منتجات تجميل توصل لباب بيتكِ</Text>
      {products.length === 0 ? <Text style={styles.e}>لا توجد منتجات</Text> :
        products.map((p: any) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.prodEmoji}>{p.emoji as string}</Text>
            <View style={{flex:1}}>
              <Text style={styles.prodName}>{p.nameAr as string}</Text>
              <Text style={styles.prodDelivery}>⏱️ {p.deliveryTime as string}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.prodPrice}>{(p.price as number)?.toLocaleString()} ر.س</Text>
              <TouchableOpacity onPress={() => order(p.id as number)} style={styles.orderBtn}><Text style={styles.orderBtnText}>اطلب</Text></TouchableOpacity>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  prodEmoji: { fontSize: 28 }, prodName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  prodDelivery: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  prodPrice: { fontSize: 14, fontWeight: '700', color: '#d97706' },
  orderBtn: { backgroundColor: '#d97706', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  orderBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  resultCard: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac', flexDirection: 'column' },
  resultEmoji: { fontSize: 56 }, resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  resultProduct: { fontSize: 15, fontWeight: '600', color: '#d97706', marginTop: 2 },
  resultMeta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
});
