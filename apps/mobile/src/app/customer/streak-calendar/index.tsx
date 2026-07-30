import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function StreakCalendarScreen(): JSX.Element {
  const { data, loading, error, refetch } = useQuery(() => trpc.streaks.get.query());

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;
  if (error) return <ErrorAlert message="فشل تحميل تقويم الاستمرارية" onRetry={refetch} />;

  const streak = (data as any)?.currentStreak || 0;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📅 تقويم الاستمرارية</Text>
      <View style={styles.streakCard}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={styles.streakNum}>{streak}</Text>
        <Text style={styles.streakLabel}>أسابيع متتالية</Text>
      </View>
      <View style={styles.weeks}>
        {Array.from({length: 12}, (_, i) => (
          <View key={i} style={[styles.week, i < streak && styles.weekActive]}><Text style={styles.weekText}>{i < streak ? '🔥' : '○'}</Text></View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, alignItems: 'center', paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  streakCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 30, width: '100%', marginBottom: 20 },
  fire: { fontSize: 48, marginBottom: 8 }, streakNum: { fontSize: 40, fontWeight: '800', color: '#d97706' },
  streakLabel: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  weeks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  week: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  weekActive: { backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#f59e0b' },
  weekText: { fontSize: 18 },
});
