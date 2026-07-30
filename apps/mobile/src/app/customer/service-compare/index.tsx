import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ServiceCompareScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    ((trpc as any).services.list.query({}) as any).then((d: any) => { setServices(d?.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };

  const compareItems = services.filter(s => selected.includes(s.id as number));

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>⚖️ مقارنة الخدمات</Text>
      <Text style={styles.sub}>اختاري حتى ٣ خدمات للمقارنة</Text>

      <View style={styles.grid}>
        {services.slice(0, 12).map((s: any) => {
          const isSel = selected.includes(s.id as number);
          return (
            <TouchableOpacity key={s.id} onPress={() => toggle(s.id as number)} style={[styles.chip, isSel && styles.chipActive]}>
              <Text style={styles.chipEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
              <Text style={[styles.chipName, isSel && styles.chipNameActive]}>{(s.titleJson as any)?.ar as string ?? s.nameAr as string}</Text>
              <Text style={styles.chipPrice}>{(s.basePrice as number)?.toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {compareItems.length >= 2 && (
        <View style={styles.table}>
          <Text style={styles.tableTitle}>📊 المقارنة</Text>
          {compareItems.map((s: any) => (
            <View key={s.id} style={styles.compareCard}>
              <Text style={styles.cTitle}>{(s.titleJson as any)?.ar as string}</Text>
              <View style={styles.cRow}><Text style={styles.cLabel}>💰 السعر</Text><Text style={styles.cVal}>{(s.basePrice as number)?.toLocaleString()} ر.س</Text></View>
              <View style={styles.cRow}><Text style={styles.cLabel}>⏱️ المدة</Text><Text style={styles.cVal}>{s.durationMin as number} دقيقة</Text></View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { width: '30%', backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  chipActive: { borderColor: '#0891b2', backgroundColor: '#ecfeff' },
  chipEmoji: { fontSize: 24 }, chipName: { fontSize: 10, fontWeight: '600', color: '#6b7280', marginTop: 4, textAlign: 'center' },
  chipNameActive: { color: '#0891b2' }, chipPrice: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  table: { gap: 10 },
  tableTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  compareCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  cTitle: { fontSize: 15, fontWeight: '700', color: '#0891b2', marginBottom: 8 },
  cRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  cLabel: { fontSize: 13, color: '#6b7280' }, cVal: { fontSize: 13, fontWeight: '600', color: '#111827' },
});
