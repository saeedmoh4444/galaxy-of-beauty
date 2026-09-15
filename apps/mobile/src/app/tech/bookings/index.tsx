import type { JSX } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

// K2 (kids plan) — family member preference → localized label mapping.
const PREF_LABEL_KEYS: Record<string, string> = {
  gentle: 'mobile.booking.pref.gentle',
  hypoallergenic: 'mobile.booking.pref.hypoallergenic',
  fragrance_free: 'mobile.booking.pref.fragrance_free',
  natural: 'mobile.booking.pref.natural',
  quick: 'mobile.booking.pref.quick',
  quiet: 'mobile.booking.pref.quiet',
};

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  danger: '#dc2626',
  info: '#3b82f6',
};
const STATUS: Record<string, TranslationKey> = {
  REQUESTED: 'admin.analytics.pending',
  ACCEPTED: 'booking.status.ACCEPTED',
  COMPLETED: 'booking.status.COMPLETED',
  CANCELLED: 'booking.status.CANCELLED',
  IN_PROGRESS: 'mobile.tech.bookings.status-in-progress',
  NO_SHOW: 'booking.status.NO_SHOW',
};
const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  CANCELLED: '#dc2626',
  REJECTED: '#dc2626',
  DEFAULT: '#3b82f6',
};

export default function TechBookingsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isAuthed = useAuthState();
  const bookings = trpc.bookings.list.useQuery({ limit: 20 }, { enabled: isAuthed }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = bookings.data as unknown as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={bookings.isLoading}
      isError={bookings.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('tech.bookings.load-error')}
      emptyTitle={t('tech.bookings.empty')}
      onRetry={() => bookings.refetch()}
    >
      <Text style={styles.title}>{t('mobile.tech.bookings.title')}</Text>
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
              {STATUS[b.status as string] ? t(STATUS[b.status as string]) : (b.status as string)}
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(b.startAt as string).toLocaleString(locale === 'en' ? 'en-US' : 'ar-SA')}
          </Text>
          {b.familyMember ? (
            <>
              <Text style={styles.onBehalf}>
                {t('mobile.booking.on-behalf-of', {
                  name: (b.familyMember as Record<string, unknown>).name as string,
                })}
              </Text>
              {/* K2 — gentle/hypoallergenic hints from the member profile */}
              {(
                (b.familyMember as Record<string, unknown>).preferences as string[] | undefined
              )?.map((pref) => (
                <Text key={pref} style={styles.prefChip}>
                  {t((PREF_LABEL_KEYS[pref] as TranslationKey) ?? 'mobile.booking.family-member')}
                </Text>
              ))}
            </>
          ) : null}
          {(b.status === 'PAID' || b.status === 'IN_PROGRESS') && (
            <TouchableOpacity
              style={styles.videoBtn}
              onPress={() => router.push(`/tech/video/${b.id}` as never)}
            >
              <Text style={styles.videoBtnText}>{t('mobile.booking.video-call')}</Text>
            </TouchableOpacity>
          )}
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
  onBehalf: { fontSize: 12, color: COLORS.brand, marginTop: 2, fontWeight: '600' },
  prefChip: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  videoBtn: {
    marginTop: 10,
    backgroundColor: COLORS.brand,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  videoBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
});
