import type { JSX } from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc, trpcClient } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared/i18n-mobile';
import { scheduleNextRun } from '@/utils/vendorEarnings';

const SCHEDULES = ['MANUAL', 'WEEKLY', 'MONTHLY'] as const;

const SCHEDULE_LABELS: Record<(typeof SCHEDULES)[number], string> = {
  MANUAL: 'mobile.vendorPortal.earnings.scheduleManual',
  WEEKLY: 'mobile.vendorPortal.earnings.scheduleWeekly',
  MONTHLY: 'mobile.vendorPortal.earnings.scheduleMonthly',
};

/** E4 — earnings glance: pending/processed nets, payout schedule +
 *  next-run estimate, and per-payout invoice sharing via the native
 *  share sheet (the CSV comes from the A2 payoutInvoice procedure). */
export default function VendorEarningsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const q = trpc.vendorPortal.earnings.useQuery(undefined, { enabled: isAuthed });
  const setScheduleMut = trpc.vendorPortal.setPayoutSchedule.useMutation({
    onSuccess: () => void q.refetch(),
  });
  const [sharingId, setSharingId] = useState<number | null>(null);

  const data = q.data;
  const summary = data?.summary;
  const schedule = data?.payoutSchedule ?? 'MANUAL';
  const nextRun = scheduleNextRun(schedule, data?.lastPayoutRunAt);

  const shareInvoice = async (payoutId: number) => {
    try {
      setSharingId(payoutId);
      const { csv } = await trpcClient.vendorPortal.payoutInvoice.query({ payoutId, locale });
      await Share.share({
        message: csv,
        title: t('mobile.vendorPortal.earnings.shareInvoice'),
      });
    } catch {
      // Share sheet dismissed or fetch failed — never fatal on mobile.
    } finally {
      setSharingId(null);
    }
  };

  const rows = data?.rows ?? [];

  return (
    <ScreenState
      isLoading={q.isLoading}
      isError={q.isError}
      isEmpty={false}
      errorMessage={t('mobile.vendorPortal.earnings.loadError')}
      onRetry={() => void q.refetch()}
    >
      <ScrollView
        style={styles.c}
        contentContainerStyle={styles.i}
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching}
            onRefresh={() => void q.refetch()}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('mobile.vendorPortal.earnings.title')}</Text>
          <Text style={styles.commission}>
            {t('mobile.vendorPortal.earnings.commission', { rate: data?.commissionRate ?? 0 })}
          </Text>
        </View>

        <View style={styles.kr}>
          <View style={styles.k}>
            <Text style={styles.ke}>⏳</Text>
            <Text style={styles.kv}>
              {Number(summary?.pendingNet ?? 0).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}
            </Text>
            <Text style={styles.kl}>{t('mobile.vendorPortal.earnings.pending')}</Text>
          </View>
          <View style={styles.k}>
            <Text style={styles.ke}>✅</Text>
            <Text style={[styles.kv, { color: '#059669' }]}>
              {Number(summary?.processedNet ?? 0).toLocaleString(
                locale === 'ar' ? 'ar-SA' : 'en-GB',
              )}
            </Text>
            <Text style={styles.kl}>{t('mobile.vendorPortal.earnings.processed')}</Text>
          </View>
          <View style={styles.k}>
            <Text style={styles.ke}>🧾</Text>
            <Text style={styles.kv}>
              {Number(summary?.totalFee ?? 0).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}
            </Text>
            <Text style={styles.kl}>{t('mobile.vendorPortal.earnings.fee')}</Text>
          </View>
        </View>

        {/* A2 — payout schedule: pick the cadence, see the next-run estimate. */}
        <View style={styles.card}>
          <Text style={styles.section}>{t('mobile.vendorPortal.earnings.schedule')}</Text>
          <View style={styles.chips}>
            {SCHEDULES.map((s) => (
              <TouchableOpacity
                key={s}
                disabled={setScheduleMut.isPending}
                onPress={() => setScheduleMut.mutate({ schedule: s })}
                style={[styles.chip, schedule === s && styles.chipActive]}
              >
                <Text style={[styles.chipText, schedule === s && styles.chipTextActive]}>
                  {t(SCHEDULE_LABELS[s] as TranslationKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {schedule === 'MANUAL' ? (
            <Text style={styles.hint}>{t('mobile.vendorPortal.earnings.manualHint')}</Text>
          ) : (
            <>
              {data?.lastPayoutRunAt ? (
                <Text style={styles.hint}>
                  {t('mobile.vendorPortal.earnings.lastRun', {
                    date: new Date(data.lastPayoutRunAt).toLocaleString(
                      locale === 'ar' ? 'ar-SA' : 'en-GB',
                    ),
                  })}
                </Text>
              ) : null}
              {nextRun ? (
                <Text style={styles.hint}>
                  {t('mobile.vendorPortal.earnings.nextRun', {
                    date: nextRun.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB'),
                  })}
                </Text>
              ) : null}
            </>
          )}
        </View>

        <Text style={styles.section}>{t('mobile.vendorPortal.earnings.title')}</Text>
        {rows.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.empty}>{t('mobile.vendorPortal.earnings.noPayouts')}</Text>
          </View>
        ) : (
          rows.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.payoutId}>#{p.id}</Text>
                <Text
                  style={[
                    styles.statusChip,
                    p.status === 'COMPLETED'
                      ? { backgroundColor: '#ecfdf5', color: '#059669' }
                      : { backgroundColor: '#fffbeb', color: '#d97706' },
                  ]}
                >
                  {p.status === 'COMPLETED'
                    ? t('mobile.vendorPortal.earnings.processed')
                    : t('mobile.vendorPortal.earnings.pending')}
                </Text>
              </View>
              <View style={[styles.row, styles.payoutFooter]}>
                <Text style={styles.payoutDate}>
                  {p.periodEnd
                    ? new Date(p.periodEnd).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')
                    : ''}
                </Text>
                <TouchableOpacity
                  disabled={sharingId === p.id}
                  onPress={() => p.id && void shareInvoice(p.id)}
                  style={styles.shareBtn}
                >
                  <Text style={styles.shareText}>
                    {t('mobile.vendorPortal.earnings.shareInvoice')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#7c3aed' },
  commission: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  kr: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center' },
  ke: { fontSize: 22, marginBottom: 4 },
  kv: { fontSize: 16, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 10, color: '#9ca3af', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  section: { fontSize: 13, fontWeight: '800', color: '#6b7280', marginBottom: 8 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  chipActive: { backgroundColor: '#7c3aed' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  chipTextActive: { color: '#fff' },
  hint: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  payoutId: { fontSize: 14, fontWeight: '800', color: '#111827' },
  statusChip: {
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  payoutFooter: { marginTop: 8 },
  payoutDate: { fontSize: 11, color: '#9ca3af' },
  shareBtn: {
    backgroundColor: '#faf5ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  shareText: { fontSize: 12, fontWeight: '700', color: '#7c3aed' },
  empty: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
});
