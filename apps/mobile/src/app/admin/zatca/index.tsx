import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

interface ZatcaInvoiceItem {
  invoiceNumber?: string;
  totalAmount?: number;
  createdAt?: string;
}

export default function AdminZatcaScreen(): JSX.Element {
  const q = trpc.zatca.listInvoices.useQuery({});
  const data = (q.data as unknown as { items?: ZatcaInvoiceItem[] } | null)?.items ?? [];

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل الفواتير" onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> الفوترة (ZATCA)</Text>
      {data.map((inv, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.invNum}>{inv.invoiceNumber}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.amount}>{inv.totalAmount?.toLocaleString()} ر.س</Text>
          </View>
          <Text style={styles.invDate}>
            {new Date(inv.createdAt ?? '').toLocaleDateString('ar-SA')}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  invNum: { fontSize: 13, fontWeight: '700', color: '#111827', fontFamily: 'monospace' },
  amount: { fontSize: 14, fontWeight: '600', color: '#059669' },
  invDate: { fontSize: 11, color: '#9ca3af' },
});
