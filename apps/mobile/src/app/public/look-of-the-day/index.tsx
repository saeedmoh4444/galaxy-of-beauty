import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface LookOfTheDay {
  id?: number;
  emoji?: string;
  titleAr?: string;
  descAr?: string;
  technician?: string;
}

export default function LookOfTheDayScreen(): JSX.Element {
  const looksQ = trpc.lookOfTheDay.feed.useQuery({});
  const looks: LookOfTheDay[] =
    (looksQ.data as unknown as { items?: LookOfTheDay[] } | undefined)?.items ?? [];
  if (looksQ.isLoading) return <SkeletonList count={3} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={looksQ.isRefetching}
          onRefresh={() => looksQ.refetch()}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> إطلالة اليوم</Text>
      {looks.map((l, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.le}>{l.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.lt}>{l.titleAr}</Text>
            <Text style={styles.ld}>{l.descAr}</Text>
            <Text style={styles.lb}>‍ {l.technician}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  le: { fontSize: 40 },
  lt: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ld: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  lb: { fontSize: 12, color: '#f59e0b', marginTop: 4 },
});
