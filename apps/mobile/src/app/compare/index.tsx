import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function CompareScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).compare.services.query() as any)
      .then((d: any) => {
        setServices(d || []);
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
  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };
  const ci = services.filter((s: any) => selected.includes(s.id));
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>⚖️ مقارنة الخدمات</Text>
      <View style={styles.grid}>
        {services.map((s: any) => {
          const isSel = selected.includes(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => toggle(s.id)}
              style={[styles.ch, isSel && styles.cha]}
            >
              <Text style={styles.ce}>{(s.emoji as string) ?? '💆‍♀️'}</Text>
              <Text style={[styles.cn, isSel && styles.cna]}>{s.nameAr as string}</Text>
              <Text style={styles.cp}>{(s.price as number)?.toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {ci.length > 0 && (
        <View style={styles.tbl}>
          <Text style={styles.ttl}>📊 المقارنة</Text>
          {ci.map((s: any) => (
            <View key={s.id} style={styles.tc}>
              <Text style={styles.tcn}>{s.nameAr as string}</Text>
              <View style={styles.tr}>
                <Text style={styles.tl}>💰</Text>
                <Text style={styles.tv}>{(s.price as number)?.toLocaleString()} ر.س</Text>
              </View>
              <View style={styles.tr}>
                <Text style={styles.tl}>⏱️</Text>
                <Text style={styles.tv}>{s.duration as string}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  ch: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cha: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  ce: { fontSize: 24 },
  cn: { fontSize: 10, fontWeight: '600', color: '#6b7280', marginTop: 4, textAlign: 'center' },
  cna: { color: '#4f46e5' },
  cp: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  tbl: { gap: 10 },
  ttl: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  tc: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  tcn: { fontSize: 15, fontWeight: '700', color: '#4f46e5', marginBottom: 8 },
  tr: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  tl: { fontSize: 13, color: '#6b7280' },
  tv: { fontSize: 13, fontWeight: '600', color: '#111827' },
});
