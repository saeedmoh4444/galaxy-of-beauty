import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@galaxy/ui';
import { ScreenState } from '@/components/ScreenState';
import { trpc, typedTrpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray50: '#faf5ff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  danger: '#ef4444',
  info: '#3b82f6',
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'قيد الانتظار',
  ACCEPTED: 'مقبول',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  REJECTED: 'مرفوض',
  IN_PROGRESS: 'جاري',
  NO_SHOW: 'لم تحضر',
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: COLORS.success,
  CANCELLED: COLORS.danger,
  REJECTED: COLORS.danger,
  DEFAULT: COLORS.info,
};

export default function BookingsScreen(): JSX.Element {
  const [page] = useState(1);
  const bookings = trpc.bookings.list.useQuery({ page, limit: DEFAULT_PAGE_SIZE });
  const data = bookings.data?.bookings as unknown[] | undefined;
  const loyalty = typedTrpc().loyalty?.getAccount?.useQuery?.();

  return (
    <ScreenState
      isLoading={bookings.isLoading}
      isError={bookings.isError}
      isEmpty={!data || (data as unknown[]).length === 0}
      errorMessage="فشل تحميل الحجوزات"
      emptyTitle="لا توجد حجوزات"
      emptyDescription="ابدئي رحلتكِ مع أول حجز"
      emptyAction={{ label: 'احجزي الآن', onPress: () => {} }}
      onRetry={() => bookings.refetch()}
    >
      <View style={styles.header}>
        <Text style={styles.title}> حجوزاتي</Text>
        {loyalty?.data && (
          <View style={styles.loyaltyBadge}>
            <Text style={styles.loyaltyText}> {loyalty.data.points ?? 0}</Text>
          </View>
        )}
      </View>
      {(data as Record<string, unknown>[])?.map((b: Record<string, unknown>, i: number) => (
        <TouchableOpacity key={i} style={styles.card} activeOpacity={0.7}>
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.code}>{b.bookingCode as string}</Text>
              <Text style={styles.date}>
                {new Date(b.startAt as string).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.status,
                {
                  color: STATUS_COLORS[b.status as string] ?? STATUS_COLORS.DEFAULT,
                },
              ]}
            >
              {STATUS_LABELS[b.status as string] ?? (b.status as string)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flex: 1 },
  code: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  date: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  status: { fontSize: 13, fontWeight: '600' },
  loyaltyBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  loyaltyText: { fontSize: 13, fontWeight: '700', color: '#d97706' },
});
