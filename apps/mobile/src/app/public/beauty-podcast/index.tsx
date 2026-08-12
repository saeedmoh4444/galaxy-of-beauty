import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyPodcastScreen(): JSX.Element {
  const {
    data: eps,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => (trpc as any).beautyPodcast.list.query());

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل البودكاست" onRetry={refetch} />;

  const items = (eps ?? []) as Record<string, unknown>[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />
      }
    >
      <Text style={styles.t}>🎙️ بودكاست الجمال</Text>
      <Text style={styles.sub}>حلقات شيقة عن الجمال والعناية</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد حلقات</Text>
      ) : (
        items.map((e: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.epEmoji}>{(e.emoji as string) ?? '🎙️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.epTitle}>{e.titleAr as string}</Text>
              <Text style={styles.epHost}>🎤 {e.host as string}</Text>
              <Text style={styles.epDuration}>⏱️ {e.duration as string}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
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
  epEmoji: { fontSize: 32 },
  epTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  epHost: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  epDuration: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
