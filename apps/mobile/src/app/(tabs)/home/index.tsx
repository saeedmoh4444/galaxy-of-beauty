import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useHaptics } from '@/hooks/useHaptics';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const { trigger } = useHaptics();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).categories.list.query() as any).then((d: any) => { setCats(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={6} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#7c3aed']} />}>
      <Text style={styles.t}>🏠 جالكسي بيوتي</Text>
      <View style={styles.grid}>{cats.map((cat: any, i: number) => (<TouchableOpacity key={i} onPress={() => { trigger('light'); router.push('/public/services' as any); }} style={styles.card}><Text style={styles.ce}>{cat.emoji as string ?? '📂'}</Text><Text style={styles.cn}>{(cat.nameJson as any)?.ar as string ?? cat.nameAr as string}</Text></TouchableOpacity>))}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '30%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ce: { fontSize: 30 }, cn: { fontSize: 11, fontWeight: '600', color: '#111827', marginTop: 6, textAlign: 'center' },
});
