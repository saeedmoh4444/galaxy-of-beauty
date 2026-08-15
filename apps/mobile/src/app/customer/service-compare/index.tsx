import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface CompareService {
  id: number;
  emoji?: string;
  titleJson?: { ar?: string; en?: string };
  nameAr?: string;
  basePrice?: number;
  durationMin?: number;
}

export default function ServiceCompareScreen(): JSX.Element {
  const [services, setServices] = useState<CompareService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().services.list.query({}) as unknown as Promise<{ items?: CompareService[] }>)
      .then((d) => {
        setServices(d?.items || []);
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
  const compareItems = services.filter((s) => selected.includes(s.id));
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}>️ مقارنة الخدمات</Text>
      <View style={styles.grid}>
        {services.slice(0, 12).map((s) => {
          const isSel = selected.includes(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => toggle(s.id)}
              style={[styles.ch, isSel && styles.cha]}
            >
              <Text style={styles.ce}>{s.emoji ?? ''}</Text>
              <Text style={[styles.cn, isSel && styles.cna]}>
                {s.titleJson?.ar ?? s.nameAr ?? ''}
              </Text>
              <Text style={styles.cp}>{(s.basePrice ?? 0).toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {compareItems.length >= 2 && (
        <View style={styles.tbl}>
          <Text style={styles.ttl}> المقارنة</Text>
          {compareItems.map((s) => (
            <View key={s.id} style={styles.cc}>
              <Text style={styles.ct}>{s.titleJson?.ar ?? ''}</Text>
              <View style={styles.cr}>
                <Text style={styles.cl}></Text>
                <Text style={styles.cv}>{(s.basePrice ?? 0).toLocaleString()} ر.س</Text>
              </View>
              <View style={styles.cr}>
                <Text style={styles.cl}>️</Text>
                <Text style={styles.cv}>{s.durationMin ?? 0} دقيقة</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
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
  cha: { borderColor: '#0891b2', backgroundColor: '#ecfeff' },
  ce: { fontSize: 24 },
  cn: { fontSize: 10, fontWeight: '600', color: '#6b7280', marginTop: 4, textAlign: 'center' },
  cna: { color: '#0891b2' },
  cp: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  tbl: { gap: 10 },
  ttl: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  cc: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  ct: { fontSize: 15, fontWeight: '700', color: '#0891b2', marginBottom: 8 },
  cr: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  cl: { fontSize: 13, color: '#6b7280' },
  cv: { fontSize: 13, fontWeight: '600', color: '#111827' },
});
