import type { JSX } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface BundleItem {
  id?: number;
  titleJson?: { ar?: string; en?: string };
  descriptionJson?: { ar?: string; en?: string } | null;
  serviceIds?: number[];
  originalPrice?: number | string;
  totalPrice?: number | string;
}

const num = (v: number | string | undefined): number => Number(v) || 0;

// 1.2 Service Bundles — public catalog (mobile mirror of /bundles).
export default function BundlesListScreen(): JSX.Element {
  const router = useRouter();
  const { t, locale } = useLocale();
  const q = trpc.beautyBundles.list.useQuery();
  const bundles = (q.data as unknown as BundleItem[] | undefined) ?? [];

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert message={t('mobile.public.marketplace.load-error')} onRetry={() => q.refetch()} />
    );

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={async () => {
            await q.refetch();
          }}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>{t('bundles.title')}</Text>
      <Text style={styles.s}>{t('bundles.subtitle')}</Text>
      {bundles.length === 0 ? (
        <Text style={styles.empty}>{t('bundles.empty')}</Text>
      ) : (
        bundles.map((b) => {
          const original = num(b.originalPrice);
          const total = num(b.totalPrice);
          const savings = Math.round((original - total) * 100) / 100;
          return (
            <TouchableOpacity
              key={b.id}
              testID={`bundle-card-${b.id}`}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({ pathname: '/bundles/[id]', params: { id: String(b.id) } })
              }
            >
              <View style={styles.head}>
                <Text style={styles.ct}>{localize(b.titleJson, locale)}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {t('bundles.saveLabel')} {savings.toFixed(0)} {t('misc.sar')}
                  </Text>
                </View>
              </View>
              {b.descriptionJson ? (
                <Text style={styles.cd}>{localize(b.descriptionJson, locale)}</Text>
              ) : null}
              <View style={styles.foot}>
                <Text style={styles.cc}>
                  {t('bundles.servicesCount', { count: (b.serviceIds ?? []).length })}
                </Text>
                <Text style={styles.cp}>
                  <Text style={styles.cpo}>
                    {original.toFixed(0)} {t('misc.sar')}
                  </Text>{' '}
                  {total.toFixed(0)} {t('misc.sar')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center' },
  s: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  empty: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  ct: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  badge: {
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#15803d' },
  cd: { fontSize: 12, color: '#6b7280', marginTop: 6, textAlign: 'right' },
  foot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cc: { fontSize: 12, color: '#9ca3af' },
  cp: { fontSize: 16, fontWeight: '800', color: '#db2777' },
  cpo: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
});
