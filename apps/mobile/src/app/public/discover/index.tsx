import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface DiscoverCategory {
  id?: number;
  key?: string;
  emoji?: string;
  nameAr?: string;
}

interface TrendingItem {
  id?: number;
  emoji?: string;
  nameAr?: string;
  titleAr?: string;
  descAr?: string;
  description?: string;
  price?: number;
  rating?: number;
}

export default function DiscoverScreen(): JSX.Element {
  const {
    data: trending,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => typedTrpc().beautyDiscovery.featured.query());
  const { data: categories } = useQuery(() => typedTrpc().categories.list.query());

  if (loading) return <SkeletonList count={6} />;
  if (error) return <ErrorAlert message="فشل تحميل المحتوى" onRetry={refetch} />;

  const trendingItems = (trending as TrendingItem[] | undefined) ?? [];
  const catItems = (categories as DiscoverCategory[] | undefined) ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={styles.t}> اكتشف</Text>
      <Text style={styles.sub}>اكتشفي خدمات وأفكار جديدة</Text>
      {catItems.length > 0 && (
        <>
          <Text style={styles.sectionTitle}> الفئات</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {catItems.map((cat) => (
                <TouchableOpacity key={cat.id ?? cat.key} style={styles.catChip}>
                  <Text style={styles.catEmoji}>{cat.emoji ?? ''}</Text>
                  <Text style={styles.catName}>{cat.nameAr ?? ''}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </>
      )}
      <Text style={styles.sectionTitle}> الأكثر رواجاً</Text>
      {trendingItems.length === 0 ? (
        <Text style={styles.e}>لا توجد نتائج</Text>
      ) : (
        trendingItems.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.cardEmoji}>{t.emoji ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t.nameAr ?? t.titleAr ?? ''}</Text>
              <Text style={styles.cardDesc}>
                {(t.descAr ?? t.description ?? '')?.substring(0, 100)}
              </Text>
              <View style={styles.cardMeta}>
                <Text style={styles.price}>{(t.price ?? 0).toLocaleString()} ر.س</Text>
                <Text style={styles.rating}> {t.rating ?? 0}</Text>
              </View>
            </View>
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
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  catChip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    minWidth: 80,
  },
  catEmoji: { fontSize: 28 },
  catName: { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  cardEmoji: { fontSize: 32 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardDesc: { fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  price: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  rating: { fontSize: 12, color: '#f59e0b' },
});
