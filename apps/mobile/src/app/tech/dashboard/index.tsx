import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function TechDashboardScreen(): JSX.Element {
  const router = useRouter();
  const { t } = useLocale();
  const stats = trpc.technicianPerformance.myStats.useQuery() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = stats.data as unknown as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={stats.isLoading}
      isError={stats.isError}
      isEmpty={!data}
      errorMessage={t('admin.dashboard.load-error')}
      onRetry={() => stats.refetch()}
    >
      <Text style={styles.title}>{t('mobile.tech.dashboard.title')}</Text>
      <View style={styles.statsGrid}>
        {[
          {
            key: 'pendingBookings',
            label: t('mobile.tech.dashboard.pending'),
            val: String(data?.pendingBookings ?? 0),
          },
          {
            key: 'completedBookings',
            label: t('mobile.tech.dashboard.completed'),
            val: String(data?.completedBookings ?? 0),
          },
          {
            key: 'totalEarnings',
            label: t('tech.dashboard.earnings'),
            val: `${String(data?.totalEarnings ?? 0)} ${t('misc.sar')}`,
          },
          {
            key: 'rating',
            label: t('mobile.tech.dashboard.rating'),
            val: String(data?.rating ?? 0),
          },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statNum}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.links}>
        {[
          { h: '/tech/bookings', l: t('mobile.tech.dashboard.bookings') },
          { h: '/tech/earnings', l: t('tech.dashboard.earnings') },
          { h: '/tech/slots', l: t('mobile.tech.dashboard.slots') },
          { h: '/tech/profile', l: t('mobile.tech.dashboard.my-profile') },
        ].map((l, i) => (
          <TouchableOpacity
            key={i}
            style={styles.linkBtn}
            onPress={() => router.push(l.h as never)}
          >
            <Text style={styles.linkText}>{l.l}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNum: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
  statLabel: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  links: { gap: 8 },
  linkBtn: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16 },
  linkText: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
});
