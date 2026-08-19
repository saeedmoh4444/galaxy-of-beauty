import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@galaxy/ui';
import type { TranslationKey } from '@galaxy/shared';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

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

const STATUS_LABELS: Record<string, TranslationKey> = {
  REQUESTED: 'status.pending',
  ACCEPTED: 'booking.status.ACCEPTED',
  COMPLETED: 'booking.status.COMPLETED',
  CANCELLED: 'booking.status.CANCELLED',
  REJECTED: 'booking.status.REJECTED',
  IN_PROGRESS: 'groupBookings.status.inProgress',
  NO_SHOW: 'booking.status.NO_SHOW',
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: COLORS.success,
  CANCELLED: COLORS.danger,
  REJECTED: COLORS.danger,
  DEFAULT: COLORS.info,
};

export default function BookingsScreen(): JSX.Element {
  const [page] = useState(1);
  const { t, locale } = useLocale();
  const bookings = trpc.bookings.list.useQuery({ page, limit: DEFAULT_PAGE_SIZE });
  const data = bookings.data?.bookings as unknown[] | undefined;
  const loyalty = trpc.loyalty.myAccount.useQuery();

  return (
    <ScreenState
      isLoading={bookings.isLoading}
      isError={bookings.isError}
      isEmpty={!data || (data as unknown[]).length === 0}
      errorMessage={t('booking.load-error')}
      emptyTitle={t('booking.no-bookings')}
      emptyDescription={t('dashboard.start-journey')}
      emptyAction={{ label: t('button.bookNow'), onPress: () => {} }}
      onRetry={() => bookings.refetch()}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('mobile.core.bookingsTitle')}</Text>
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
                {new Date(b.startAt as string).toLocaleDateString(
                  locale === 'en' ? 'en-GB' : 'ar-SA',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                )}
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
              {STATUS_LABELS[b.status as string]
                ? t(STATUS_LABELS[b.status as string])
                : (b.status as string)}
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
