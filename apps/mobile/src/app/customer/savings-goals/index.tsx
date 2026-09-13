import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface SavingsGoal {
  id?: number;
  emoji?: string;
  nameAr?: string;
  current?: number;
  target?: number;
}

export default function SavingsGoalsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const goalsQ = trpc.savingsGoals.list.useQuery(undefined, { enabled: isAuthed });
  const data: SavingsGoal[] = (goalsQ.data as unknown as SavingsGoal[] | undefined) ?? [];
  if (goalsQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={goalsQ.isRefetching}
          onRefresh={() => goalsQ.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.savingsGoals.title')}</Text>
      {data.map((g, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{g.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{g.nameAr}</Text>
            <Text style={styles.progress}>
              {t('mobile.savingsGoals.progress', {
                current: g.current?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA') ?? '',
                target: g.target?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA') ?? '',
              })}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  progress: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
