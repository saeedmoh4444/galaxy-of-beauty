import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface PricingItem {
  service?: string;
  emoji?: string;
  reason?: string;
  basePrice?: number;
  currentPrice?: number;
  discount?: number;
}

export default function SmartPricingScreen(): JSX.Element {
  const { t } = useLocale();
  const itemsQ = trpc.smartPricing.current.useQuery();

  if (itemsQ.isLoading) return <SkeletonList count={4} />;

  const items = (itemsQ.data as unknown as PricingItem[] | null) ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={itemsQ.isRefetching}
          onRefresh={() => itemsQ.refetch()}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.smart-pricing.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.smart-pricing.subtitle')}</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.smart-pricing.empty')}</Text>
      ) : (
        items.map((s) => {
          const isDiscounted = (s.currentPrice ?? 0) < (s.basePrice ?? 0);
          return (
            <View key={s.service} style={styles.card}>
              <Text style={styles.svcEmoji}>{s.emoji ?? ''}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.svcName}>{s.service ?? ''}</Text>
                <Text style={styles.svcReason}>{s.reason ?? ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {isDiscounted && (
                  <Text style={styles.basePrice}>
                    {t('mobile.public.currency', { price: (s.basePrice ?? 0).toLocaleString() })}
                  </Text>
                )}
                <Text
                  style={[
                    styles.currentPrice,
                    isDiscounted ? { color: '#059669' } : { color: '#d97706' },
                  ]}
                >
                  {t('mobile.public.currency', { price: (s.currentPrice ?? 0).toLocaleString() })}
                </Text>
                {(s.discount ?? 0) > 0 && (
                  <Text style={styles.discountBadge}>-{s.discount ?? 0}%</Text>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
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
  svcEmoji: { fontSize: 34 },
  svcName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  svcReason: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  basePrice: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  currentPrice: { fontSize: 20, fontWeight: '800' },
  discountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
});
