import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

interface BehindScenesVideo {
  emoji?: string;
  titleAr?: string;
  duration?: string;
}

export default function BehindScenesScreen(): JSX.Element {
  const [videos, setVideos] = useState<BehindScenesVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    rawTrpc.behindScenes.feed
      .query()
      .then((d: BehindScenesVideo[]) => {
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
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> كواليس الجمال</Text>
      <Text style={styles.sub}>لقطات من وراء الكواليس</Text>
      {videos.length === 0 ? (
        <Text style={styles.e}>لا توجد فيديوهات</Text>
      ) : (
        videos.map((v, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.vidEmoji}>{(v.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.vidTitle}>{v.titleAr as string}</Text>
              <Text style={styles.vidDur}>️ {v.duration as string}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  vidEmoji: { fontSize: 32 },
  vidTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  vidDur: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
