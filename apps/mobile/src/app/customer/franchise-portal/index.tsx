import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface FranchiseDashboard {
  totalRevenue?: number;
  totalBookings?: number;
}

interface FranchiseLocation {
  id?: number;
  branch?: string;
  city?: string;
  staff?: number;
  bookings?: number;
  revenue?: number;
  status?: string;
}

export default function FranchisePortalScreen(): JSX.Element {
  const { t } = useLocale();
  const dashQ = trpc.franchisePortal.dashboard.useQuery();
  const locationsQ = trpc.franchisePortal.locations.useQuery();
  if (dashQ.isLoading || locationsQ.isLoading) return <SkeletonList count={4} />;
  const dash = dashQ.data as unknown as FranchiseDashboard | null;
  const locations: FranchiseLocation[] =
    (locationsQ.data as unknown as FranchiseLocation[] | undefined) ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={dashQ.isRefetching || locationsQ.isRefetching}
          onRefresh={() => {
            void dashQ.refetch();
            void locationsQ.refetch();
          }}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('franchisePortal.title')}</Text>
      <View style={styles.kr}>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={styles.kv}>
            {t('franchisePortal.amount', { value: (dash?.totalRevenue ?? 0).toLocaleString() })}
          </Text>
          <Text style={styles.kl}>{t('franchisePortal.revenue')}</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#2563eb' }]}>{dash?.totalBookings ?? 0}</Text>
          <Text style={styles.kl}>{t('franchisePortal.bookings')}</Text>
        </View>
      </View>
      {locations.map((l) => (
        <View key={l.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ln}>{l.branch}</Text>
            <Text style={styles.lm}>
              {l.city} · {t('franchisePortal.staff', { staff: l.staff ?? 0 })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.lb}>
              {t('franchisePortal.booking-count', { bookings: l.bookings ?? 0 })}
            </Text>
            <Text style={styles.lr}>
              {t('franchisePortal.amount', { value: l.revenue?.toLocaleString() ?? '' })}
            </Text>
            <View style={[styles.badge, l.status === 'active' ? styles.ba : styles.bp]}>
              <Text style={styles.bt}>
                {l.status === 'active' ? t('franchisePortal.active') : t('franchisePortal.pending')}
              </Text>
            </View>
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
  kr: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ke: { fontSize: 28, marginBottom: 4 },
  kv: { fontSize: 24, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 11, color: '#9ca3af' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  ln: { fontSize: 14, fontWeight: '600', color: '#111827' },
  lm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  lb: { fontSize: 12, color: '#6b7280' },
  lr: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  ba: { backgroundColor: '#dcfce7' },
  bp: { backgroundColor: '#fef3c7' },
  bt: { fontSize: 11, fontWeight: '600' },
});
