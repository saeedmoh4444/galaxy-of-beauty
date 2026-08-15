import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface SalonDashboard {
  todayBookings?: number;
  todayRevenue?: number;
}

interface SalonStaff {
  id?: number;
  name?: string;
  role?: string;
  rating?: number;
}

export default function SalonManagementScreen(): JSX.Element {
  const dashQ = trpc.salonManagement.dashboard.useQuery();
  const staffQ = trpc.salonManagement.staff.useQuery();
  const dash = dashQ.data as SalonDashboard | null;
  const staff: SalonStaff[] = (staffQ.data as SalonStaff[] | undefined) ?? [];
  if (dashQ.isLoading || staffQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={dashQ.isRefetching || staffQ.isRefetching}
          onRefresh={() => {
            void dashQ.refetch();
            void staffQ.refetch();
          }}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}> إدارة الصالون</Text>
      <View style={styles.kr}>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={styles.kv}>{dash?.todayBookings ?? 0}</Text>
          <Text style={styles.kl}>حجز اليوم</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#059669' }]}>
            {(dash?.todayRevenue ?? 0).toLocaleString()}
          </Text>
          <Text style={styles.kl}>ر.س</Text>
        </View>
      </View>
      {staff.map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.em}>‍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{s.name ?? ''}</Text>
            <Text style={styles.role}>{s.role ?? ''}</Text>
          </View>
          <Text style={styles.rt}> {s.rating ?? 0}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  kr: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ke: { fontSize: 28, marginBottom: 4 },
  kv: { fontSize: 24, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 11, color: '#9ca3af' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  em: { fontSize: 28 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  role: { fontSize: 12, color: '#6b7280' },
  rt: { fontSize: 13, fontWeight: '600', color: '#f59e0b' },
});
