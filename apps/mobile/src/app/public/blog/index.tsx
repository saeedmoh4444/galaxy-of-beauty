import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useRouter } from 'expo-router';

export default function BlogScreen(): JSX.Element {
  const router = useRouter();
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.blog.list.query({ page: 1, limit: LARGE_PAGE_SIZE }) as any);

  if (loading) return <View style={styles.container}><View style={styles.header}><Text style={styles.title}>📝 المدونة</Text></View><SkeletonList count={4} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل المدونة" onRetry={refetch} />;

  const posts = ((data as any)?.items ?? []) as Record<string, unknown>[];

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>📝 المدونة</Text></View>
      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  body: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardImage: { height: 100, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardEmoji: { fontSize: 40 },
  tags: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  tag: { fontSize: 10, color: '#7c3aed', backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
});
