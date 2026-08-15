import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface BeautyProfileData {
  skinType?: string;
  hairType?: string;
}

export default function BeautyProfileScreen(): JSX.Element {
  const q = trpc.beautyProfile.get.useQuery();
  if (q.isLoading) return <SkeletonList count={3} />;
  const data = q.data as unknown as BeautyProfileData | null;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> ملف الجمال</Text>
      {data && (
        <View style={styles.card}>
          <Text style={styles.label}>نوع البشرة: {data.skinType}</Text>
          <Text style={styles.label}>نوع الشعر: {data.hairType}</Text>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  label: { fontSize: 15, color: '#374151', paddingVertical: 6 },
});
