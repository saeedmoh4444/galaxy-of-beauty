import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { SkeletonList } from '@/components/SkeletonCard';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';

interface GoalTrack {
  key: string;
  emoji: string;
  titleKey: TranslationKey;
  target: number;
}

const GT: GoalTrack[] = [
  { key: 'glowing_skin', emoji: '✨', titleKey: 'beautyDiary.glow-skin', target: 12 },
  { key: 'hair_care', emoji: '💇', titleKey: 'mobile.beautyGoals.goal.hairCare', target: 8 },
  { key: 'selfcare', emoji: '🧘', titleKey: 'mobile.beautyGoals.goal.selfCare', target: 20 },
  { key: 'nails', emoji: '💅', titleKey: 'mobile.beautyGoals.goal.nails', target: 24 },
];

export default function BeautyGoalsScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const q = trpc.beautyBudget.get.useQuery(undefined, { enabled: isAuthed });
  if (q.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={async () => {
            await q.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('beautyGoals.title')}</Text>
      <View style={styles.grid}>
        {GT.map((g) => {
          const pct = Math.min(100, Math.floor(Math.random() * 100));
          return (
            <View key={g.key} style={styles.card}>
              <Text style={styles.ge}>{g.emoji}</Text>
              <Text style={styles.gt}>{t(g.titleKey)}</Text>
              <View style={styles.pb}>
                <View style={[styles.pf, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.gm}>{t('beautyGoals.progress', { target: g.target, pct })}</Text>
              <View style={styles.sb}>
                <Text style={styles.sbt}>{t('beautyGoals.set-target')}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  ge: { fontSize: 40 },
  gt: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 },
  pb: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, width: '100%', marginTop: 12 },
  pf: { height: 6, backgroundColor: '#059669', borderRadius: 3 },
  gm: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  sb: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  sbt: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
