import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BlogPostScreen(): JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      ((trpc as any).blog.getBySlug.query({ slug }) as any)
        .then((d: any) => {
          setPost(d);
          setLoading(false);
          setRefreshing(false);
        })
        .catch(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [slug],
  );
  useEffect(() => {
    fetch();
  }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  if (!post)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>المقال غير موجود</Text>
      </View>
    );
  const title = ((post.titleJson as any)?.ar as string) ?? String(slug).replace(/-/g, ' ');
  const body = ((post.bodyJson as any)?.ar as string) ?? '';
  const tags = (post.tags ?? []) as string[];
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').substring(0, 500);
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
      <Text style={styles.t}>{title}</Text>
      <View style={styles.meta}>
        {post.publishedAt && (
          <Text style={styles.date}>
            {new Date(post.publishedAt as string).toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        )}
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((t: string) => (
              <Text key={t} style={styles.tag}>
                {t}
              </Text>
            ))}
          </View>
        )}
      </View>
      <Text style={styles.body}>{stripHtml(body)}</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 20, paddingTop: 30, paddingBottom: 40 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 12 },
  meta: { marginBottom: 20 },
  date: { fontSize: 13, color: '#9ca3af', textAlign: 'right', marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  tag: {
    fontSize: 11,
    color: '#7c3aed',
    backgroundColor: '#ede9fe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  body: { fontSize: 15, color: '#374151', lineHeight: 26, textAlign: 'right' },
});
