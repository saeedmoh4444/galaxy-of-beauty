import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function TechWaitlistScreen(): JSX.Element {
  const [popular, setPopular] = useState<any[]>([]);
  const [myList, setMyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      (trpc as any).techWaitlist.popular.query() as any,
      (trpc as any).techWaitlist.myWaitlists.query() as any,
    ])
      .then(([p, m]: any[]) => {
        setPopular(p || []);
        setMyList(m || []);
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
  const join = (techId: number) => {
    ((trpc as any).techWaitlist.join.mutate({ technicianId: techId }) as any).then(() => fetch());
  };
  const leave = (techId: number) => {
    ((trpc as any).techWaitlist.leave.mutate({ technicianId: techId }) as any).then(() => fetch());
  };
  if (loading) return <SkeletonList count={5} />;
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
      <Text style={styles.t}>📋 قائمة الانتظار</Text>
      {myList.length > 0 && <Text style={styles.st}>⭐ قوائمي</Text>}
      {myList.map((t: any) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.te}>👩‍🎨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{t.name as string}</Text>
            <Text style={styles.tm}>الموقع: {(t.position as number) ?? '—'}</Text>
          </View>
          <TouchableOpacity onPress={() => leave(t.id)} style={styles.lb}>
            <Text style={styles.lt}>خروج</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.st}>🔥 الفنيات الأكثر طلباً</Text>
      {popular.map((t: any) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.te}>👩‍🎨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{t.name as string}</Text>
            <Text style={styles.tm}>
              ⭐ {(t.rating as number) ?? 0} · {(t.waitlistCount as number) ?? 0} في الانتظار
            </Text>
          </View>
          <TouchableOpacity onPress={() => join(t.id)} style={styles.jb}>
            <Text style={styles.jt}>انضمام</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  te: { fontSize: 32 },
  tn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  tm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  jb: { backgroundColor: '#d97706', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  jt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  lb: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  lt: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
});
