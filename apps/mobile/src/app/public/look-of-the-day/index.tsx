import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function LookOfTheDayScreen(): JSX.Element {
  const [looks, setLooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().lookOfTheDay.list.query() as any)
      .then((d: any) => {
        setLooks(d || []);
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
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> إطلالة اليوم</Text>
      {looks.map((l: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.le}>{(l.emoji as string) ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.lt}>{l.titleAr as string}</Text>
            <Text style={styles.ld}>{l.descAr as string}</Text>
            <Text style={styles.lb}>‍ {l.technician as string}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  le: { fontSize: 40 },
  lt: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ld: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  lb: { fontSize: 12, color: '#f59e0b', marginTop: 4 },
});
