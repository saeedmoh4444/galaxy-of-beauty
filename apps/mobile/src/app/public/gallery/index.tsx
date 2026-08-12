import { View, Text, ScrollView, StyleSheet, Image, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function GalleryScreen(): JSX.Element {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).gallery.photos.query() as any)
      .then((d: any) => {
        setPhotos(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  if (loading) return <SkeletonList count={6} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>️ معرض الصور</Text>
      <View style={styles.grid}>
        {photos.map((p: any, i: number) => (
          <View key={p.id ?? i} style={styles.pc}>
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl as string }} style={styles.img} />
            ) : (
              <View style={styles.ph}>
                <Text style={{ fontSize: 32 }}>️</Text>
              </View>
            )}
            <View style={styles.pi}>
              <Text style={styles.pt}>{(p.title as string) ?? '—'}</Text>
              <Text style={styles.pb}>‍ {p.technician as string}</Text>
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
