import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminAnalyticsScreen() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.admin.dashboardStats.query() as unknown as Promise<Record<string, unknown>>)
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => { setError('فشل تحميل التحليلات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 80 }} />;
  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>التحليلات والتقارير</Text>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{String(stats?.totalUsers ?? 0)}</Text>
          <Text style={styles.statLabel}>مستخدمين</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💇</Text>
          <Text style={styles.statValue}>{String(stats?.totalTechnicians ?? 0)}</Text>
          <Text style={styles.statLabel}>فنيات</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📋</Text>
          <Text style={styles.statValue}>{String(stats?.totalBookings ?? 0)}</Text>
          <Text style={styles.statLabel}>حجوزات</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{Number(stats?.totalRevenue ?? 0).toFixed(0)} ر.س</Text>
          <Text style={styles.statLabel}>إيرادات</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⚖️</Text>
          <Text style={styles.statValue}>{String(stats?.openDisputes ?? 0)}</Text>
          <Text style={styles.statLabel}>نزاعات مفتوحة</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>{Number(stats?.avgRating ?? 0).toFixed(1)}</Text>
          <Text style={styles.statLabel}>متوسط التقييم</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '47%', backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 4 },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  centered: { alignItems: 'center', marginTop: 80 },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
