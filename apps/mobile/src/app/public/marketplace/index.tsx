import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function MarketplaceScreen(): JSX.Element {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).marketplace.products.query({}) as any).then((d: any) => { setProducts(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🛍️ المتجر</Text>
      <Text style={styles.sub}>منتجات العناية والتجميل</Text>
      {products.length === 0 ? (
        <View style={styles.grid}>
          {[
            { emoji: '🧴', title: 'منتجات العناية', desc: 'تصفحي المنتجات' },
            { emoji: '💄', title: 'مستحضرات تجميل', desc: 'أفضل الماركات' },
            { emoji: '💇‍♀️', title: 'منتجات الشعر', desc: 'عناية متكاملة' },
            { emoji: '💅', title: 'منتجات الأظافر', desc: 'ألوان رائعة' },
          ].map((item, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardImage}><Text style={styles.cardEmoji}>{item.emoji}</Text></View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          {products.map((p: any) => (
            <TouchableOpacity key={p.id} style={styles.card}>
              <View style={styles.cardImage}><Text style={styles.cardEmoji}>{p.emoji as string ?? '🧴'}</Text></View>
              <Text style={styles.cardTitle}>{p.nameAr as string ?? p.titleAr as string}</Text>
              <Text style={styles.price}>{(p.price as number)?.toLocaleString()} ر.س</Text>
              {p.brand && <Text style={styles.brand}>{p.brand as string}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 10, overflow: 'hidden' },
  cardImage: { height: 120, borderRadius: 12, backgroundColor: '#fce7f3', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardEmoji: { fontSize: 40 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right' },
  cardDesc: { fontSize: 11, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  price: { fontSize: 14, fontWeight: '800', color: '#db2777', textAlign: 'right', marginTop: 4 },
  brand: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 2 },
});
