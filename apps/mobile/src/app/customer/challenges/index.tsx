import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const CHALLENGE_STYLES: Record<string, { emoji: string; color: string }> = {
  '7day_skincare': { emoji: '✨', color: '#ec4899' },
  '5bookings': { emoji: '💇‍♀️', color: '#f59e0b' },
  first_review: { emoji: '⭐', color: '#3b82f6' },
  streak_4weeks: { emoji: '🔥', color: '#8b5cf6' },
  refer_3friends: { emoji: '👯‍♀️', color: '#10b981' },
};

export default function ChallengesScreen(): JSX.Element {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).challenges.list.query() as any),
      ((trpc as any).challenges.progress.query() as any),
    ]).then(([c, p]: any[]) => { setChallenges(c || []); setProgress(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const join = (challengeId: string) => {
    ((trpc as any).challenges.join.mutate({ challengeId }) as any).then(() => {
      Promise.all([
        ((trpc as any).challenges.list.query() as any),
        ((trpc as any).challenges.progress.query() as any),
      ]).then(([c, p]: any[]) => { setChallenges(c || []); setProgress(p); });
    });
  };

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🏆 تحديات الجمال</Text>
      <Text style={styles.sub}>أكملي التحديات واكسبي مكافآت</Text>
      {challenges.length === 0 ? <Text style={styles.e}>لا توجد تحديات</Text> :
        challenges.map((ch: any) => {
          const style = CHALLENGE_STYLES[ch.id as string] ?? { emoji: '🎯', color: '#6b7280' };
          const pct = Math.min(100, ((progress?.bookingCount || 0) / (ch.target as number || 1)) * 100);
          return (
            <View key={ch.id} style={[styles.card, {borderLeftColor: style.color}]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{style.emoji}</Text>
                <View style={{flex:1}}>
                  <Text style={styles.cardTitle}>{ch.nameAr as string}</Text>
                  <Text style={styles.cardDesc}>{ch.descAr as string}</Text>
                </View>
              </View>
              <View style={styles.progressBar}><View style={[styles.progressFill, {width: `${pct}%`, backgroundColor: style.color}]} /></View>
              <View style={styles.cardFooter}>
                <Text style={styles.rewardText}>🎁 {ch.reward as string}</Text>
                <TouchableOpacity onPress={() => join(ch.id as string)} style={[styles.joinBtn, {backgroundColor: style.color}]}>
                  <Text style={styles.joinBtnText}>انضمام</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardEmoji: { fontSize: 36 }, cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' }, cardDesc: { fontSize: 12, color: '#6b7280' },
  progressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginBottom: 10 },
  progressFill: { height: 6, borderRadius: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewardText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  joinBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
