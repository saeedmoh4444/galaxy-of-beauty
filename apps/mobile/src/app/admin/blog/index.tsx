import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { BULK_PAGE_SIZE } from '@galaxy/ui';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface BlogPost {
  id?: number;
  titleJson?: { ar?: string };
  slug?: string;
  isPublished?: boolean;
}

interface BlogListResponse {
  items?: BlogPost[];
}

export default function AdminBlogScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.blog.listAll.useQuery({ page: 1, limit: BULK_PAGE_SIZE });
  const data = (q.data as unknown as BlogListResponse | null)?.items ?? [];

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError)
    return <ErrorAlert message={t('mobile.admin.blog.load-error')} onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('admin.blog.title')}</Text>
      {data.map((p, i) => (
        <View key={i} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{localize(p.titleJson, locale)}</Text>
            <Text style={styles.meta}>{p.slug ?? ''}</Text>
          </View>
          <View style={[styles.badge, p.isPublished ? styles.pub : styles.draft]}>
            <Text style={styles.badgeText}>
              {p.isPublished ? t('admin.beauty-events.published') : t('admin.blog.draft')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  title: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  pub: { backgroundColor: '#dcfce7' },
  draft: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
