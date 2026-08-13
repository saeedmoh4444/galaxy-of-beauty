import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function GiftGuideScreen(): JSX.Element {
  const {
    data: guides,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => typedTrpc().giftGuide.list.query());

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل الدليل" onRetry={refetch} />;

  const items = (guides ?? []) as any[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={styles.t}> دليل الهدايا</Text>
      <Text style={styles.sub}>أفكار هدايا لكل المناسبات</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد أدلة</Text>
      ) : (
        items.map((g) => (
          <View key={g.id} style={styles.card}>
            <Text style={styles.guideEmoji}>{(g.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guideTitle}>{g.titleAr as string}</Text>
              <Text style={styles.guideOccasion}>{g.occasionAr as string}</Text>
              <Text style={styles.guidePrice}>
                من {(g.priceRange as string) ?? (g.minPrice as number)?.toLocaleString() + ' ر.س'}
              </Text>
            </View>
            <TouchableOpacity style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>عرض</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
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
  guideEmoji: { fontSize: 32 },
  guideTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  guideOccasion: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  guidePrice: { fontSize: 13, fontWeight: '700', color: '#db2777', marginTop: 4 },
  viewBtn: {
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
