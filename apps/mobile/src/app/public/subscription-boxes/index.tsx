import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
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
  const boxesQ = trpc.subscriptionBoxes.plans.useQuery();

  if (boxesQ.isLoading) return <SkeletonList count={4} />;
  if (boxesQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.subscription-boxes.load-error')}
        onRetry={() => boxesQ.refetch()}
      />
    );

  const items = (boxesQ.data as unknown as SubscriptionBox[] | null) ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={boxesQ.isRefetching}
          onRefresh={() => boxesQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.subscription-boxes.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.subscription-boxes.subtitle')}</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.subscription-boxes.empty')}</Text>
      ) : (
        items.map((b) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.boxEmoji}>{b.emoji ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.boxName}>{b.nameAr ?? ''}</Text>
              <Text style={styles.boxDesc}>{b.descAr?.substring(0, 80)}</Text>
              <Text style={styles.boxItems}>
                {t('mobile.public.products-count', { count: b.itemCount ?? 0 })}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.boxPrice}>
                {t('mobile.public.currency', { price: (b.price ?? 0).toLocaleString() })}
              </Text>
              <Text style={styles.boxPeriod}>
                {t('mobile.public.subscription-boxes.per-month')}
              </Text>
              <TouchableOpacity style={styles.subBtn}>
                <Text style={styles.subBtnText}>
                  {t('mobile.public.subscription-boxes.subscribe')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  boxEmoji: { fontSize: 36 },
  boxName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  boxDesc: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  boxItems: { fontSize: 12, color: '#7c3aed', marginTop: 4 },
  boxPrice: { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  boxPeriod: { fontSize: 11, color: '#9ca3af' },
  subBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 6,
  },
  subBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
