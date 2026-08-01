import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyAwardsScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => (trpc as any).beautyAwards.list.query());

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل الجوائز" onRetry={refetch} />;

  const items = (data ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#f59e0b']} />}>
      <Text style={styles.t}>🏆 جوائز التجميل</Text>
      <Text style={styles.sub}>أفضل الخدمات والفنيات لهذا العام</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد جوائز</Text> :
        items.map((a: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.awardEmoji}>{a.emoji as string ?? '🏆'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.awardName}>{a.nameAr as string}</Text>
              <Text style={styles.awardWinner}>{a.winner as string}</Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  awardEmoji: { fontSize: 36 }, awardName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  awardWinner: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
