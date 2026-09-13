import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface GroupDeal {
  id?: number;
  emoji?: string;
  nameAr?: string;
  price?: number;
  buyers?: number;
  minBuyers?: number;
}

export default function GroupBuyScreen(): JSX.Element {
  const { t } = useLocale();
  const dealsQ = trpc.groupBuy.deals.useQuery();

  if (dealsQ.isLoading) return <SkeletonList count={4} />;

  const deals = (dealsQ.data ?? []) as GroupDeal[];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={dealsQ.isRefetching}
          onRefresh={() => dealsQ.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.group-buy.title')}</Text>
      {deals.map((d) => (
        <View key={d.id} style={styles.card}>
          <Text style={styles.de}>{d.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dn}>{d.nameAr ?? ''}</Text>
            <Text style={styles.dp}>
              {(d.price ?? 0).toLocaleString()} {t('misc.sar')}
            </Text>
            <Text style={styles.dm}>
              {t('mobile.public.group-buy.buyers', { count: d.buyers ?? 0, min: d.minBuyers ?? 0 })}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  de: { fontSize: 32 },
  dn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  dp: { fontSize: 15, fontWeight: '700', color: '#059669', marginTop: 2 },
  dm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
