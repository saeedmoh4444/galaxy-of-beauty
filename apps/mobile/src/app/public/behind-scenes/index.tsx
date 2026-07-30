import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BehindScenesScreen() {
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.behindScenes.feed.query() as any).then((d: any) => { setVideos(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#0284c7" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>📹 وراء الكواليس</Text></View>
      <ScrollView contentContainerStyle={styles.grid}>
        {videos.map((v: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <View style={styles.thumb}><Text style={styles.thumbEmoji}>{v.emoji as string}</Text></View>
            <Text style={styles.cardTitle} numberOfLines={2}>{v.title as string}</Text>
            <View style={styles.meta}>
              <Text style={styles.metaText}>👩‍🎨 {v.technicianName as string}</Text>
              <Text style={styles.metaText}>⏱️ {v.duration as string}</Text>
            </View>
            <Text style={styles.views}>👁️ {(v.views as number)?.toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0f2fe', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#0284c7', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, paddingBottom: 40 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 8, margin: '1%', marginBottom: 10 },
  thumb: { height: 100, borderRadius: 10, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  thumbEmoji: { fontSize: 36 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 10, color: '#6b7280' },
  views: { fontSize: 10, color: '#0284c7', textAlign: 'right', marginTop: 4, fontWeight: '600' },
});
