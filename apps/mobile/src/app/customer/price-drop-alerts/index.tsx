import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface PriceDropAlert {
  id?: number;
  emoji?: string;
  serviceName?: string;
  droppedBy?: number;
}

export default function PriceDropAlertsScreen(): JSX.Element {
  const alertsQ = trpc.priceDropAlerts.myAlerts.useQuery();
  const data: PriceDropAlert[] = (alertsQ.data as unknown as PriceDropAlert[] | undefined) ?? [];

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
      <Text style={styles.t}> تنبيهات الأسعار</Text>
      {data.map((a, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{a.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{a.serviceName ?? ''}</Text>
            <Text style={styles.drop}> {(a.droppedBy ?? 0).toLocaleString()} ر.س</Text>
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
  drop: { fontSize: 13, fontWeight: '700', color: '#059669', marginTop: 2 },
});
