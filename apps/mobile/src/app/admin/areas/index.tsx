import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

interface Area {
  id: number;
  nameAr?: string;
  nameEn?: string;
}

export default function AdminAreasScreen(): JSX.Element {
  const q = trpc.platform.listAreas.useQuery({});
  const data = (q.data as unknown as Area[] | null) ?? [];
  const deleteMut = trpc.platform.deleteArea.useMutation({ onSuccess: () => void q.refetch() });

  const remove = (id: number) => {
    deleteMut.mutate({ id });
  };

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل المناطق" onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}> المناطق</Text>
      {data.map((a, i) => (
        <View key={i} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{a.nameAr ?? ''}</Text>
            <Text style={styles.meta}>{a.nameEn ?? ''}</Text>
          </View>
          <TouchableOpacity onPress={() => remove(a.id)}>
            <Text style={styles.del}>️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  del: { fontSize: 20 },
});
