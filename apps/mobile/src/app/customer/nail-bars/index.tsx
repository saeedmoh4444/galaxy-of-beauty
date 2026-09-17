import type { JSX } from 'react';
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { TrustChips } from '@/components/TrustChips';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface NailBarItem {
  id?: number;
  storeName?: string;
  storeSlug?: string;
  nailBarType?: string | null;
  nailBarCity?: string | null;
  ratingAvg?: number;
  totalReviews?: number;
  womenOnlyStaff?: boolean;
  privateSuite?: boolean;
  childFriendlyCorner?: boolean;
}

export default function NailBarsScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  // K3 (kids plan, W9) — child-friendly corner filter.
  const [childFriendly, setChildFriendly] = useState(false);
  const barsQ = trpc.nailBars.list.useQuery({
    page: 1,
    limit: 50,
    ...(childFriendly ? { childFriendly: true } : {}),
  });

  const bars: NailBarItem[] = Array.isArray(
    (barsQ.data as unknown as { items?: NailBarItem[] } | null)?.items,
  )
    ? ((barsQ.data as unknown as { items: NailBarItem[] }).items as NailBarItem[])
    : [];

  if (barsQ.isLoading) return <SkeletonList count={6} />;
  if (barsQ.isError)
    return <ErrorAlert message={t('mobile.nailBars.load-error')} onRetry={() => barsQ.refetch()} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={barsQ.isRefetching}
          onRefresh={async () => {
            await barsQ.refetch();
          }}
        />
      }
    >
      <Text style={s.title}>{t('mobile.nailBars.title')}</Text>
      <TouchableOpacity
        style={[s.filterChip, childFriendly && s.filterChipActive]}
        onPress={() => setChildFriendly((v) => !v)}
        testID="nail-bars-child-friendly-filter"
      >
        <Text style={[s.filterChipText, childFriendly && s.filterChipTextActive]}>
          🧸 {t('mobile.nailBars.child-friendly')}
        </Text>
      </TouchableOpacity>
      {bars.map((bar) => (
        <TouchableOpacity
          key={bar.id}
          style={s.card}
          onPress={() => router.push(`/customer/nail-bars/${bar.storeSlug ?? ''}`)}
        >
          <View style={s.icon}>
            <Text style={s.iconText}>💅</Text>
          </View>
          <View style={s.body}>
            <Text style={s.name}>{bar.storeName ?? ''}</Text>
            <Text style={s.meta}>
              {t(`nailBars.type.${bar.nailBarType ?? ''}` as never)} · {bar.nailBarCity ?? ''}
            </Text>
            <TrustChips
              verifiedLabel={t('mobile.nailBars.verified')}
              rating={bar.ratingAvg}
              reviews={bar.totalReviews}
              womenOnly={bar.womenOnlyStaff}
              womenOnlyLabel={t('mobile.public.service-detail.trust.womenOnly')}
              privateSuite={bar.privateSuite}
              privateSuiteLabel={t('mobile.public.service-detail.trust.privateSuite')}
              childFriendly={bar.childFriendlyCorner}
              childFriendlyLabel={t('mobile.nailBars.child-friendly')}
            />
          </View>
        </TouchableOpacity>
      ))}
      {bars.length === 0 && <Text style={s.empty}>{t('mobile.nailBars.empty')}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
  filterChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  filterChipActive: { backgroundColor: '#db2777', borderColor: '#db2777' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  filterChipTextActive: { color: '#fff' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
});
