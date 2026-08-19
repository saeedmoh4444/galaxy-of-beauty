import { View, Text, ScrollView, StyleSheet, Image, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface GalleryPhoto {
  id?: number;
  imageUrl?: string;
  title?: string;
  technician?: string;
}

export default function GalleryScreen(): JSX.Element {
  const { t } = useLocale();
  const photosQ = trpc.gallery.byTechnician.useQuery({ technicianId: 1 });

  if (photosQ.isLoading) return <SkeletonList count={6} />;

  const photos = (photosQ.data as unknown as { items?: GalleryPhoto[] })?.items ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={photosQ.isRefetching}
          onRefresh={() => photosQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.gallery.title')}</Text>
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
            <View style={styles.pi}>
              <Text style={styles.pt}>{p.title ?? '—'}</Text>
              <Text style={styles.pb}>‍ {p.technician ?? ''}</Text>
            </View>
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
  pi: { padding: 10 },
  pt: { fontSize: 13, fontWeight: '600', color: '#111827' },
  pb: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
