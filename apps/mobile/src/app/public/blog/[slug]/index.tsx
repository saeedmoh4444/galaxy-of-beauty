import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function BlogPostScreen(): JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).blog.getBySlug.query({ slug }) as any)
      .then((d: any) => { setPost(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;
  if (!post) return <View style={styles.c}><Text style={styles.e}>المقال غير موجود</Text></View>;

  const title = (post.titleJson as any)?.ar as string ?? post.title as string ?? String(slug).replace(/-/g, ' ');
  const body = (post.bodyJson as any)?.ar as string ?? post.body as string ?? '';
  const tags = (post.tags ?? []) as string[];

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').substring(0, 500);

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{title}</Text>
      <View style={styles.meta}>
        {post.publishedAt && <Text style={styles.date}>{new Date(post.publishedAt as string).toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' })}</Text>}
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((t: string) => <Text key={t} style={styles.tag}>{t}</Text>)}
          </View>
        )}
      </View>
      <Text style={styles.body}>{stripHtml(body)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 20, paddingTop: 30, paddingBottom: 40 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 12 },
  meta: { marginBottom: 20 },
  date: { fontSize: 13, color: '#9ca3af', textAlign: 'right', marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  tag: { fontSize: 11, color: '#7c3aed', backgroundColor: '#ede9fe', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  body: { fontSize: 15, color: '#374151', lineHeight: 26, textAlign: 'right' },
});
