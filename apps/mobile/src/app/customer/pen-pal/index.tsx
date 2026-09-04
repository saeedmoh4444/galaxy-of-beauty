import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface PenPalMatch {
  name?: string;
  matchReason?: string;
}

export default function PenPalScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const matchQ = trpc.penPal.match.useQuery(undefined, { enabled: isAuthed });
  const data = (matchQ.data?.[0] ?? null) as unknown as PenPalMatch;

  if (matchQ.isLoading) return <SkeletonList count={3} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={matchQ.isRefetching}
          onRefresh={() => matchQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.penPal.title')}</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.emoji}>‍</Text>
          <Text style={styles.name}>{data.name ?? ''}</Text>
          <Text style={styles.match}>{data.matchReason ?? ''}</Text>
        </View>
      ) : (
        <Text style={styles.e}>{t('mobile.penPal.no-match')}</Text>
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
  name: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  match: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
});
