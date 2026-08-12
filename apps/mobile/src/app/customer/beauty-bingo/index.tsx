import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { trpc as trpcReact } from '@/lib/trpc-react';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyBingoScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).beautyBingo.card.query() as any)
      .then((d: any) => {
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
  const mark = () => {
    ((trpc as any).beautyBingo.mark.mutate({}) as any).then(() => fetch());
  };
  if (loading) return <SkeletonList count={3} />;
  const tasks = (data?.tasks ?? []) as any[];
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
      <Text style={styles.t}>🎮 Beauty Bingo</Text>
      <View style={styles.card}>
        <Text style={styles.em}>🎮</Text>
        <Text style={styles.pr}>
          {data?.completed ?? 0}/{data?.total ?? 9} مكتملة
        </Text>
        <View style={styles.grid}>
          {tasks.map((t: any) => (
            <TouchableOpacity
              key={t.id}
              onPress={mark}
              style={[styles.task, t.completed && styles.td]}
            >
              <Text style={styles.tt}>
                {t.completed ? '✅' : '⬜'} {t.task as string}
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
