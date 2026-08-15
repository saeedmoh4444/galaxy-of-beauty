import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface TrendingService {
  id?: number;
  titleJson?: { ar?: string; en?: string };
  name?: string;
  bookingCount?: number;
  basePrice?: number;
}

interface SpotlightTech {
  id?: number;
  name?: string;
  city?: string;
  ratingAvg?: number;
}

export default function TrendingScreen(): JSX.Element {
  const trendingQ = trpc.social.trending.useQuery();
  const spotlightQ = trpc.social.spotlight.useQuery();

  if (trendingQ.isLoading) return <SkeletonList count={5} />;
  if (trendingQ.isError)
    return <ErrorAlert message="فشل تحميل المحتوى" onRetry={() => trendingQ.refetch()} />;

  const trendingItems = (trendingQ.data as unknown as TrendingService[] | undefined) ?? [];
  const spotlightItems = (spotlightQ.data as unknown as SpotlightTech[] | undefined) ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={trendingQ.isRefetching}
          onRefresh={() => trendingQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}> الأكثر رواجاً</Text>
      <Text style={styles.sub}>الخدمات والفنيات الأكثر طلباً هذا الشهر</Text>
      {trendingItems.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>‍️ الخدمات الرائجة</Text>
          {trendingItems.map((s, i) => (
            <View key={s.id ?? i} style={styles.card}>
              <View style={styles.rank}>
                <Text style={styles.rankText}>#{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.svcName}>{s.titleJson?.ar ?? s.name}</Text>
                <Text style={styles.svcBookings}>{s.bookingCount} حجز</Text>
              </View>
              <Text style={styles.svcPrice}>{s.basePrice?.toLocaleString()} ر.س</Text>
            </View>
          ))}
        </>
      )}
      {spotlightItems.length > 0 && (
        <>
          <Text style={styles.sectionTitle}> فنيات مميزات</Text>
          {spotlightItems.map((t, i) => (
            <View key={t.id ?? i} style={styles.card}>
              <Text style={styles.techEmoji}>
                {i === 0 ? '' : i === 1 ? '' : i === 2 ? '' : '‍'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.techName}>{t.name}</Text>
                <Text style={styles.techMeta}>
                  {t.city} · {t.ratingAvg}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '700', color: '#db2777' },
  svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  svcBookings: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  svcPrice: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  techEmoji: { fontSize: 28 },
  techName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  techMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
