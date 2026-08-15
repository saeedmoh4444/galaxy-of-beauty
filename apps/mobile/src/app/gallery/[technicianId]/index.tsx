import { View, Text, ScrollView, Image, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';

interface GalleryPhoto {
  id?: number;
  imageUrl?: string;
  title?: string;
}

export default function GalleryDetailScreen(): JSX.Element {
  const { technicianId } = useLocalSearchParams<{ technicianId: string }>();
  const q = trpc.gallery.byTechnician.useQuery({ technicianId: parseInt(technicianId, 10) });
  const photos = (q.data as unknown as { items?: GalleryPhoto[] } | null)?.items ?? [];
  if (q.isLoading) return <SkeletonList count={6} />;
  if (q.isError) return <ErrorAlert message="فشل تحميل معرض الفنية" onRetry={() => q.refetch()} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>️ معرض الفنية</Text>
      <View style={styles.grid}>
        {photos.map((p, i) => (
          <View key={p.id ?? i} style={styles.pc}>
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl }} style={styles.img} />
            ) : (
              <View style={styles.ph}>
                <Text style={{ fontSize: 32 }}>️</Text>
              </View>
            )}
            <Text style={styles.pt}>{p.title ?? '—'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pc: { width: '47%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  img: { width: '100%', height: 150 },
  ph: {
    width: '100%',
    height: 150,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pt: { fontSize: 13, fontWeight: '600', color: '#111827', padding: 10 },
});
