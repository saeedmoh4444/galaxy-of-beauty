import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trpc.admin.dashboardStats.query()
      .then((d) => { setStats(d as unknown as Record<string, unknown>); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>لوحة الإدارة</Text>
      <View style={styles.grid}>
        <StatCard label="المستخدمين" value={String(stats?.totalUsers ?? 0)} color="#7c3aed" />
        <StatCard label="الفنيات" value={String(stats?.totalTechnicians ?? 0)} color="#10b981" />
        <StatCard label="الحجوزات" value={String(stats?.totalBookings ?? 0)} color="#f59e0b" />
        <StatCard label="الإيرادات" value={`${Number(stats?.totalRevenue ?? 0).toFixed(0)} ر.س`} color="#8b5cf6" />
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '47%', backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, borderLeftWidth: 3, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});
