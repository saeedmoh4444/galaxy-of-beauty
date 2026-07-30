import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyPodcastScreen() {
  const insets = useSafeAreaInsets();
  const [eps, setEps] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.beautyPodcast.episodes.query() as any).then((d: any) => { setEps(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  const icons: any = { skincare: '✨', makeup: '💄', hair: '💇‍♀️', natural: '🌿', bridal: '👰' };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🎙️ بودكاست الجمال</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {eps.map((e: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.epEmoji}>{icons[e.category as string] || '🎙️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.epTitle}>{e.titleAr as string}</Text>
              <Text style={styles.epHost}>🎤 {e.host as string} · ⏱️ {e.duration as string}</Text>
              <Text style={styles.epDesc}>{e.description as string}</Text>
            </View>
            <View style={styles.playBtn}><Text style={styles.playIcon}>▶</Text></View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ede9fe', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#7c3aed', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  epEmoji: { fontSize: 32 },
  epTitle: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right' },
  epHost: { fontSize: 11, color: '#6b7280', textAlign: 'right', marginTop: 4 },
  epDesc: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#fff', fontSize: 14, marginLeft: 2 },
});
