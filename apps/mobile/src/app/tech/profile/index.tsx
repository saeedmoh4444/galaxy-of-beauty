import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function TechProfileScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    ((trpc as any).users.getMe.query() as any).then((d: any) => { setData(d); setLoading(false); setRefreshing(false); }).catch(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={3} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#059669']} />}>
      <Text style={styles.t}>👩‍🎨 ملفي</Text>
      {data && (
        <View style={styles.card}>
          <Text style={styles.name}>{data.name as string}</Text>
          <Text style={styles.email}>{data.email as string}</Text>
          {data.technician && <Text style={styles.meta}>⭐ {(data.technician as any).rating as number ?? 0}</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' }, email: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  meta: { fontSize: 14, color: '#f59e0b', marginTop: 4 },
});
