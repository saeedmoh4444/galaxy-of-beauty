import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface SaleAlert {
  id?: number;
  emoji?: string;
  serviceName?: string;
  discount?: number;
}

export default function SaleAlertsScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const alertsQ = trpc.saleAlerts.myAlerts.useQuery(undefined, { enabled: isAuthed });
  const data: SaleAlert[] = (alertsQ.data as unknown as SaleAlert[] | undefined) ?? [];

  if (alertsQ.isLoading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={alertsQ.isRefetching}
          onRefresh={() => alertsQ.refetch()}
          colors={['#dc2626']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.saleAlerts.title')}</Text>
      {data.map((a, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{a.emoji ?? '️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{a.serviceName}</Text>
            <Text style={styles.discount}>-{a.discount}%</Text>
          </View>
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
    marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  discount: { fontSize: 13, fontWeight: '700', color: '#dc2626', marginTop: 2 },
});
