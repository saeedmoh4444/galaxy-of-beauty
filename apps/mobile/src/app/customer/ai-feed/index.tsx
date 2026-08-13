import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface FeedItem {
  id?: number;
  titleJson?: { ar?: string; en?: string };
  nameAr?: string;
  basePrice?: number;
}

interface AIFeedData {
  recommendations?: FeedItem[];
  wishlistItems?: FeedItem[];
  skinProfile?: { skinType?: string };
}

export default function AIFeedScreen(): JSX.Element {
  const [data, setData] = useState<AIFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().aiFeatures.personalizedFeed.query() as Promise<AIFeedData>)
      .then((d: AIFeedData) => {
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
  if (loading) return <SkeletonList count={4} />;
  const recommendations = data?.recommendations ?? [];
  const wishlistItems = data?.wishlistItems ?? [];
  const skinProfile = data?.skinProfile;
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
      <Text style={styles.t}> خلاصتي الذكية</Text>
      {skinProfile && (
        <View style={styles.sc}>
          <Text style={styles.st}> ملف بشرتكِ</Text>
          <Text style={styles.sd}>{skinProfile.skinType}</Text>
        </View>
      )}
      {recommendations.length > 0 && <Text style={styles.stl}> موصى به لكِ</Text>}
      {recommendations.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.em}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>
              {r.titleJson?.ar ?? r.nameAr}
            </Text>
            <Text style={styles.meta}>{r.basePrice?.toLocaleString()} ر.س</Text>
          </View>
        </View>
      ))}
      {wishlistItems.length > 0 && <Text style={styles.stl}>️ من قائمة أمنياتكِ</Text>}
      {wishlistItems.map((w) => (
        <View key={w.id} style={styles.card}>
          <Text style={styles.em}>️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>
              {w.titleJson?.ar ?? w.nameAr}
            </Text>
            <Text style={styles.meta}>{w.basePrice?.toLocaleString()} ر.س</Text>
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
  sc: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#c4b5fd',
  },
  st: { fontSize: 16, fontWeight: '700', color: '#7c3aed', marginBottom: 8 },
  sd: { fontSize: 14, color: '#374151' },
  stl: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  em: { fontSize: 28 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
