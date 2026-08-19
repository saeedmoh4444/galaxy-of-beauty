import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

interface BlogPost {
  titleJson?: { ar?: string; en?: string };
  publishedAt?: string;
}

export default function BlogScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const blog = trpc.blog.list.useQuery({ page: 1, limit: 10 });

  return (
    <ScreenState
      isLoading={blog.isLoading}
      isError={blog.isError}
      isEmpty={!blog.data?.items?.length}
      errorMessage={t('mobile.public.blog.load-error')}
      emptyTitle={t('mobile.public.blog.empty')}
      onRetry={() => blog.refetch()}
    >
      <Text style={styles.title}>{t('mobile.public.blog.title')}</Text>
      {((blog.data as { items?: BlogPost[] } | undefined)?.items || []).map((post, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.postTitle}>{localize(post.titleJson, locale)}</Text>
          <Text style={styles.postDate}>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')
              : ''}
          </Text>
        </View>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postTitle: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  postDate: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
});
