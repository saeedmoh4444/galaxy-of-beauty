import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface Tutorial {
  id?: number;
  emoji?: string;
  titleAr?: string;
  categoryAr?: string;
  difficultyAr?: string;
  duration?: string;
  views?: number;
}

export default function TutorialsScreen(): JSX.Element {
  const { t } = useLocale();
  const tutorialsQ = trpc.tutorials.list.useQuery({});

  if (tutorialsQ.isLoading) return <SkeletonList count={4} />;

  const tutorials = ((tutorialsQ.data as unknown as { items?: Tutorial[] } | null)?.items ??
    []) as Tutorial[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={tutorialsQ.isRefetching}
          onRefresh={() => tutorialsQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.tutorials.title')}</Text>
      {tutorials.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.te}>{t.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tt}>{t.titleAr}</Text>
            <Text style={styles.tm}>
              {t.categoryAr} · {t.difficultyAr} · ️ {t.duration}
            </Text>
          </View>
          <Text style={styles.tv}> {t.views}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  te: { fontSize: 32 },
  tt: { fontSize: 14, fontWeight: '600', color: '#111827' },
  tm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  tv: { fontSize: 11, color: '#9ca3af' },
});
