import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/components/Toast';

interface GymDetail {
  id?: number;
  storeName?: string;
  gymType?: string | null;
  gymCity?: string | null;
  gymAddress?: string | null;
  licenseVerifiedAt?: string | null;
  descriptionJson?: { ar?: string; en?: string } | null;
  ratingAvg?: number;
  totalReviews?: number;
  plans?: Array<Record<string, unknown>>;
  dayPasses?: Array<Record<string, unknown>>;
}

export default function GymDetailScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const isAuthed = useAuthState();
  const { showToast } = useToast();

  const detailQ = trpc.gyms.detail.useQuery({ slug: slug ?? '' });
  const classesQ = trpc.gyms.classes.useQuery(
    {
      gymId: (detailQ.data as unknown as GymDetail | null)?.id ?? 0,
      from: new Date().toISOString(),
      to: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    },
    { enabled: !!detailQ.data },
  );
  const bookMut = trpc.gyms.bookClass.useMutation({
    onSuccess: () => {
      showToast('success', t('mobile.gyms.booked'));
      classesQ.refetch();
    },
    onError: (e) => showToast('error', e.message),
  });
  const subscribeMut = trpc.subscriptionBoxes.subscribe.useMutation({
    onSuccess: () => showToast('success', t('mobile.gyms.subscribe')),
    onError: (e) => showToast('error', e.message),
  });
  const buyPassMut = trpc.classPass.purchase.useMutation({
    onSuccess: () => showToast('success', t('mobile.gyms.buy')),
    onError: (e) => showToast('error', e.message),
  });

  const gym = detailQ.data as unknown as GymDetail | null;
  const classes = (classesQ.data as Array<Record<string, unknown>> | undefined) ?? [];
  const plans = gym?.plans ?? [];
  const passes = gym?.dayPasses ?? [];

  if (detailQ.isLoading) return <SkeletonList count={4} />;
  if (detailQ.isError || !gym)
    return <ErrorAlert message={t('mobile.gyms.not-found')} onRetry={() => detailQ.refetch()} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={detailQ.isRefetching} onRefresh={() => detailQ.refetch()} />
      }
    >
      <Text style={s.name}>{gym.storeName}</Text>
      <Text style={s.meta}>
        {t(`gyms.type.${gym.gymType ?? ''}` as never)} · {gym.gymCity ?? ''} ·{' '}
        {gym.gymAddress ?? ''}
      </Text>
      {gym.licenseVerifiedAt ? <Text style={s.badge}>{t('mobile.gyms.verified')}</Text> : null}

      {/* Group classes */}
      <Text style={s.section}>{t('mobile.gyms.classes')}</Text>
      {classes.length === 0 ? (
        <Text style={s.empty}>{t('mobile.gyms.no-classes')}</Text>
      ) : (
        classes.map((c) => {
          const spots = Number(c.spotsLeft ?? 0);
          return (
            <View key={c.id as number} style={s.row}>
              <View style={s.rowBody}>
                <Text style={s.rowName}>{localize(c.nameJson, locale)}</Text>
                <Text style={s.meta}>{new Date(c.startsAt as string).toLocaleString('ar-SA')}</Text>
                <Text style={[s.spots, spots === 0 && s.full]}>
                  {spots > 0
                    ? t('mobile.gyms.spots-left', { count: spots })
                    : t('mobile.gyms.full')}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.btn, spots === 0 && s.btnDisabled]}
                disabled={spots === 0 || bookMut.isPending}
                onPress={() => {
                  if (!isAuthed) {
                    showToast('warning', t('mobile.gyms.login-to-book'));
                    return;
                  }
                  bookMut.mutate({ classId: c.id as number });
                }}
              >
                <Text style={s.btnText}>{t('mobile.gyms.book')}</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      {/* Memberships */}
      <Text style={s.section}>{t('mobile.gyms.plans')}</Text>
      {plans.map((p) => (
        <View key={p.id as number} style={s.row}>
          <View style={s.rowBody}>
            <Text style={s.rowName}>{localize(p.nameJson, locale)}</Text>
            <Text style={s.meta}>
              {Number(p.price ?? 0).toFixed(0)} {t('misc.sar')} / {t('vendorPortal.deals.ends')}
            </Text>
          </View>
          <TouchableOpacity
            style={s.btn}
            disabled={subscribeMut.isPending}
            onPress={() => {
              if (!isAuthed) {
                showToast('warning', t('mobile.gyms.login-to-book'));
                return;
              }
              subscribeMut.mutate({ planId: p.id as number });
            }}
          >
            <Text style={s.btnText}>{t('mobile.gyms.subscribe')}</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Day passes */}
      <Text style={s.section}>{t('mobile.gyms.passes')}</Text>
      {passes.map((p) => (
        <View key={p.id as number} style={s.row}>
          <View style={s.rowBody}>
            <Text style={s.rowName}>{p.name as string}</Text>
            <Text style={s.meta}>
              {Number(p.price ?? 0).toFixed(0)} {t('misc.sar')}
            </Text>
          </View>
          <TouchableOpacity
            style={s.btn}
            disabled={buyPassMut.isPending}
            onPress={() => {
              if (!isAuthed) {
                showToast('warning', t('mobile.gyms.login-to-book'));
                return;
              }
              buyPassMut.mutate({ passId: p.id as number });
            }}
          >
            <Text style={s.btnText}>{t('mobile.gyms.buy')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  badge: {
    fontSize: 11,
    color: '#047857',
    backgroundColor: '#d1fae5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 6,
    overflow: 'hidden',
  },
  section: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 8 },
  empty: { color: '#9ca3af', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rowBody: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  spots: { fontSize: 12, fontWeight: '600', color: '#7c3aed', marginTop: 2 },
  full: { color: '#dc2626' },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
