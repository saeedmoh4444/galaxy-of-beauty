import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function VideoTestimonialsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.videoTestimonials.feed.query({ page: 1, limit: 12 }) as any).then((d: any) => { setItems(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#dc2626" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🎥 توصيات فيديو</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {items.map((t: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <View style={styles.thumb}><Text style={styles.playIcon}>▶️</Text></View>
            <View style={{ flex: 1 }}>
              <View style={styles.row}><Text style={styles.user}>{t.userName as string}</Text><Text style={styles.stars}>{"⭐".repeat(t.rating as number)}</Text></View>
              <Text style={styles.comment}>{t.comment as string}</Text>
              <Text style={styles.meta}>👩‍🎨 {t.technicianName as string} · ❤️ {t.likes as number}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef2f2' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#fecaca', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#dc2626', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, alignItems: 'center' },
  thumb: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  user: { fontSize: 13, fontWeight: '700', color: '#111827' },
  stars: { fontSize: 12 },
  comment: { fontSize: 13, color: '#374151', textAlign: 'right', lineHeight: 20 },
  meta: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 6 },
});
