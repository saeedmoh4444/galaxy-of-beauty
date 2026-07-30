import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeforeAfterScreen() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.beforeAfter.feed.query({ page: 1, limit: 12 }) as any as Promise<{ items: Record<string, unknown>[] }>)
      .then((data) => { setItems(data.items); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>📸 قبل وبعد</Text>
      <Text style={styles.subtitle}>تحولات حقيقية</Text>
      {items.map((t: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.compareRow}>
            <View style={styles.side}><Text style={styles.label}>قبل</Text><View style={styles.placeholder}><Text style={styles.placeholderEmoji}>👩</Text></View></View>
            <View style={styles.side}><Text style={styles.label}>بعد</Text><View style={[styles.placeholder, styles.afterPlaceholder]}><Text style={styles.placeholderEmoji}>✨</Text></View></View>
          </View>
          <Text style={styles.desc}>{t.description as string}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>👩‍🎨 {t.technicianName as string}</Text>
            <Text style={styles.likes}>❤️ {t.likes as number}</Text>
            <Text style={styles.metaText}>{t.userName as string}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  compareRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  side: { flex: 1 },
  label: { fontSize: 10, color: '#9ca3af', textAlign: 'center', marginBottom: 4 },
  placeholder: { height: 100, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  afterPlaceholder: { backgroundColor: '#ede9fe' },
  placeholderEmoji: { fontSize: 36 },
  desc: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  metaText: { fontSize: 11, color: '#9ca3af' },
  likes: { fontSize: 11, color: '#ef4444', fontWeight: '600' },
});
