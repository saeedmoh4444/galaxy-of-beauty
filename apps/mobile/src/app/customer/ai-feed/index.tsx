import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AIFeedScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).aiFeatures.personalizedFeed.query() as any)
      .then((d: any) => {
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
  const recommendations = (data?.recommendations ?? []) as any[];
  const wishlistItems = (data?.wishlistItems ?? []) as any[];
  const skinProfile = data?.skinProfile as any;
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
          <Text style={styles.sd}>{skinProfile.skinType as string}</Text>
        </View>
      )}
      {recommendations.length > 0 && <Text style={styles.stl}> موصى به لكِ</Text>}
      {recommendations.map((r: any) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.em}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>
              {((r.titleJson as any)?.ar as string) ?? (r.nameAr as string)}
            </Text>
            <Text style={styles.meta}>{(r.basePrice as number)?.toLocaleString()} ر.س</Text>
          </View>
        </View>
      ))}
      {wishlistItems.length > 0 && <Text style={styles.stl}>️ من قائمة أمنياتكِ</Text>}
      {wishlistItems.map((w: any) => (
        <View key={w.id} style={styles.card}>
          <Text style={styles.em}>️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>
              {((w.titleJson as any)?.ar as string) ?? (w.nameAr as string)}
            </Text>
            <Text style={styles.meta}>{(w.basePrice as number)?.toLocaleString()} ر.س</Text>
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
