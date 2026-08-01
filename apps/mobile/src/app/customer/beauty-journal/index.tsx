import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyJournalScreen(): JSX.Element {
  const { data: entries, loading, error, refreshing, refetch, refresh } = useQuery(() => (trpc as any).beautyJournal.list.query({ page: 1, limit: 20 }));

  if (loading) return <View style={styles.c}><Text style={styles.t}>📔 يوميات الجمال</Text><SkeletonList count={4} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل اليوميات" onRetry={refetch} />;

  const items = (entries ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#8b5cf6']} />}>
      <Text style={styles.t}>📔 يوميات الجمال</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد مدخلات</Text> :
        items.map((e: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.entryTitle}>{e.title as string ?? 'مدخل'}</Text>
            <Text style={styles.entryDate}>{new Date(e.createdAt as string).toLocaleDateString('ar-SA')}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#8b5cf6', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  entryTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  entryDate: { fontSize: 12, color: '#6b7280', marginTop: 4 },
});
