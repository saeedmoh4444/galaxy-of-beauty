import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const SL: Record<string, string> = {
  REQUESTED: 'قيد الطلب',
  ACCEPTED: 'مقبول',
  PAID: 'مدفوع',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغي',
  NO_SHOW: 'لم تحضر',
};
const SC: Record<string, { color: string; bg: string }> = {
  REQUESTED: { color: '#d97706', bg: '#fef3c7' },
  ACCEPTED: { color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { color: '#059669', bg: '#dcfce7' },
  CANCELLED: { color: '#dc2626', bg: '#fee2e2' },
  REJECTED: { color: '#dc2626', bg: '#fee2e2' },
  NO_SHOW: { color: '#6b7280', bg: '#f3f4f6' },
  PAID: { color: '#7c3aed', bg: '#ede9fe' },
  IN_PROGRESS: { color: '#7c3aed', bg: '#ede9fe' },
};
const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function BookingDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = (trpc as any).bookings?.getById?.useQuery?.(
    { id: Number(id) },
    { enabled: !!id },
  ) ?? { data: null, isLoading: false, isError: false, refetch: () => {} };
  const data = detail.data as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={detail.isLoading}
      isError={detail.isError}
      isEmpty={!data}
      errorMessage="فشل تحميل الحجز"
      onRetry={() => detail.refetch()}
    >
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.title}>📅 تفاصيل الحجز</Text>
        {(data
          ? [
              { label: 'كود الحجز', value: data.bookingCode as string },
              {
                label: 'الحالة',
                value: SL[data.status as string] ?? (data.status as string),
                color: SC[data.status as string]?.color,
              },
              { label: 'التاريخ', value: new Date(data.startAt as string).toLocaleString('ar-SA') },
              { label: 'المبلغ', value: formatCurrency(Number(data.totalAmount ?? 0)) },
              { label: 'رقم الفنية', value: `#${data.technicianId as number}` },
            ]
          : []
        ).map((row, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={[styles.value, row.color ? { color: row.color } : {}]}>{row.value}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1 },
  i: { padding: 16 },
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 14, color: COLORS.gray400 },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
});
