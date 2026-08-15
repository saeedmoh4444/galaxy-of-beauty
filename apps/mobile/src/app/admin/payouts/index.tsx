import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'معلق', color: '#d97706', bg: '#fef3c7' },
  PROCESSING: { label: 'قيد المعالجة', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { label: 'مكتمل', color: '#059669', bg: '#dcfce7' },
  FAILED: { label: 'فشل', color: '#dc2626', bg: '#fee2e2' },
};

interface Payout {
  id?: number;
  status?: string;
  technicianName?: string;
  amount?: number;
}

export default function AdminPayoutsScreen(): JSX.Element {
  const q = trpc.payouts.listForAdmin.useQuery({});
  const data = (q.data as unknown as { payouts?: Payout[] } | null)?.payouts ?? [];
  const processMut = trpc.payouts.process.useMutation({ onSuccess: () => void q.refetch() });

  const process = (id: number) => {
    processMut.mutate({ payoutId: id });
  };

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل المدفوعات" onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}> المدفوعات للفنيات</Text>
      {data.map((p, i) => {
        const s = STATUS_MAP[p.status ?? ''] ?? {
          label: p.status ?? '',
          color: '#6b7280',
          bg: '#f3f4f6',
        };
        return (
          <View key={i} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tech}>‍ {p.technicianName ?? ''}</Text>
              <Text style={styles.amount}>{(p.amount ?? 0).toLocaleString()} ر.س</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: s.bg }]}>
              <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
            </View>
            {p.status === 'PENDING' && (
              <TouchableOpacity onPress={() => process(p.id ?? 0)} style={styles.btn}>
                <Text style={styles.btnText}>معالجة</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  tech: { fontSize: 14, fontWeight: '600', color: '#111827' },
  amount: { fontSize: 15, fontWeight: '700', color: '#0891b2', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  btn: { backgroundColor: '#0891b2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
