import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface WishlistItem {
  id?: number;
  emoji?: string;
  serviceName?: string;
  lowestPrice?: number;
  currentPrice?: number;
}

export default function ServiceWishlistScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const itemsQ = trpc.serviceWishlist.myWishlist.useQuery(undefined, { enabled: isAuthed });
  const items: WishlistItem[] = (itemsQ.data as unknown as WishlistItem[] | undefined) ?? [];
  const removeMut = trpc.serviceWishlist.remove.useMutation({
    onSuccess: () => {
      void itemsQ.refetch();
    },
  });
  const remove = (id: number) => {
    removeMut.mutate({ id });
  };
  if (itemsQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={itemsQ.isRefetching}
          onRefresh={() => itemsQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.serviceWishlist.title')}</Text>
      {items.map((i) => (
        <View key={i.id} style={styles.card}>
          <Text style={styles.em}>{i.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{i.serviceName}</Text>
            <Text style={styles.lp}>
              {t('mobile.serviceWishlist.lowest-price', {
                price: i.lowestPrice?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA') ?? '',
              })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.cp}>
              {t('marketing.compare.price-sar', {
                price: i.currentPrice?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA') ?? '',
              })}
            </Text>
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
