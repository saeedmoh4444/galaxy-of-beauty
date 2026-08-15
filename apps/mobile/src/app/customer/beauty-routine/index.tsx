import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface RoutineStep {
  emoji?: string;
  nameAr?: string;
}

interface RoutineData {
  morning?: RoutineStep[];
  evening?: RoutineStep[];
}

export default function BeautyRoutineScreen(): JSX.Element {
  const q = trpc.routineScheduler.myRoutines.useQuery();
  if (q.isLoading) return <SkeletonList count={3} />;
  const data = q.data as unknown as RoutineData | null;
  const morning = (data?.morning as RoutineStep[] | undefined) ?? [];
  const evening = (data?.evening as RoutineStep[] | undefined) ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
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
