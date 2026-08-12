import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

export default function TechEarningsScreen(): JSX.Element {
  const earnings = (trpc as any).payouts?.list?.useQuery?.({}) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = earnings.data as Record<string, unknown> | undefined;
  const items = data?.items as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={earnings.isLoading}
      isError={earnings.isError}
      isEmpty={!data}
      errorMessage="فشل تحميل الأرباح"
      onRetry={() => earnings.refetch()}
    >
      <Text style={styles.title}> أرباحي</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>إجمالي الأرباح</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(Number(data?.totalEarnings ?? 0))}</Text>
      </View>
      {items && items.length > 0 && (
        <FlatList
          data={items as any[]}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.txnRow}>
              <View>
                <Text style={styles.txnPeriod}>
                  {item.periodStart ? new Date(item.periodStart).toLocaleDateString('ar-SA') : ''}
                </Text>
                <Text style={styles.txnStatus}>{item.status as string}</Text>
              </View>
              <Text style={styles.txnAmount}>{formatCurrency(Number(item.amount ?? 0))}</Text>
            </View>
          )}
        />
      )}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  summaryAmount: { fontSize: 32, fontWeight: '800', color: COLORS.white, marginTop: 8 },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  txnPeriod: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
  txnStatus: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: '700', color: COLORS.brand },
});
