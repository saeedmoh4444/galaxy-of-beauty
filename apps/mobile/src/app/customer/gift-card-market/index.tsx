import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface GiftCardListing {
  id: number;
  value?: number;
  sellingPrice?: number;
  discount?: number;
}

export default function GiftCardMarketScreen(): JSX.Element {
  const q = trpc.giftCardMarket.listings.useQuery();
  const listings: GiftCardListing[] = (q.data as unknown as GiftCardListing[] | undefined) ?? [];
  const buyMut = trpc.giftCardMarket.buy.useMutation({
    onSuccess: () => {
      void q.refetch();
    },
  });
  const buy = (listingId: number) => {
    buyMut.mutate({ listingId });
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
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}> سوق البطاقات</Text>
      <View style={styles.grid}>
        {listings.map((l) => (
          <View key={l.id} style={styles.card}>
            <Text style={styles.ce}></Text>
            <Text style={styles.cv}>{l.value?.toLocaleString()} ر.س</Text>
            <Text style={styles.op}>{l.value?.toLocaleString()}</Text>
            <Text style={styles.sp}>{l.sellingPrice?.toLocaleString()} ر.س</Text>
            <Text style={styles.db}>وفر {l.discount}%</Text>
            <TouchableOpacity onPress={() => buy(l.id)} style={styles.bb}>
              <Text style={styles.bt}> شراء</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  ce: { fontSize: 36 },
  cv: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 6 },
  op: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through', marginTop: 2 },
  sp: { fontSize: 20, fontWeight: '800', color: '#7c3aed', marginTop: 2 },
  db: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  bb: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  bt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
