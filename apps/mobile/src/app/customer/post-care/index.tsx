import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface PostCarePlan {
  id?: number;
  emoji?: string;
  nameAr?: string;
  descAr?: string;
}

export default function PostCareScreen(): JSX.Element {
  const libraryQ = trpc.postCare.library.useQuery();
  const data: PostCarePlan[] =
    (libraryQ.data as unknown as { categories?: PostCarePlan[] } | null)?.categories ?? [];
  if (libraryQ.isLoading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={libraryQ.isRefetching}
          onRefresh={() => libraryQ.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>‍️ عناية ما بعد الخدمة</Text>
      {data.map((p, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{p.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.nameAr ?? ''}</Text>
            <Text style={styles.desc}>{p.descAr ?? ''}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  desc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
