import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface JournalEntry {
  id?: number;
  title?: string;
  createdAt?: string;
}

export default function BeautyJournalScreen(): JSX.Element {
  const q = trpc.beautyJournal.list.useQuery({ page: 1, limit: LARGE_PAGE_SIZE });

  if (q.isLoading)
    return (
      <View style={styles.c}>
        <Text style={styles.t}> يوميات الجمال</Text>
        <SkeletonList count={4} />
      </View>
    );
  if (q.isError) return <ErrorAlert message="فشل تحميل اليوميات" onRetry={() => q.refetch()} />;

  const items = (q.data ?? []) as unknown as JournalEntry[];

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
      <Text style={styles.t}> يوميات الجمال</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد مدخلات</Text>
      ) : (
        items.map((e, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.entryTitle}>{e.title ?? 'مدخل'}</Text>
            <Text style={styles.entryDate}>
              {new Date(e.createdAt ?? '').toLocaleDateString('ar-SA')}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#8b5cf6', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  entryTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  entryDate: { fontSize: 12, color: '#6b7280', marginTop: 4 },
});
