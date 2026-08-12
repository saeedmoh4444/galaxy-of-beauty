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
  const compareItems = services.filter((s: any) => selected.includes(s.id));

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
      <Text style={styles.t}>️ مقارنة الخدمات</Text>
      <Text style={styles.sub}>اختاري حتى ٣ خدمات للمقارنة</Text>
      <View style={styles.grid}>
        {services.map((s: any) => {
          const isSel = selected.includes(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => toggle(s.id)}
              style={[styles.chip, isSel && styles.chipActive]}
            >
              <Text style={styles.chipEmoji}>{(s.emoji as string) ?? '‍️'}</Text>
              <Text style={[styles.chipName, isSel && styles.chipNameActive]}>
                {s.nameAr as string}
              </Text>
              <Text style={styles.chipPrice}>{(s.price as number)?.toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {compareItems.length > 0 && (
        <View style={styles.table}>
          <Text style={styles.tableTitle}> المقارنة</Text>
          {compareItems.map((s: any) => (
            <View key={s.id} style={styles.compareCard}>
              <Text style={styles.cTitle}>{s.nameAr as string}</Text>
              <View style={styles.cRow}>
                <Text style={styles.cLabel}></Text>
                <Text style={styles.cVal}>{(s.price as number)?.toLocaleString()} ر.س</Text>
              </View>
              <View style={styles.cRow}>
                <Text style={styles.cLabel}>️</Text>
                <Text style={styles.cVal}>{s.duration as string}</Text>
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
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  chipActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  chipEmoji: { fontSize: 24 },
  chipName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  chipNameActive: { color: '#4f46e5' },
  chipPrice: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  table: { gap: 10 },
  tableTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  compareCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  cTitle: { fontSize: 15, fontWeight: '700', color: '#4f46e5', marginBottom: 8 },
  cRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  cLabel: { fontSize: 13, color: '#6b7280' },
  cVal: { fontSize: 13, fontWeight: '600', color: '#111827' },
});
