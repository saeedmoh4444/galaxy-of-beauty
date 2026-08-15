import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface Challenge {
  id?: string;
  emoji?: string;
  nameAr?: string;
  descAr?: string;
  reward?: string;
}

const GRADIENTS: Record<string, string[]> = {
  '7day_skincare': ['#f43f5e', '#ec4899'],
  '5bookings': ['#f59e0b', '#f97316'],
  first_review: ['#3b82f6', '#06b6d4'],
  streak_4weeks: ['#8b5cf6', '#7c3aed'],
  refer_3friends: ['#10b981', '#059669'],
};

export default function ChallengesScreen(): JSX.Element {
  const challengesQ = trpc.challenges.list.useQuery();

  if (challengesQ.isLoading) return <SkeletonList count={4} />;
  if (challengesQ.isError)
    return <ErrorAlert message="فشل تحميل التحديات" onRetry={() => challengesQ.refetch()} />;

  const items = (challengesQ.data ?? []) as Challenge[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={challengesQ.isRefetching}
          onRefresh={() => challengesQ.refetch()}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> تحديات الجمال</Text>
      <Text style={styles.sub}>أكملي التحديات واكسبي مكافآت</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد تحديات</Text>
      ) : (
        items.map((ch) => {
          const colors = GRADIENTS[ch.id as string] ?? ['#6b7280', '#9ca3af'];
          return (
            <TouchableOpacity
              key={ch.id}
              style={[styles.card, { borderLeftColor: colors[0], borderLeftWidth: 4 }]}
            >
              <Text style={styles.chEmoji}>{(ch.emoji as string) ?? ''}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.chName}>{ch.nameAr as string}</Text>
                <Text style={styles.chDesc}>{ch.descAr as string}</Text>
                <Text style={styles.chReward}> {ch.reward as string}</Text>
              </View>
            </TouchableOpacity>
          );
        })
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
  chEmoji: { fontSize: 32 },
  chName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  chDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  chReward: { fontSize: 12, fontWeight: '600', color: '#059669', marginTop: 4 },
});
