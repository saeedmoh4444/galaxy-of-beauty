import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

interface Category {
  id?: number;
  emoji?: string;
  nameJson?: { ar?: string };
  _count?: { services?: number };
}

export default function AdminCategoriesScreen(): JSX.Element {
  const q = trpc.categories.list.useQuery();
  const data = (q.data as unknown as Category[] | null) ?? [];

  if (q.isLoading) return <SkeletonList count={6} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل الفئات" onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}> الفئات</Text>
      {data.map((cat, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{cat.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{cat.nameJson?.ar ?? ''}</Text>
            <Text style={styles.meta}>{cat._count?.services ?? 0} خدمات</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
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
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
