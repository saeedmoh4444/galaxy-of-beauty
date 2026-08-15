import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface RoutineStep {
  id?: number;
  emoji?: string;
  nameAr?: string;
  time?: string;
  frequency?: string;
}

export default function RoutineSchedulerScreen(): JSX.Element {
  const routinesQ = trpc.routineScheduler.myRoutines.useQuery();
  const data: RoutineStep[] = (routinesQ.data as unknown as RoutineStep[] | undefined) ?? [];

  if (routinesQ.isLoading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={routinesQ.isRefetching}
          onRefresh={() => routinesQ.refetch()}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}> جدول الروتين</Text>
      {data.map((r, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{r.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{r.nameAr ?? ''}</Text>
            <Text style={styles.time}>
              {r.time ?? ''} · {r.frequency ?? ''}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
