import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface CompareProduct {
  id?: number;
  emoji?: string;
  nameAr?: string;
  price?: number;
  brand?: string;
  rating?: string;
}

export default function ProductCompareScreen(): JSX.Element {
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().productCompare.products.query() as Promise<CompareProduct[]>)
      .then((d: CompareProduct[]) => {
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
  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };
  const ci = products.filter((p) => selected.includes(p.id ?? -1));
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}> مقارنة المنتجات</Text>
      <View style={styles.grid}>
        {products.map((p) => {
          const isSel = selected.includes(p.id ?? -1);
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => toggle(p.id ?? -1)}
              style={[styles.ch, isSel && styles.cha]}
            >
              <Text style={styles.ce}>{p.emoji ?? ''}</Text>
              <Text style={[styles.cn, isSel && styles.cna]}>{p.nameAr ?? ''}</Text>
              <Text style={styles.cp}>{(p.price ?? 0).toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {ci.length > 0 && (
        <View style={styles.tbl}>
          <Text style={styles.ttl}> المقارنة</Text>
          {ci.map((p) => (
            <View key={p.id} style={styles.tc}>
              <Text style={styles.tcn}>{p.nameAr ?? ''}</Text>
              <View style={styles.tr}>
                <Text style={styles.tl}></Text>
                <Text style={styles.tv}>{(p.price ?? 0).toLocaleString()} ر.س</Text>
              </View>
              <View style={styles.tr}>
                <Text style={styles.tl}>️</Text>
                <Text style={styles.tv}>{p.brand ?? ''}</Text>
              </View>
              <View style={styles.tr}>
                <Text style={styles.tl}></Text>
                <Text style={styles.tv}>{p.rating ?? ''}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  ch: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cha: { borderColor: '#0891b2', backgroundColor: '#ecfeff' },
  ce: { fontSize: 24 },
  cn: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4, textAlign: 'center' },
  cna: { color: '#0891b2' },
  cp: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tbl: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  ttl: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  tc: { marginBottom: 10 },
  tcn: { fontSize: 14, fontWeight: '700', color: '#0891b2', marginBottom: 4 },
  tr: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  tl: { fontSize: 13, color: '#6b7280' },
  tv: { fontSize: 13, fontWeight: '600', color: '#111827' },
});
