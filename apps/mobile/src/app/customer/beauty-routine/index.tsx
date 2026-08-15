import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface RoutineStep {
  emoji?: string;
  nameAr?: string;
}

interface RoutineData {
  morning?: RoutineStep[];
  evening?: RoutineStep[];
}

export default function BeautyRoutineScreen(): JSX.Element {
  const [data, setData] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().routineScheduler.myRoutines.query() as Promise<RoutineData>)
      .then((d: RoutineData) => {
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
  if (loading) return <SkeletonList count={3} />;
  const morning = (data?.morning as RoutineStep[] | undefined) ?? [];
  const evening = (data?.evening as RoutineStep[] | undefined) ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}> روتيني</Text>
      {morning.length > 0 && <Text style={styles.st}>️ الصباح</Text>}
      {morning.map((s, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{s.emoji}</Text>
          <Text style={styles.name}>{s.nameAr}</Text>
        </View>
      ))}
      {evening.length > 0 && <Text style={styles.st}> المساء</Text>}
      {evening.map((s, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{s.emoji}</Text>
          <Text style={styles.name}>{s.nameAr}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  emoji: { fontSize: 24 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
