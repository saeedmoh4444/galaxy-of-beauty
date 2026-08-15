import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { rawTrpc } from '@/lib/trpc-react';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

interface BingoTask {
  id?: number;
  task?: string;
  completed?: boolean;
}

interface BingoCard {
  completed?: number;
  total?: number;
  tasks?: BingoTask[];
}

export default function BeautyBingoScreen(): JSX.Element {
  const [data, setData] = useState<BingoCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (rawTrpc.beautyBingo.card.query() as Promise<BingoCard>)
      .then((d) => {
        setData(d);
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
  const mark = (taskId: number) => {
    rawTrpc.beautyBingo.mark.mutate({ taskId }).then(() => fetch());
  };
  if (loading) return <SkeletonList count={3} />;
  const tasks = data?.tasks ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> Beauty Bingo</Text>
      <View style={styles.card}>
        <Text style={styles.em}></Text>
        <Text style={styles.pr}>
          {data?.completed ?? 0}/{data?.total ?? 9} مكتملة
        </Text>
        <View style={styles.grid}>
          {tasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => t.id != null && mark(t.id)}
              style={[styles.task, t.completed && styles.td]}
            >
              <Text style={styles.tt}>
                {t.completed ? '' : '⬜'} {t.task as string}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, alignItems: 'center', paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  em: { fontSize: 48 },
  pr: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  task: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    width: '30%',
    alignItems: 'center',
  },
  td: { backgroundColor: '#dcfce7' },
  tt: { fontSize: 12, fontWeight: '600', color: '#111827', textAlign: 'center' },
});
