import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TechnicianCompareScreen(): JSX.Element {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    ((trpc as any).technicians.list.query({}) as any).then((d: any) => { setTechs(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else if (selected.length < 2) setSelected([...selected, id]);
  };

  const compareTechs = techs.filter(t => selected.includes(t.id as number));

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>⚖️ مقارنة الفنيات</Text>
      <Text style={styles.sub}>اختاري حتى فنيتين للمقارنة</Text>

      <View style={styles.grid}>
        {techs.slice(0, 12).map((t: any) => {
          const isSel = selected.includes(t.id as number);
          return (
            <TouchableOpacity key={t.id} onPress={() => toggle(t.id as number)} style={[styles.chip, isSel && styles.chipActive]}>
              <Text style={styles.chipEmoji}>👩‍🎨</Text>
              <Text style={[styles.chipName, isSel && styles.chipNameActive]}>{t.name as string}</Text>
              <Text style={styles.chipRating}>⭐ {t.rating as number ?? 0}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {compareTechs.length === 2 && (
        <View style={styles.table}>
          <Text style={styles.tableTitle}>📊 المقارنة</Text>
          <View style={styles.tableHeader}>
            <View style={styles.labelCol}><Text style={styles.labelText}>الميزة</Text></View>
            {compareTechs.map(t => <View key={t.id} style={styles.valCol}><Text style={styles.valTitle}>{t.name as string}</Text></View>)}
          </View>
          {[
            ['⭐ التقييم', 'rating'],
            ['📅 الحجوزات', 'totalBookings'],
            ['💰 السعر', 'startingPrice'],
            ['📍 المدينة', 'city'],
            ['🎯 التخصص', 'specialtyAr'],
          ].map(([label, field]) => { const f = field!; return (
            <View key={f} style={styles.tableRow}>
              <View style={styles.labelCol}><Text style={styles.labelText}>{label}</Text></View>
              {compareTechs.map(t => (
                <View key={t.id} style={styles.valCol}>
                  <Text style={styles.valText}>
                    {f === 'startingPrice' ? ((t as any)[f] as number)?.toLocaleString() + ' ر.س' :
                     f === 'rating' ? '⭐ ' + ((t as any)[f] as number ?? 0) :
                     f === 'totalBookings' ? ((t as any)[f] as number ?? 0) + ' حجز' :
                     ((t as any)[f] as string ?? '—')}
                  </Text>
                </View>
              ))}
            </View>
          ); })}
          <View style={styles.winner}>
            <Text style={styles.winnerText}>
              🏆 الأفضل: {compareTechs[0].rating > compareTechs[1].rating ? compareTechs[0].name : compareTechs[0].rating < compareTechs[1].rating ? compareTechs[1].name : 'متقاربتان'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { width: '30%', backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  chipActive: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
  chipEmoji: { fontSize: 28 }, chipName: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4, textAlign: 'center' },
  chipNameActive: { color: '#7c3aed' }, chipRating: { fontSize: 11, color: '#f59e0b', marginTop: 2 },
  table: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  tableTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  labelCol: { width: 90 }, labelText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  valCol: { flex: 1, alignItems: 'center' }, valTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  valText: { fontSize: 12, color: '#374151' },
  winner: { marginTop: 12, padding: 10, backgroundColor: '#fef3c7', borderRadius: 10, alignItems: 'center' },
  winnerText: { fontSize: 13, fontWeight: '700', color: '#d97706' },
});
