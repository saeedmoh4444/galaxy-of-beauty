import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function GalleryScreen(): JSX.Element {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).gallery.photos.query() as any).then((d: any) => { setPhotos(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🖼️ معرض الصور</Text>
      <Text style={styles.sub}>أعمال الفنيات وتحولات الجمال</Text>
      {photos.length === 0 ? <Text style={styles.e}>لا توجد صور</Text> :
        <View style={styles.grid}>
          {photos.map((p: any, i: number) => (
            <View key={p.id ?? i} style={styles.photoCard}>
              {p.imageUrl ? <Image source={{uri: p.imageUrl as string}} style={styles.image} /> : <View style={styles.placeholder}><Text style={{fontSize:32}}>🖼️</Text></View>}
              <View style={styles.photoInfo}>
                <Text style={styles.photoTitle}>{p.title as string ?? '—'}</Text>
                <Text style={styles.photoBy}>👩‍🎨 {p.technician as string}</Text>
              </View>
            </View>
          ))}
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: 150 }, placeholder: { width: '100%', height: 150, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  photoInfo: { padding: 10 },
  photoTitle: { fontSize: 13, fontWeight: '600', color: '#111827' }, photoBy: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
