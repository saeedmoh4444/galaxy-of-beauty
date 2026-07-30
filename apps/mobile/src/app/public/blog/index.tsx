import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function BlogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [posts, setPosts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.blog.list.query({ page: 1, limit: 20 }) as any as Promise<{ items: Record<string, unknown>[] }>)
      .then((d) => { setPosts(d.items); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>📝 المدونة</Text></View>
      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> : (
        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
          {posts.map((p: Record<string, unknown>, i: number) => {
            const title = (p.titleJson as Record<string, string>)?.ar || '';
            const tags = (p.tags as string[]) ?? [];
            const date = p.publishedAt ? new Date(p.publishedAt as string).toLocaleDateString('ar-SA') : '';
            return (
              <TouchableOpacity key={i} style={styles.card} onPress={() => router.push(`/public/blog/${p.slug as string}` as any)} activeOpacity={0.8}>
                <View style={styles.cardImage}><Text style={styles.cardEmoji}>✨</Text></View>
                {tags.length > 0 && <View style={styles.tags}>{tags.slice(0, 2).map((t) => <Text key={t} style={styles.tag}>{t}</Text>)}</View>}
                <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
                {date ? <Text style={styles.date}>📅 {date}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  body: { flex: 1, padding: 16 },
  card: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardImage: { height: 100, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardEmoji: { fontSize: 40 },
  tags: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  tag: { fontSize: 10, color: '#7c3aed', backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
});
