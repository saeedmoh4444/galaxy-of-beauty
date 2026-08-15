import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface SubscriptionData {
  planName?: string;
  autoRenew?: boolean;
}

export default function MySubscriptionScreen(): JSX.Element {
  const subQ = trpc.subscriptions.getMySubscription.useQuery();
  const data = subQ.data as SubscriptionData | null;

  if (subQ.isLoading) return <SkeletonList count={3} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={subQ.isRefetching}
          onRefresh={() => subQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}> اشتراكي</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.plan}>{data.planName ?? 'غير مشترك'}</Text>
          <Text style={styles.status}>{data.autoRenew ? 'تجديد تلقائي' : 'بدون تجديد'}</Text>
        </View>
      ) : (
        <Text style={styles.e}>لا يوجد اشتراك نشط</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  plan: { fontSize: 18, fontWeight: '700', color: '#111827' },
  status: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
