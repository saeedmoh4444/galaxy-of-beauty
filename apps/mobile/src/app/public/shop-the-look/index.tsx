import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function ShopTheLookScreen(): JSX.Element {
  const [looks, setLooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().shopTheLook.looks.query() as any)
      .then((d: any) => {
        setLooks(d || []);
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
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>️ تسوقي الإطلالة</Text>
      <Text style={styles.sub}>تسوقي منتجات مستوحاة من إطلالات الفنانات</Text>
      {looks.length === 0 ? (
        <Text style={styles.e}>لا توجد إطلالات</Text>
      ) : (
        looks.map((l) => (
          <View key={l.id} style={styles.card}>
            <View style={styles.lookHeader}>
              {l.imageUrl ? (
                <Image source={{ uri: l.imageUrl as string }} style={styles.lookImage} />
              ) : (
                <View style={styles.lookPlaceholder}>
                  <Text style={{ fontSize: 32 }}>️</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.lookTitle}>{l.titleAr as string}</Text>
                <Text style={styles.lookBy}>‍ {l.technician as string}</Text>
              </View>
            </View>
            <Text style={styles.productsTitle}> المنتجات</Text>
            {(l.products as any[])?.map((p) => (
              <View key={p.id} style={styles.product}>
                <Text style={styles.prodEmoji}>{(p.emoji as string) ?? ''}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prodName}>{p.nameAr as string}</Text>
                  <Text style={styles.prodBrand}>{p.brand as string}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.prodPrice}>{(p.price as number)?.toLocaleString()} ر.س</Text>
                  <TouchableOpacity style={styles.buyBtn}>
                    <Text style={styles.buyBtnText}>شراء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  lookHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  lookImage: { width: 80, height: 80, borderRadius: 12 },
  lookPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  lookBy: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  productsTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  prodEmoji: { fontSize: 24 },
  prodName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  prodBrand: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  prodPrice: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  buyBtn: {
    backgroundColor: '#db2777',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 2,
  },
  buyBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
