import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function ServicesScreen(): JSX.Element {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).services.list.query({}) as any).then((d: any) => { setData(d?.items || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  if (loading) return <SkeletonList count={6} />;
  const filtered = search ? data.filter((s: any) => ((s.titleJson as any)?.ar as string ?? '').includes(search)) : data;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#db2777']} />}>
      <Text style={styles.t}>💆‍♀️ الخدمات</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="ابحثي..." style={styles.inp} placeholderTextColor="#9ca3af" />
      <View style={styles.grid}>{filtered.map((s: any, i: number) => (<TouchableOpacity key={i} onPress={() => router.push(`/services/${s.id}` as any)} style={styles.card}><Text style={styles.ce}>{s.emoji as string ?? '💆‍♀️'}</Text><Text style={styles.cn}>{(s.titleJson as any)?.ar as string}</Text><Text style={styles.cp}>{(s.basePrice as number)?.toLocaleString()} ر.س</Text></TouchableOpacity>))}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 16 },
  inp: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 14, color: '#111827', textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center' },
  ce: { fontSize: 32 }, cn: { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 6, textAlign: 'center' }, cp: { fontSize: 13, fontWeight: '700', color: '#db2777', marginTop: 4 },
});
