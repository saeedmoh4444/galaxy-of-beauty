import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface NailBarItem {
  id?: number;
  storeName?: string;
  storeSlug?: string;
  nailBarType?: string | null;
  nailBarCity?: string | null;
  ratingAvg?: number;
}

export default function NailBarsScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const barsQ = trpc.nailBars.list.useQuery({ page: 1, limit: 50 });

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
        <RefreshControl refreshing={barsQ.isRefetching} onRefresh={() => barsQ.refetch()} />
      }
    >
      <Text style={s.title}>{t('mobile.nailBars.title')}</Text>
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
            <Text style={s.badge}>{t('mobile.nailBars.pay-at-venue')}</Text>
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
  badge: {
    fontSize: 11,
    color: '#be185d',
    backgroundColor: '#fce7f3',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 4,
    overflow: 'hidden',
  },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
});
