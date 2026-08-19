import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface BirthdayReward {
  rewardName?: string;
  promoCode?: string;
}

export default function BirthdayRewardsScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.birthdayRewards.myReward.useQuery();
  if (q.isLoading) return <SkeletonList count={3} />;
  const data = (q.data ?? null) as BirthdayReward | null;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('birthdayRewards.title')}</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.emoji}></Text>
          <Text style={styles.reward}>{data.rewardName}</Text>
          <Text style={styles.code}>
            {t('birthdayRewards.code', { code: String(data.promoCode ?? '') })}
          </Text>
          <TouchableOpacity style={styles.claimBtn}>
            <Text style={styles.claimText}>{t('birthdayRewards.claim')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.e}>{t('birthdayRewards.empty')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbcfe8',
  },
  emoji: { fontSize: 48 },
  reward: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 8 },
  code: {
    fontSize: 14,
    fontWeight: '600',
    color: '#db2777',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  claimBtn: {
    backgroundColor: '#db2777',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  claimText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
