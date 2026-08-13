import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function TechnicianCompareScreen(): JSX.Element {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().technicians.list.query({}) as any)
      .then((d: any) => {
        setTechs(d || []);
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
    else if (selected.length < 2) setSelected([...selected, id]);
  };
  const ct = techs.filter((t: any) => selected.includes(t.id));
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>️ مقارنة الفنيات</Text>
      <View style={styles.grid}>
        {techs.slice(0, 12).map((t: any) => {
          const isSel = selected.includes(t.id);
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => toggle(t.id)}
              style={[styles.ch, isSel && styles.cha]}
            >
              <Text style={styles.ce}>‍</Text>
              <Text style={[styles.cn, isSel && styles.cna]}>{t.name as string}</Text>
              <Text style={styles.cr}> {(t.rating as number) ?? 0}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {ct.length === 2 && (
        <View style={styles.tbl}>
          <Text style={styles.ttl}> المقارنة</Text>
          {ct.map((t: any) => (
            <View key={t.id} style={styles.tc}>
              <Text style={styles.tcn}>{t.name as string}</Text>
              <View style={styles.tr}>
                <Text style={styles.tl}></Text>
                <Text style={styles.tv}>{(t.rating as number) ?? 0}</Text>
              </View>
              <View style={styles.tr}>
                <Text style={styles.tl}></Text>
                <Text style={styles.tv}>{(t.totalBookings as number) ?? 0} حجز</Text>
              </View>
              <View style={styles.tr}>
                <Text style={styles.tl}></Text>
                <Text style={styles.tv}>{(t.startingPrice as number)?.toLocaleString()} ر.س</Text>
              </View>
            </View>
          ))}
          <View style={styles.w}>
            <Text style={styles.wt}>
               الأفضل:{' '}
              {ct[0].rating > ct[1].rating
                ? ct[0].name
                : ct[0].rating < ct[1].rating
                  ? ct[1].name
                  : 'متقاربتان'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
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
  cha: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
  ce: { fontSize: 28 },
  cn: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4, textAlign: 'center' },
  cna: { color: '#7c3aed' },
  cr: { fontSize: 11, color: '#f59e0b', marginTop: 2 },
  tbl: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  ttl: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  tc: { marginBottom: 10 },
  tcn: { fontSize: 14, fontWeight: '700', color: '#7c3aed', marginBottom: 4 },
  tr: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  tl: { fontSize: 13, color: '#6b7280' },
  tv: { fontSize: 13, fontWeight: '600', color: '#111827' },
  w: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    alignItems: 'center',
  },
  wt: { fontSize: 13, fontWeight: '700', color: '#d97706' },
});
