import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ReferralRaceScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.referralRace.leaderboard.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const leaders = (data?.leaders ?? []) as Record<string, unknown>[];
  const days = data?.remainingDays as number ?? 0;

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🎫 سباق الإحالات</Text><Text style={styles.subtitle}>متبقي {days} يوم</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {((data?.prizes ?? []) as string[]).map((p: string, i: number) => <Text key={i} style={styles.prize}>{['🥇','🥈','🥉'][i]} {p}</Text>)}
        {leaders.map((l: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.leader}>
            <Text style={styles.rank}>{['🥇','🥈','🥉'][i] ?? `#${i+1}`}</Text>
            <Text style={styles.name}>{l.userName as string}</Text>
            <Text style={styles.count}>{l.referralCount as number} 👥</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#fde68a', backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#d97706' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  inner: { padding: 16, paddingBottom: 40 },
  prize: { fontSize: 13, fontWeight: '600', color: '#92400e', textAlign: 'center', marginBottom: 4 },
  leader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 8, gap: 12 },
  rank: { fontSize: 24, width: 40, textAlign: 'center' },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  count: { fontSize: 14, fontWeight: '700', color: '#d97706' },
});
