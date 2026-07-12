import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function StreaksScreen() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.streaks.get as any).query({} as never)
      .then((d: Record<string, unknown>) => { setData(d); setLoading(false); })
      .catch(() => { setError('فشل تحميل بيانات الاستمرارية'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>سجل الاستمرارية</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : !data ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔥</Text>
          <Text style={styles.empty}>لا يوجد سجل استمرارية</Text>
          <Text style={styles.hint}>احجزي خدمات بانتظام لبناء سجل الاستمرارية</Text>
        </View>
       ) : (
        <View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.fireIcon}>🔥</Text>
              <Text style={styles.statValue}>{String(data.currentStreak ?? 0)}</Text>
              <Text style={styles.statLabel}>الاستمرارية الحالية</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.fireIcon}>⭐</Text>
              <Text style={styles.statValue}>{String(data.longestStreak ?? 0)}</Text>
              <Text style={styles.statLabel}>أطول استمرارية</Text>
            </View>
          </View>
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>الإنجازات</Text>
            {(data.achievements as Record<string, unknown>[] | undefined)?.length ? (
              (data.achievements as Record<string, unknown>[]).map((a: Record<string, unknown>) => (
                <View key={a.id as number} style={styles.achievement}>
                  <Text style={styles.achIcon}>{a.icon as string ?? '🏆'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.achTitle}>{a.title as string}</Text>
                    <Text style={styles.achDesc}>{a.description as string}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noAchievements}>لا توجد إنجازات بعد</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, alignItems: 'center' },
  fireIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  achievementsSection: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  achievement: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 12 },
  achIcon: { fontSize: 28 },
  achTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  achDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  noAchievements: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
});
