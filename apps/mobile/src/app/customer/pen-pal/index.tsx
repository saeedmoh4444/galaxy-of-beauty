import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface PenPalMatch {
  name?: string;
  matchReason?: string;
}

export default function PenPalScreen(): JSX.Element {
  const [data, setData] = useState<PenPalMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc()
      .penPal.match.query()
      .then((d) => {
        setData((d?.[0] ?? null) as unknown as PenPalMatch);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) return <SkeletonList count={3} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> صديقة الجمال</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.emoji}>‍</Text>
          <Text style={styles.name}>{data.name ?? ''}</Text>
          <Text style={styles.match}>{data.matchReason ?? ''}</Text>
        </View>
      ) : (
        <Text style={styles.e}>لم تجدِ صديقة بعد</Text>
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
