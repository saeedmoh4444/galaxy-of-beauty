import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  danger: '#dc2626',
  info: '#3b82f6',
};
const STATUS: Record<string, string> = {
  REQUESTED: 'قيد الانتظار',
  ACCEPTED: 'مقبول',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  IN_PROGRESS: 'جاري',
  NO_SHOW: 'لم تحضر',
};
const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  CANCELLED: '#dc2626',
  REJECTED: '#dc2626',
  DEFAULT: '#3b82f6',
};

export default function TechBookingsScreen(): JSX.Element {
  const bookings = (trpc as any).bookings?.listForTechnician?.useQuery?.({ limit: 20 }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = bookings.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={bookings.isLoading}
      isError={bookings.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل الحجوزات"
      emptyTitle="لا توجد حجوزات"
      onRetry={() => bookings.refetch()}
    >
      <Text style={styles.title}> حجوزاتي</Text>
      {(data as Record<string, unknown>[])?.map((b: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.code}>{b.bookingCode as string}</Text>
            <Text
              style={[
                styles.statusBadge,
                { color: STATUS_COLORS[b.status as string] ?? STATUS_COLORS.DEFAULT },
              ]}
            >
              {STATUS[b.status as string] ?? (b.status as string)}
            </Text>
          </View>
          <Text style={styles.date}>{new Date(b.startAt as string).toLocaleString('ar-SA')}</Text>
        </View>
      ))}
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
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  code: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  statusBadge: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: COLORS.gray400 },
});
