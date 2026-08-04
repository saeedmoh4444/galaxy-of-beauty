import { View, Text, ScrollView, StyleSheet, RefreshControl, Image } from 'react-native';
import { MEDIUM_PAGE_SIZE } from '@galaxy/ui';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeforeAfterScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.beforeAfter.feed.query({ page: 1, limit: MEDIUM_PAGE_SIZE }) as any);

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل التحولات" onRetry={refetch} />;

  const items = ((data as any)?.items ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#059669']} />}>
      <Text style={styles.t}>📸 قبل وبعد</Text>
      <Text style={styles.sub}>تحولات مذهلة من عملائنا</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد تحولات</Text> :
        <View style={styles.grid}>
          {items.map((item: Record<string, unknown>, i: number) => (
            <View key={i} style={styles.card}>
              {item.beforeImageUrl ? <Image source={{uri: item.beforeImageUrl as string}} style={styles.img} /> : <View style={styles.imgPlaceholder}><Text style={{fontSize:28}}>📸</Text></View>}
              <Text style={styles.cardTitle}>{item.title as string}</Text>
              <Text style={styles.cardBy}>👩‍🎨 {item.technicianName as string}</Text>
            </View>
          ))}
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  img: { width: '100%', height: 130 }, imgPlaceholder: { width: '100%', height: 130, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#111827', padding: 8, paddingBottom: 0 },
  cardBy: { fontSize: 11, color: '#6b7280', padding: 8, paddingTop: 2 },
});
