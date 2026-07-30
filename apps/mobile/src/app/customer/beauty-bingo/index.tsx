import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function BeautyBingoScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).beautyBingo.card.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const mark = () => {
    ((trpc as any).beautyBingo.mark.mutate({}) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  const tasks = (data?.tasks ?? []) as any[];
  const completed = (data?.completed as number) ?? 0;
  const total = (data?.total as number) ?? 9;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎮 Beauty Bingo</Text>
      <Text style={styles.sub}>أكملي المهام واكسبي جلسة مجانية!</Text>
      <View style={styles.card}>
        <Text style={styles.emoji}>🎮</Text>
        <Text style={styles.progress}>{completed}/{total} مكتملة</Text>
        <Text style={styles.reward}>{data?.reward as string}</Text>
        <View style={styles.grid}>
          {tasks.map((t: any) => (
            <TouchableOpacity key={t.id} onPress={mark} style={[styles.task, t.completed && styles.taskDone]}>
              <Text style={styles.taskText}>{t.completed ? '✅' : '⬜'} {t.task as string}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity onPress={fetch} style={styles.refreshBtn}><Text style={styles.refreshBtnText}>🔄 تحديث</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, alignItems: 'center', paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', width: '100%' },
  emoji: { fontSize: 48 }, progress: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  reward: { fontSize: 13, color: '#db2777', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  task: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, width: '30%', alignItems: 'center' },
  taskDone: { backgroundColor: '#dcfce7' },
  taskText: { fontSize: 12, fontWeight: '600', color: '#111827', textAlign: 'center' },
  refreshBtn: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12, width: '100%' },
  refreshBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
