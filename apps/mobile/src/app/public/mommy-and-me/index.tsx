import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

// K3 (kids plan) — data-driven Mommy & Me bundles (ServiceBundle rows).
// Book routes into the booking flow with the bundle preselected.

const BUNDLE_EMOJI = ['💅', '💇', '🧖', '👰'];

export default function MommyAndMeScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const router = useRouter();
  const bundlesQ = trpc.bundles.list.useQuery();
  const bundles = (bundlesQ.data as unknown as Record<string, unknown>[] | undefined) ?? [];
  if (bundlesQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={bundlesQ.isRefetching}
          onRefresh={async () => {
            await bundlesQ.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.mommy-and-me.title')}</Text>
      {bundles.map((b, i) => {
        const child = b.childService as Record<string, unknown>;
        return (
          <View key={b.id as number} style={styles.card}>
            <Text style={styles.se}>{BUNDLE_EMOJI[i] ?? '🎀'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sn}>{localize(b.nameJson, locale)}</Text>
              <Text style={styles.sd}>{localize(b.descriptionJson, locale)}</Text>
              <View style={styles.sm}>
                <Text style={styles.sp}>
                  {Number(b.bundlePrice).toLocaleString()} {t('misc.sar')}
                </Text>
                <Text style={styles.sdu}>👶 {localize(child?.titleJson, locale)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.bb}
              onPress={() => router.push(`/customer/bookings/create?bundleId=${b.id}` as never)}
            >
              <Text style={styles.bt}>{t('mobile.public.mommy-and-me.book')}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  se: { fontSize: 32 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sm: { flexDirection: 'row', gap: 12, marginTop: 4, flexWrap: 'wrap' },
  sp: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  sdu: { fontSize: 12, color: '#9ca3af' },
  bb: { backgroundColor: '#db2777', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  bt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
