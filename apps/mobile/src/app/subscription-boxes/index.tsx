import type { JSX } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { localize } from '@galaxy/shared';

interface Plan {
  id?: number;
  nameJson?: { ar?: string; en?: string };
  descriptionJson?: { ar?: string; en?: string };
  interval?: string;
  price?: number;
  servicesPerMonth?: number;
  discountPercent?: number;
  priorityBooking?: boolean;
  freeHomeService?: boolean;
  dedicatedTechnician?: boolean;
}

interface MySub {
  id?: number;
  status?: string;
  autoRenew?: boolean;
  bookingsThisMonth?: number;
  currentPeriodEnd?: string;
  plan?: Plan;
}

export default function SubscriptionBoxesScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const q = trpc.subscriptionBoxes.plans.useQuery();
  const subsQ = trpc.subscriptionBoxes.mySubscriptions.useQuery(undefined, {
    enabled: isAuthed,
  });
  const subscribeMut = trpc.subscriptionBoxes.subscribe.useMutation({
    onSuccess: () => void subsQ.refetch(),
    onError: (e) => {
      // "Already subscribed" is benign on mobile — show nothing extra.
      if (!/Already subscribed/.test(e.message)) throw e;
    },
  });
  const pauseMut = trpc.subscriptionBoxes.pause.useMutation({
    onSuccess: () => void subsQ.refetch(),
  });
  const resumeMut = trpc.subscriptionBoxes.resume.useMutation({
    onSuccess: () => void subsQ.refetch(),
  });
  const cancelMut = trpc.subscriptionBoxes.cancel.useMutation({
    onSuccess: () => void subsQ.refetch(),
  });
  const renewMut = trpc.subscriptionBoxes.setAutoRenew.useMutation({
    onSuccess: () => void subsQ.refetch(),
  });

  const plans = (q.data as unknown as Plan[] | null) ?? [];
  const subs = (subsQ.data as unknown as MySub[] | undefined) ?? [];
  const intervalLabel = (i?: string) =>
    i === 'YEARLY'
      ? t('marketing.plans.interval-yearly')
      : i === 'WEEKLY'
        ? t('marketing.plans.interval-weekly')
        : i === 'BIWEEKLY'
          ? t('marketing.plans.interval-biweekly')
          : t('marketing.plans.interval-monthly');

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.subscription-boxes.load-error')}
        onRetry={() => q.refetch()}
      />
    );

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={async () => {
            await q.refetch();
          }}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}>{t('marketing.plans.title')}</Text>

      {/* 2.2 SUB-3 — my subscriptions management */}
      {isAuthed && subs.length > 0 ? (
        <View style={styles.mySection}>
          <Text style={styles.myTitle}>{t('marketing.plans.my-title')}</Text>
          {subs.map((sub) => (
            <View key={sub.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bn}>{localize(sub.plan?.nameJson, locale)}</Text>
                <Text style={styles.bd}>
                  {t('marketing.plans.my-usage')}: {sub.bookingsThisMonth ?? 0}/
                  {sub.plan?.servicesPerMonth ?? 0}
                  {sub.plan?.discountPercent ? ` · ${sub.plan.discountPercent}%` : ''}
                </Text>
                <Text style={styles.bi}>
                  {t('marketing.plans.my-renewal')}:{' '}
                  {sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                      )
                    : ''}
                </Text>
              </View>
              <View style={styles.subActions}>
                <TouchableOpacity
                  style={styles.miniBtn}
                  onPress={() =>
                    renewMut.mutate({ id: sub.id!, autoRenew: !(sub.autoRenew ?? true) })
                  }
                >
                  <Text style={styles.miniBtnText}>
                    {sub.autoRenew
                      ? t('marketing.plans.my-autorenew-disable')
                      : t('marketing.plans.my-autorenew-enable')}
                  </Text>
                </TouchableOpacity>
                {sub.status === 'ACTIVE' ? (
                  <>
                    <TouchableOpacity
                      style={styles.miniBtn}
                      onPress={() => pauseMut.mutate({ id: sub.id! })}
                    >
                      <Text style={styles.miniBtnText}>{t('marketing.plans.my-pause')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.miniBtn, styles.miniBtnDanger]}
                      onPress={() => cancelMut.mutate({ id: sub.id! })}
                    >
                      <Text style={[styles.miniBtnText, styles.miniBtnDangerText]}>
                        {t('marketing.plans.my-cancel')}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : sub.status === 'PAUSED' ? (
                  <TouchableOpacity
                    style={styles.miniBtn}
                    onPress={() => resumeMut.mutate({ id: sub.id! })}
                  >
                    <Text style={styles.miniBtnText}>{t('marketing.plans.my-resume')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {plans.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bn}>{localize(p.nameJson, locale)}</Text>
            <Text style={styles.bd}>{localize(p.descriptionJson, locale)?.substring(0, 90)}</Text>
            <Text style={styles.bi}>
              {t('marketing.plans.bookings-per-month', { count: p.servicesPerMonth ?? 0 })} ·{' '}
              {intervalLabel(p.interval)}
              {p.discountPercent ? ` · ${p.discountPercent}% off` : ''}
            </Text>
            {(p.priorityBooking || p.freeHomeService || p.dedicatedTechnician) && (
              <Text style={styles.perks}>
                {[
                  p.priorityBooking ? t('marketing.plans.priority-booking') : '',
                  p.freeHomeService ? t('marketing.plans.free-home-service') : '',
                  p.dedicatedTechnician ? t('marketing.plans.dedicated-technician') : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bp}>
              {t('mobile.public.currency', { price: p.price?.toLocaleString() ?? '' })}
            </Text>
            <Text style={styles.bper}>{intervalLabel(p.interval)}</Text>
            <TouchableOpacity
              style={styles.sb}
              onPress={() => subscribeMut.mutate({ planId: p.id! })}
              disabled={subscribeMut.isPending}
            >
              <Text style={styles.sbt}>{t('marketing.plans.subscribe-now')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  mySection: { marginBottom: 16 },
  myTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6d28d9',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  bn: { fontSize: 14, fontWeight: '700', color: '#111827' },
  bd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  bi: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  perks: { fontSize: 11, color: '#7c3aed', marginTop: 2, fontWeight: '600' },
  bp: { fontSize: 16, fontWeight: '800', color: '#7c3aed' },
  bper: { fontSize: 11, color: '#9ca3af' },
  sb: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  sbt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  subActions: { alignItems: 'flex-end', gap: 6 },
  miniBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  miniBtnText: { fontSize: 11, fontWeight: '700', color: '#7c3aed' },
  miniBtnDanger: { backgroundColor: '#fef2f2' },
  miniBtnDangerText: { color: '#dc2626' },
});
