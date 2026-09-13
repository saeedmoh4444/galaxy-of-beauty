import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface BlogPostData {
  titleJson?: { ar?: string; en?: string };
  bodyJson?: { ar?: string; en?: string };
  tags?: string[];
  publishedAt?: string | null;
}

export default function BlogPostScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const postQ = trpc.blog.getBySlug.useQuery({ slug });

  if (postQ.isLoading) return <SkeletonList count={4} />;

  const post = (postQ.data as BlogPostData | undefined) ?? null;
  if (!post)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>{t('mobile.public.blog.not-found')}</Text>
      </View>
    );
  const title = localize(post.titleJson, locale) ?? String(slug).replace(/-/g, ' ');
  const body = localize(post.bodyJson, locale) ?? '';
  const tags = post.tags ?? [];
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').substring(0, 500);
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={postQ.isRefetching}
          onRefresh={() => postQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{title}</Text>
      <View style={styles.meta}>
        {post.publishedAt && (
          <Text style={styles.date}>
            {new Date(post.publishedAt ?? '').toLocaleDateString(
              locale === 'ar' ? 'ar-SA' : 'en-US',
              {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              },
            )}
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
