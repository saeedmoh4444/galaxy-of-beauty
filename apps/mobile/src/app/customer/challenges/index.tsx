import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

const CH: Record<string, { emoji: string; color: string }> = {
  '7day_skincare': { emoji: '', color: '#ec4899' },
  '5bookings': { emoji: '‍️', color: '#f59e0b' },
  first_review: { emoji: '', color: '#3b82f6' },
  streak_4weeks: { emoji: '', color: '#8b5cf6' },
  refer_3friends: { emoji: '‍️', color: '#10b981' },
};

export default function ChallengesScreen(): JSX.Element {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      (trpc as any).challenges.list.query() as any,
      (trpc as any).challenges.progress.query() as any,
    ])
      .then(([c, p]: any[]) => {
        setChallenges(c || []);
        setProgress(p);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const join = (challengeId: string) => {
    ((trpc as any).challenges.join.mutate({ challengeId }) as any).then(() => fetch());
  };
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> تحديات الجمال</Text>
      {challenges.map((ch: any) => {
        const s = CH[ch.id as string] ?? { emoji: '', color: '#6b7280' };
        const pct = Math.min(
          100,
          ((progress?.bookingCount || 0) / ((ch.target as number) || 1)) * 100,
        );
        return (
          <View key={ch.id} style={[styles.card, { borderLeftColor: s.color }]}>
            <View style={styles.ch}>
              <Text style={styles.ce}>{s.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.ct}>{ch.nameAr as string}</Text>
                <Text style={styles.cd}>{ch.descAr as string}</Text>
              </View>
            </View>
            <View style={styles.pb}>
              <View style={[styles.pf, { width: `${pct}%`, backgroundColor: s.color }]} />
            </View>
            <View style={styles.cf}>
              <Text style={styles.rt}> {ch.reward as string}</Text>
              <TouchableOpacity
                onPress={() => join(ch.id as string)}
                style={[styles.jb, { backgroundColor: s.color }]}
              >
                <Text style={styles.jt}>انضمام</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  ce: { fontSize: 36 },
  ct: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cd: { fontSize: 12, color: '#6b7280' },
  pb: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginBottom: 10 },
  pf: { height: 6, borderRadius: 3 },
  cf: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rt: { fontSize: 12, fontWeight: '600', color: '#059669' },
  jb: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  jt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
