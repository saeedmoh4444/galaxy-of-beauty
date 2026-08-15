import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface ExpiryItem {
  id?: number;
  emoji?: string;
  productName?: string;
  expiryMonths?: number;
  expired?: boolean;
  isClose?: boolean;
}

export default function ExpiryTrackerScreen(): JSX.Element {
  const q = trpc.expiryTracker.myItems.useQuery();
  const items: ExpiryItem[] = (q.data as unknown as ExpiryItem[] | undefined) ?? [];
  const deleteMut = trpc.expiryTracker.delete.useMutation({
    onSuccess: () => {
      void q.refetch();
    },
  });
  const remove = (id: number) => {
    deleteMut.mutate({ id });
  };
  if (q.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#ef4444']}
        />
      }
    >
      <Text style={styles.t}>️ متعقب الصلاحية</Text>
      {items.map((i) => (
        <View key={i.id} style={[styles.card, i.expired && styles.exp, i.isClose && styles.close]}>
          <Text style={styles.em}>{i.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{i.productName ?? ''}</Text>
            <Text style={styles.meta}>ينتهي بعد {i.expiryMonths ?? 0} شهر</Text>
          </View>
          <TouchableOpacity onPress={() => remove(i.id ?? 0)}>
            <Text style={styles.del}>️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  exp: { borderWidth: 2, borderColor: '#fca5a5', opacity: 0.7 },
  close: { borderWidth: 2, borderColor: '#fcd34d' },
  em: { fontSize: 32 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  del: { fontSize: 18 },
});
