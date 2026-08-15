import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

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
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (rawTrpc.personalizedFeed.feed.query() as Promise<FeedResponse>)
      .then((d) => {
        setData(d);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  if (loading) return <SkeletonList count={5} />;
  const items = data?.items ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> خلاصتي</Text>
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
                  : ` ${item.price} ر.س`}
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
