import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface LeaderboardEntry {
  id?: number;
  name?: string;
  rating?: number;
  bookings?: number;
}

export default function TechLeaderboardScreen(): JSX.Element {
  const { t } = useLocale();
  const boardQ = trpc.techLeaderboard.leaderboard.useQuery({ category: 'rating' });

  if (boardQ.isLoading) return <SkeletonList count={5} />;

  const board: LeaderboardEntry[] = (
    (boardQ.data as unknown as Array<{
      id?: number;
      name?: string;
      rating?: number;
      totalBookings?: number;
    }> | null) ?? []
  ).map((t) => ({
    id: t.id,
    name: t.name,
    rating: t.rating,
    bookings: t.totalBookings,
  }));

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={boardQ.isRefetching}
          onRefresh={() => boardQ.refetch()}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.tech-leaderboard.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.tech-leaderboard.subtitle')}</Text>
      {board.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.tech-leaderboard.empty')}</Text>
      ) : (
        board.map((item, i) => (
          <View key={item.id} style={[styles.card, i === 0 && styles.topCard]}>
            <View style={[styles.rank, i === 0 && styles.rankTop]}>
              <Text style={[styles.rankText, i === 0 && styles.rankTextTop]}>{i + 1}</Text>
            </View>
            <Text style={styles.rankEmoji}>{i === 0 ? '' : i === 1 ? '' : i === 2 ? '' : '‍'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.techName}>{item.name ?? ''}</Text>
              <Text style={styles.techMeta}>
                {item.rating ?? 0} ·{' '}
                {t('mobile.public.bookings-count', { count: item.bookings ?? 0 })}
              </Text>
            </View>
            {i === 0 && <Text style={styles.crown}></Text>}
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
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  topCard: { borderWidth: 2, borderColor: '#fcd34d', backgroundColor: '#fffbeb' },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTop: { backgroundColor: '#fcd34d' },
  rankText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  rankTextTop: { color: '#d97706' },
  rankEmoji: { fontSize: 24 },
  techName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  techMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  crown: { fontSize: 28 },
});
