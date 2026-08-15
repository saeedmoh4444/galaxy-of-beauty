import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

interface DisputeItem {
  status?: string;
  reason?: string;
  createdAt?: string;
}

export default function AdminDisputesScreen(): JSX.Element {
  const q = trpc.disputes.list.useQuery({});
  const data = (q.data as unknown as { items?: DisputeItem[] } | null)?.items ?? [];

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل النزاعات" onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#dc2626']}
        />
      }
    >
      <Text style={styles.t}>️ النزاعات</Text>
      {data.map((d, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.status}>{d.status}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.reason}>{d.reason}</Text>
            <Text style={styles.date}>
              {new Date(d.createdAt ?? '').toLocaleDateString('ar-SA')}
            </Text>
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
  status: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reason: { fontSize: 13, fontWeight: '600', color: '#111827' },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
