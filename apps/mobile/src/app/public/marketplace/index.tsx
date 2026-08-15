import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface MarketProduct {
  id?: number;
  emoji?: string;
  nameAr?: string;
  titleAr?: string;
  price?: number;
}

export default function MarketplaceScreen(): JSX.Element {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().marketplace.products.query({}) as Promise<MarketProduct[]>)
      .then((d: MarketProduct[]) => {
        setProducts(d || []);
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
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>️ المتجر</Text>
      <View style={styles.grid}>
        {products.length === 0
          ? [
              { emoji: '', title: 'منتجات العناية', desc: 'تصفحي المنتجات' },
              { emoji: '', title: 'مستحضرات تجميل', desc: 'أفضل الماركات' },
              { emoji: '‍️', title: 'منتجات الشعر', desc: 'عناية متكاملة' },
              { emoji: '', title: 'منتجات الأظافر', desc: 'ألوان رائعة' },
            ].map((item, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.ci}>
                  <Text style={styles.ce}>{item.emoji}</Text>
                </View>
                <Text style={styles.ct}>{item.title}</Text>
                <Text style={styles.cd}>{item.desc}</Text>
              </View>
            ))
          : products.map((p) => (
              <TouchableOpacity key={p.id} style={styles.card}>
                <View style={styles.ci}>
                  <Text style={styles.ce}>{p.emoji ?? ''}</Text>
                </View>
                <Text style={styles.ct}>{p.nameAr ?? p.titleAr}</Text>
                <Text style={styles.cp}>{(p.price ?? 0).toLocaleString()} ر.س</Text>
              </TouchableOpacity>
            ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    overflow: 'hidden',
  },
  ci: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ce: { fontSize: 40 },
  ct: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right' },
  cd: { fontSize: 11, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  cp: { fontSize: 14, fontWeight: '800', color: '#db2777', textAlign: 'right', marginTop: 4 },
});
