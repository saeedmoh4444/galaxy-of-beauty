import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BoxBuilderScreen(): JSX.Element {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).boxBuilder.products.query() as any)
      .then((d: any) => {
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
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else if (n.size < 5) n.add(id);
    setSelected(n);
  };

  if (loading) return <SkeletonList count={5} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>📦 صندوقي</Text>
      <Text style={styles.sub}>اختاري حتى ٥ منتجات لصندوقك الشهري</Text>
      {selected.size > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🎉 {selected.size} منتجات</Text>
        </View>
      )}
      {products.map((p: any) => {
        const isSel = selected.has(p.id);
        return (
          <TouchableOpacity
            key={p.id}
            onPress={() => toggle(p.id)}
            style={[styles.card, isSel && styles.cardActive]}
          >
            <Text style={styles.emoji}>{(p.emoji as string) ?? '🧴'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.nameAr as string}</Text>
              <Text style={styles.price}>{(p.price as number)?.toLocaleString()} ر.س</Text>
            </View>
            <View style={[styles.check, isSel && styles.checkOn]}>
              <Text style={styles.checkText}>{isSel ? '✓' : '+'}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  badge: {
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeText: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  cardActive: { borderWidth: 2, borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  price: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: '#7c3aed' },
  checkText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
});
