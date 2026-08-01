import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function FavoritesScreen(): JSX.Element {
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).favorites.list.query() as any).then((d: any) => { setFavs(d || []); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const remove = (id: number) => { ((trpc as any).favorites.remove.mutate({ id }) as any).then(() => fetch()); };
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#ec4899']} />}>
      <Text style={styles.t}>❤️ المفضلة</Text>
      {favs.map((f: any) => (<View key={f.id} style={styles.card}><Text style={styles.em}>❤️</Text><View style={{flex:1}}><Text style={styles.fl}>{f.label as string ?? 'مفضل'}</Text><Text style={styles.fm}>خدمة #{f.serviceId as number}{f.technicianId ? ` · فنية #${f.technicianId}` : ''}</Text></View><TouchableOpacity onPress={() => remove(f.id)}><Text style={styles.del}>🗑️</Text></TouchableOpacity></View>))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  em: { fontSize: 24 }, fl: { fontSize: 14, fontWeight: '600', color: '#111827' }, fm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  del: { fontSize: 18 },
});
