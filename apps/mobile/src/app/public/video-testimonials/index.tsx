import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function VideoTestimonialsScreen(): JSX.Element {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().videoTestimonials.list.query() as any)
      .then((d: any) => {
        setVideos(d || []);
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
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#dc2626']}
        />
      }
    >
      <Text style={styles.t}> تقييمات العملاء</Text>
      {videos.map((v, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.ve}>{(v.emoji as string) ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.vt}>{v.titleAr as string}</Text>
            <Text style={styles.vm}>
              ‍ {v.technician as string} ·  {v.views as number}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  ve: { fontSize: 32 },
  vt: { fontSize: 14, fontWeight: '600', color: '#111827' },
  vm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
