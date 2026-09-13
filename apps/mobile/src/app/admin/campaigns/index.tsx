import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface Campaign {
  id?: number;
  nameJson?: { ar?: string };
  discountType?: string;
  discountValue?: number;
  isActive?: boolean;
}

export default function AdminCampaignsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.campaigns.listAll.useQuery();
  const data = (q.data as unknown as Campaign[] | null) ?? [];

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError)
    return (
      <ErrorAlert message={t('mobile.admin.campaigns.load-error')} onRetry={() => q.refetch()} />
    );

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}>{t('admin.campaigns.title')}</Text>
      {data.map((c, i) => (
        <View key={i} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{localize(c.nameJson, locale)}</Text>
            <Text style={styles.discount}>
              {c.discountType === 'percent'
                ? `-${c.discountValue ?? 0}%`
                : `-${c.discountValue ?? 0} ${t('misc.sar')}`}
            </Text>
          </View>
          <View style={[styles.badge, c.isActive ? styles.active : styles.inactive]}>
            <Text style={styles.badgeText}>
              {c.isActive
                ? t('mobile.admin.campaigns.active')
                : t('mobile.admin.campaigns.inactive')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  discount: { fontSize: 12, color: '#dc2626', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  active: { backgroundColor: '#dcfce7' },
  inactive: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
