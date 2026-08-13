import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface WishlistItem {
  id?: number;
  emoji?: string;
  serviceName?: string;
  lowestPrice?: number;
  currentPrice?: number;
}

export default function ServiceWishlistScreen(): JSX.Element {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc()
      .serviceWishlist.myWishlist.query()
      .then((d: WishlistItem[]) => {
        setItems(d || []);
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
  const remove = (id: number) => {
    typedTrpc()
      .serviceWishlist.remove.mutate({ id })
      .then(() => fetch());
  };
  if (loading) return <SkeletonList count={4} />;
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
      <Text style={styles.t}> قائمة الخدمات</Text>
      {items.map((i) => (
        <View key={i.id} style={styles.card}>
          <Text style={styles.em}>{i.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{i.serviceName}</Text>
            <Text style={styles.lp}>
              أقل سعر: {i.lowestPrice?.toLocaleString()} ر.س
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.cp}>{i.currentPrice?.toLocaleString()} ر.س</Text>
            <TouchableOpacity onPress={() => remove(i.id ?? 0)}>
              <Text style={styles.del}>️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  em: { fontSize: 28 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  lp: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  cp: { fontSize: 16, fontWeight: '700', color: '#7c3aed' },
  del: { fontSize: 16, marginTop: 4 },
});
