import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { TrustChips } from '@/components/TrustChips';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface GymItem {
  id?: number;
  storeName?: string;
  storeSlug?: string;
  gymType?: string | null;
  gymCity?: string | null;
  ratingAvg?: number;
  totalReviews?: number;
  womenOnlyStaff?: boolean;
  privateSuite?: boolean;
}

export default function GymsScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const gymsQ = trpc.gyms.list.useQuery({ page: 1, limit: 50 });

  const gyms: GymItem[] = Array.isArray(
    (gymsQ.data as unknown as { items?: GymItem[] } | null)?.items,
  )
    ? ((gymsQ.data as unknown as { items: GymItem[] }).items as GymItem[])
    : [];

  if (gymsQ.isLoading) return <SkeletonList count={6} />;
  if (gymsQ.isError)
    return <ErrorAlert message={t('mobile.gyms.load-error')} onRetry={() => gymsQ.refetch()} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={gymsQ.isRefetching}
          onRefresh={async () => {
            await gymsQ.refetch();
          }}
        />
      }
    >
      <Text style={s.title}>{t('mobile.gyms.title')}</Text>
      {gyms.map((gym) => (
        <TouchableOpacity
          key={gym.id}
          style={s.card}
          onPress={() => router.push(`/customer/gyms/${gym.storeSlug ?? ''}`)}
        >
          <View style={s.icon}>
            <Text style={s.iconText}>🏋️</Text>
          </View>
          <View style={s.body}>
            <Text style={s.name}>{gym.storeName ?? ''}</Text>
            <Text style={s.meta}>
              {t(`gyms.type.${gym.gymType ?? ''}` as never)} · {gym.gymCity ?? ''}
            </Text>
            <TrustChips
              verifiedLabel={t('mobile.gyms.verified')}
              rating={gym.ratingAvg}
              reviews={gym.totalReviews}
              womenOnly={gym.womenOnlyStaff}
              womenOnlyLabel={t('mobile.public.service-detail.trust.womenOnly')}
              privateSuite={gym.privateSuite}
              privateSuiteLabel={t('mobile.public.service-detail.trust.privateSuite')}
            />
          </View>
        </TouchableOpacity>
      ))}
      {gyms.length === 0 && <Text style={s.empty}>{t('mobile.gyms.empty')}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
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
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
});
