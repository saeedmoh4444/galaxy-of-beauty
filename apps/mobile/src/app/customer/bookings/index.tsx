import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { DEFAULT_PAGE_SIZE } from '@galaxy/ui';

const STATUS_TABS = ['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'قيد الانتظار',
  ACCEPTED: 'مقبول',
  IN_PROGRESS: 'جاري',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};
const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  CANCELLED: '#dc2626',
  DEFAULT: '#3b82f6',
};
const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function BookingsScreen(): JSX.Element {
  const [status, setStatus] = useState<string | undefined>();
  const bookings = trpc.bookings.list.useQuery({ status, limit: DEFAULT_PAGE_SIZE, page: 1 });
  const data = bookings.data?.bookings as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={bookings.isLoading}
      isError={bookings.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل الحجوزات"
      emptyTitle="لا توجد حجوزات"
      emptyDescription="ابدئي رحلتكِ مع أول حجز"
      onRetry={() => bookings.refetch()}
    >
      <Text style={styles.title}>📅 حجوزاتي</Text>
      <View style={styles.tabs}>
        {STATUS_TABS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatus(s === 'ALL' ? undefined : s)}
            style={[styles.tab, (!status && s === 'ALL') || s === status ? styles.tabActive : {}]}
          >
            <Text
              style={[
                styles.tabText,
                (!status && s === 'ALL') || s === status ? styles.tabTextActive : {},
              ]}
            >
              {s === 'ALL' ? 'الكل' : (STATUS_LABELS[s] ?? s)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {(data as Record<string, unknown>[])?.map((b: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.code}>{b.bookingCode as string}</Text>
            <Text
              style={[
                styles.badge,
                { color: STATUS_COLORS[b.status as string] ?? STATUS_COLORS.DEFAULT },
              ]}
            >
              {STATUS_LABELS[b.status as string] ?? (b.status as string)}
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
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: COLORS.brand },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.gray400 },
  tabTextActive: { color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  code: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  badge: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: COLORS.gray400 },
});
