import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const { width } = Dimensions.get('window');
const COL_SIZE = (width - 40) / 2;

export default function GalleryScreen() {
  const { technicianId } = useLocalSearchParams<{ technicianId: string }>();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tid = Number(technicianId);
    if (isNaN(tid)) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.gallery.byTechnician.query({ technicianId: tid, page: 1, limit: 50 }) as any as Promise<Record<string, unknown>>)
      .then((d) => { setItems((d.items as Record<string, unknown>[]) || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [technicianId]);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>معرض الأعمال</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🖼️</Text>
          <Text style={styles.emptyText}>لا توجد صور في المعرض</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((img) => (
            <View key={img.id as number} style={styles.card}>
              <View style={styles.imageBox}>
                {img.imageUrl ? (
                  <Image source={{ uri: img.imageUrl as string }} style={styles.image} resizeMode="cover" />
                ) : (
                  <Text style={styles.imagePlaceholder}>🖼️</Text>
                )}
              </View>
              {(img.captionAr || img.isBefore || img.category) ? (
                <View style={styles.caption}>
                  {img.captionAr ? <Text style={styles.captionText} numberOfLines={2}>{String(img.captionAr)}</Text> : null}
                  <View style={styles.badges}>
                    {img.isBefore ? <Text style={styles.badge}>قبل</Text> : null}
                    {img.category ? <Text style={styles.catBadge}>{String(img.category)}</Text> : null}
                  </View>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 12, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 16, paddingHorizontal: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { width: COL_SIZE, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8 },
  imageBox: { aspectRatio: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 36 },
  caption: { padding: 8 },
  captionText: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'right' },
  badges: { flexDirection: 'row', gap: 4, marginTop: 4 },
  badge: { backgroundColor: '#f5f3ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontSize: 10, color: '#7c3aed', overflow: 'hidden' },
  catBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontSize: 10, color: '#6b7280', overflow: 'hidden' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});
