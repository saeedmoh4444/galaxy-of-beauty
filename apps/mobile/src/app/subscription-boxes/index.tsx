import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface SubscriptionBox {
  id?: number;
  emoji?: string;
  nameAr?: string;
  descAr?: string;
  itemCount?: number;
  price?: number;
}

export default function SubscriptionBoxesScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.subscriptionBoxes.plans.useQuery();
  const boxes = (q.data as unknown as SubscriptionBox[] | null) ?? [];
  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.subscription-boxes.load-error')}
        onRetry={() => q.refetch()}
      />
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.subscription-boxes.title')}</Text>
      {boxes.map((b) => (
        <View key={b.id} style={styles.card}>
          <Text style={styles.be}>{b.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bn}>{b.nameAr}</Text>
            <Text style={styles.bd}>{b.descAr?.substring(0, 80)}</Text>
            <Text style={styles.bi}>
              {t('mobile.public.products-count', { count: b.itemCount ?? 0 })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bp}>
              {t('mobile.public.currency', { price: b.price?.toLocaleString() ?? '' })}
            </Text>
            <Text style={styles.bper}>{t('mobile.public.subscription-boxes.per-month')}</Text>
            <TouchableOpacity style={styles.sb}>
              <Text style={styles.sbt}>{t('mobile.public.subscription-boxes.subscribe')}</Text>
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
  be: { fontSize: 36 },
  bn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  bd: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  bi: { fontSize: 12, color: '#7c3aed', marginTop: 4 },
  bp: { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  bper: { fontSize: 11, color: '#9ca3af' },
  sb: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
  },
  sbt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
