import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function LookOfTheDayScreen() {
  const insets = useSafeAreaInsets();
  const [looks, setLooks] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.lookOfTheDay.feed.query({ page: 1, limit: 12 }) as any).then((d: any) => { setLooks(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>📸 إطلالة اليوم</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {looks.map((l: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <View style={styles.imagePlaceholder}><Text style={styles.imageEmoji}>📸</Text></View>
            <Text style={styles.cardTitle}>{l.title as string}</Text>
            <View style={styles.row}>
              <Text style={styles.tech}>👩‍🎨 {l.technicianName as string}</Text>
              <Text style={styles.votes}>❤️ {l.votes as number}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#fce7f3', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#be185d', textAlign: 'center' },
  inner: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, paddingBottom: 40 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 8, margin: '1%', marginBottom: 10 },
  imagePlaceholder: { height: 120, borderRadius: 10, backgroundColor: '#fce7f3', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  imageEmoji: { fontSize: 36 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  tech: { fontSize: 10, color: '#6b7280' },
  votes: { fontSize: 11, color: '#dc2626', fontWeight: '600' },
});
