import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { DEFAULT_SAUDI_CITY } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface HomeServiceEstimate {
  totalEstimate?: number;
  estimatedDuration?: string;
}

export default function HomeServiceScreen(): JSX.Element {
  const { t } = useLocale();
  // Fetch-on-demand: the user taps to get an estimate, so keep the query disabled
  // until first request instead of firing on mount
  const estimateQ = trpc.homeService.estimate.useQuery(
    { city: DEFAULT_SAUDI_CITY /* TODO: use user location */ },
    { enabled: false },
  );
  const estimate = estimateQ.data as unknown as HomeServiceEstimate | null;
  if (estimateQ.isLoading) return <SkeletonList count={3} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={estimateQ.isRefetching}
          onRefresh={() => estimateQ.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.homeService.title')}</Text>
      <TouchableOpacity onPress={() => estimateQ.refetch()} style={styles.btn}>
        <Text style={styles.bt}>{t('mobile.homeService.estimate')}</Text>
      </TouchableOpacity>
      {estimate && (
        <View style={styles.card}>
          <Text style={styles.ep}>{(estimate.totalEstimate ?? 0).toLocaleString()} ر.س</Text>
          <Text style={styles.em}>️ {estimate.estimatedDuration ?? ''}</Text>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  btn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  ep: { fontSize: 28, fontWeight: '800', color: '#059669' },
  em: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
