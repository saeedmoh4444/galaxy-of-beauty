import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { typedTrpc } from '@/lib/trpc-react';
import { formatCurrency, EXTENDED_PAGE_SIZE } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  danger: '#dc2626',
};

export default function PaymentsScreen(): JSX.Element {
  const payments = typedTrpc().payments?.list?.useQuery?.({ limit: EXTENDED_PAGE_SIZE }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = payments.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={payments.isLoading}
      isError={payments.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل المدفوعات"
      emptyTitle="لا توجد مدفوعات"
      onRetry={() => payments.refetch()}
    >
      <Text style={styles.title}> المدفوعات</Text>
      <FlatList
        data={data as Record<string, unknown>[]}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }: { item: Record<string, unknown> }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.desc}>حجز #{item.bookingId as number}</Text>
              <Text style={styles.date}>
                {new Date(item.createdAt as string).toLocaleDateString('ar-SA')}
              </Text>
            </View>
            <Text
              style={[
                styles.amount,
                { color: item.status === 'CAPTURED' ? COLORS.success : COLORS.danger },
              ]}
            >
              {formatCurrency(Number(item.amount ?? 0))}
            </Text>
          </View>
        )}
      />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  desc: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
  date: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700' },
});
