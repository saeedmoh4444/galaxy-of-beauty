import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyExpoScreen(): JSX.Element {
  const [booths, setBooths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    (trpc.beautyExpo.booths.query() as any).then((d: any) => { setBooths(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={4} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#7c3aed']} />}>
      <Text style={styles.t}>🎪 معرض الجمال</Text>
      <Text style={styles.sub}>أجنحة وفعاليات المعرض</Text>
      {booths.length === 0 ? <Text style={styles.e}>لا توجد أجنحة</Text> :
        booths.map((b: any, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.emoji}>{b.emoji as string ?? '🎪'}</Text>
            <View style={{flex:1}}><Text style={styles.name}>{b.nameAr as string}</Text><Text style={styles.desc}>{b.descAr as string}</Text></View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  emoji: { fontSize: 32 }, name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  desc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
