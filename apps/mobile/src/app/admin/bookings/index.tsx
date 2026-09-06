import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { BULK_PAGE_SIZE } from '@galaxy/ui';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import type { TranslationKey } from '@galaxy/shared';

interface BookingItem {
  bookingCode?: string;
  startAt?: string;
  status?: string;
}

const STATUS_MAP: Record<string, TranslationKey> = {
  REQUESTED: 'admin.analytics.pending',
  ACCEPTED: 'booking.status.ACCEPTED',
  COMPLETED: 'booking.status.COMPLETED',
  CANCELLED: 'booking.status.CANCELLED',
  REJECTED: 'booking.status.REJECTED',
  PAID: 'booking.status.PAID',
  IN_PROGRESS: 'booking.status.IN_PROGRESS',
  NO_SHOW: 'booking.status.NO_SHOW',
  CONFIRMED_OFFLINE: 'booking.status.CONFIRMED_OFFLINE',
  PAYMENT_AUTHORIZED: 'booking.status.PAYMENT_AUTHORIZED',
};

export default function AdminBookingsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const q = trpc.bookings.list.useQuery({ page: 1, limit: BULK_PAGE_SIZE }, { enabled: isAuthed });
  const data = (q.data as unknown as { bookings?: BookingItem[] } | null)?.bookings ?? [];

  if (q.isLoading) return <SkeletonList count={6} />;
  if (q.isError)
    return <ErrorAlert message={t('admin.bookings.load-error')} onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.admin.bookings.title')}</Text>
      {data.map((b, i) => (
        <View key={i} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.code}>{b.bookingCode}</Text>
            <Text style={styles.date}>
              {new Date(b.startAt ?? '').toLocaleDateString(locale === 'en' ? 'en-US' : 'ar-SA')}
            </Text>
          </View>
          <Text style={styles.status}>
            {b.status && STATUS_MAP[b.status] ? t(STATUS_MAP[b.status]) : b.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  code: { fontSize: 13, fontWeight: '600', color: '#111827', fontFamily: 'monospace' },
  date: { fontSize: 12, color: '#6b7280' },
  status: { fontSize: 12, fontWeight: '600', color: '#4f46e5' },
});
