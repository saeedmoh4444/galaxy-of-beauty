import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency, MAX_LIST_SIZE } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

export default function ServiceHistoryScreen(): JSX.Element {
  const bookings = trpc.bookings.list.useQuery({ limit: MAX_LIST_SIZE });
  const data = bookings.data?.bookings as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={bookings.isLoading}
      isError={bookings.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل السجل"
      emptyTitle="لا يوجد سجل خدمات"
      emptyDescription="ستظهر خدماتكِ السابقة هنا"
      onRetry={() => bookings.refetch()}
    >
      <Text style={styles.title}> سجل الخدمات</Text>
      <FlatList
        data={data as any[]}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }: { item: Record<string, unknown> }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.code}>{item.bookingCode as string}</Text>
              <Text style={styles.date}>
                {new Date(item.startAt as string).toLocaleDateString('ar-SA')}
              </Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(Number(item.totalAmount ?? 0))}</Text>
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
  code: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
  date: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700', color: COLORS.brand },
});
