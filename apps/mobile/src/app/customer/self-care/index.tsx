import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface SelfCareActivity {
  id?: number;
  emoji?: string;
  nameAr?: string;
  duration?: string;
}

export default function SelfCareScreen(): JSX.Element {
  const historyQ = trpc.selfCare.history.useQuery({});
  const data: SelfCareActivity[] =
    (historyQ.data as unknown as SelfCareActivity[] | undefined) ?? [];
  if (historyQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={historyQ.isRefetching}
          onRefresh={() => historyQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> العناية الذاتية</Text>
      {data.map((a, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{a.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{a.nameAr}</Text>
            <Text style={styles.dur}>️ {a.duration}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
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
  dur: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
