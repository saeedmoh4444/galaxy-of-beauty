import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function AdminDashboardScreen(): JSX.Element {
  const router = useRouter();
  const stats = trpc.admin.dashboardStats.useQuery();
  const data = stats.data as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={stats.isLoading}
      isError={stats.isError}
      isEmpty={!data}
      errorMessage="فشل تحميل لوحة الإدارة"
      onRetry={() => stats.refetch()}
    >
      <Text style={styles.title}>📊 لوحة الإدارة</Text>
      <View style={styles.statsGrid}>
        {['totalUsers', 'totalBookings', 'totalTechnicians', 'totalRevenue'].map((key) => (
          <View key={key} style={styles.statCard}>
            <Text style={styles.statNum}>{String(data?.[key] ?? 0)}</Text>
            <Text style={styles.statLabel}>
              {key === 'totalUsers' ? '👥 مستخدمين' : key === 'totalBookings' ? '📅 حجوزات' : key === 'totalTechnicians' ? '💅 فنيات' : '💰 إيرادات'}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.links}>
        {[
          { h: '/admin/users', l: '👥 المستخدمين' },
          { h: '/admin/bookings', l: '📅 الحجوزات' },
          { h: '/admin/technicians', l: '💅 الفنيات' },
          { h: '/admin/finance', l: '💰 المالية' },
          { h: '/admin/analytics', l: '📈 التحليلات' },
        ].map((link, i) => (
          <TouchableOpacity key={i} style={styles.linkBtn} onPress={() => router.push(link.h as any)}>
            <Text style={styles.linkText}>{link.l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: COLORS.brand, textAlign: 'center', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { width: '47%', backgroundColor: COLORS.white, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statNum: { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
  statLabel: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  links: { gap: 8 },
  linkBtn: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  linkText: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
});
