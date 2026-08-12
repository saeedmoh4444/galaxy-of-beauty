import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function LiveStreamScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).liveStream.list.query() as any)
      .then((d: any) => {
        setData(d);
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
  if (loading) return <SkeletonList count={4} />;
  const live = (data?.live ?? []) as any[];
  const upcoming = (data?.upcoming ?? []) as any[];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ef4444']}
        />
      }
    >
      <Text style={styles.t}> البث المباشر</Text>
      {live.length > 0 && <Text style={styles.st}> مباشر الآن</Text>}
      {live.map((s: any) => (
        <View key={s.id} style={[styles.card, styles.lc]}>
          <Text style={styles.se}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{(s.titleAr as string) ?? (s.title as string)}</Text>
            <Text style={styles.sm}>
              ‍ {s.host as string} ·  {s.viewers as number}
            </Text>
          </View>
          <TouchableOpacity style={styles.wb}>
            <Text style={styles.wt}>مشاهدة</Text>
          </TouchableOpacity>
        </View>
      ))}
      {upcoming.length > 0 && <Text style={styles.st}> قادم</Text>}
      {upcoming.map((s: any) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.se}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{(s.titleAr as string) ?? (s.title as string)}</Text>
            <Text style={styles.sm}>
              ‍ {s.host as string} ·{' '}
              {new Date(s.scheduledAt as string).toLocaleDateString('ar-SA', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.rb}>
            <Text style={styles.rt}></Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 20 },
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
  lc: { borderWidth: 2, borderColor: '#fca5a5' },
  se: { fontSize: 32 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  wb: { backgroundColor: '#dc2626', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  wt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rb: { backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  rt: { fontSize: 16 },
});
