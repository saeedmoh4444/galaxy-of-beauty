import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface FeedResponse {
  items?: FeedItem[];
}

interface FeedItem {
  id?: number;
  emoji?: string;
  title?: string;
  technician?: string;
  brand?: string;
  price?: number;
  relevance?: number;
}

export default function PersonalizedFeedScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const feedQ = trpc.personalizedFeed.feed.useQuery(undefined, { enabled: isAuthed });
  if (feedQ.isLoading) return <SkeletonList count={5} />;
  const items = (feedQ.data as FeedResponse | null)?.items ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={feedQ.isRefetching}
          onRefresh={() => feedQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.personalizedFeed.title')}</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.em}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.technician
                ? `‍ ${item.technician}`
                : item.brand
                  ? `️ ${item.brand}`
                  : t('mobile.personalizedFeed.price', { price: item.price ?? 0 })}
            </Text>
          </View>
          <View style={styles.rb}>
            <Text style={styles.rt}>{item.relevance}%</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  em: { fontSize: 30 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rb: { backgroundColor: '#fdf2f8', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  rt: { fontSize: 11, fontWeight: '700', color: '#db2777' },
});
