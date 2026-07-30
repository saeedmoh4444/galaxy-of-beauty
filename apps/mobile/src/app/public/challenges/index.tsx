import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const GRADIENTS: Record<string, string[]> = {
  '7day_skincare': ['#f43f5e', '#ec4899'],
  '5bookings': ['#f59e0b', '#f97316'],
  first_review: ['#3b82f6', '#06b6d4'],
  streak_4weeks: ['#8b5cf6', '#7c3aed'],
  refer_3friends: ['#10b981', '#059669'],
};

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Record<string, unknown>[]>([]);
  const [progress, setProgress] = useState<Record<string, unknown>>({ bookingCount: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      trpc.challenges.list.query() as any as Promise<Record<string, unknown>[]>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      trpc.challenges.myProgress.query() as any as Promise<Record<string, unknown>>,
    ]).then(([c, p]) => { setChallenges(c); setProgress(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const getProgress = (id: string) => {
    const counts = progress as Record<string, number>;
    switch (id) {
      case '5bookings': return { current: Math.min(counts.bookingCount || 0, 5), target: 5 };
      case 'first_review': return { current: Math.min(counts.reviewCount || 0, 1), target: 1 };
      case 'streak_4weeks': return { current: Math.min(counts.bookingCount || 0, 4), target: 4 };
      default: return { current: Math.min(counts.bookingCount || 0, 7), target: 7 };
    }
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>🏆 تحديات الجمال</Text>
      <Text style={styles.subtitle}>أكملي التحديات واكسبي مكافآت</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{progress.bookingCount as number}</Text><Text style={styles.statLabel}>حجز</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{progress.reviewCount as number}</Text><Text style={styles.statLabel}>مراجعة</Text></View>
      </View>
      {challenges.map((c: Record<string, unknown>, i: number) => {
        const prog = getProgress(c.id as string);
        const pct = Math.round((prog.current / prog.target) * 100);
        const colors = GRADIENTS[c.id as string] ?? ['#9ca3af', '#6b7280'];
        return (
          <View key={i} style={styles.card}>
            <View style={[styles.topBar, { backgroundColor: colors[0] }]} />
            <Text style={styles.cardTitle}>{c.nameAr as string}</Text>
            <Text style={styles.cardDesc}>{c.descAr as string}</Text>
            <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors[0] }]} /></View>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{prog.current}/{prog.target}</Text>
              <Text style={styles.reward}>🎁 {c.reward as string}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 20 },
  stat: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 120, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statNum: { fontSize: 28, fontWeight: '800', color: '#7c3aed' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  topBar: { height: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', padding: 14, paddingBottom: 4 },
  cardDesc: { fontSize: 12, color: '#6b7280', paddingHorizontal: 14 },
  progressBar: { height: 8, backgroundColor: '#f3f4f6', margin: 14, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 14 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#7c3aed' },
  reward: { fontSize: 12, fontWeight: '600', color: '#059669' },
});
