import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ServiceTrend {
  emoji?: string;
  nameAr?: string;
  trend?: string;
  growth?: number;
}

export default function ServiceTrendsScreen(): JSX.Element {
  const { t } = useLocale();
  const dataQ = trpc.serviceTrends.trends.useQuery();

  if (dataQ.isLoading) return <SkeletonList count={4} />;

  const data = (dataQ.data as unknown as { monthly?: ServiceTrend[] } | null)?.monthly ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={dataQ.isRefetching}
          onRefresh={() => dataQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.service-trends.title')}</Text>
      {data.map((s, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.em}>{s.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{s.nameAr ?? ''}</Text>
            <Text style={styles.meta}>
              {s.trend ?? ''} ·{' '}
              {t('mobile.public.service-trends.growth', { growth: s.growth ?? 0 })}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
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
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
