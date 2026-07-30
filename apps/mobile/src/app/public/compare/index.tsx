import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CompareScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    ((trpc as any).compare.services.query() as any).then((d: any) => { setServices(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };

  const compareItems = services.filter(s => selected.includes(s.id as number));

  if (loading) return <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>⚖️ مقارنة الخدمات</Text>
      <Text style={styles.sub}>اختاري حتى ٣ خدمات للمقارنة</Text>
      <View style={styles.grid}>
        {services.map((s: any) => {
          const isSel = selected.includes(s.id as number);
          return (
            <TouchableOpacity key={s.id} onPress={() => toggle(s.id as number)} style={[styles.serviceChip, isSel && styles.serviceChipActive]}>
              <Text style={styles.serviceEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
              <Text style={[styles.serviceName, isSel && styles.serviceNameActive]}>{s.nameAr as string}</Text>
              <Text style={[styles.servicePrice, isSel && styles.servicePriceActive]}>{(s.price as number)?.toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {compareItems.length > 0 && (
        <View style={styles.compareTable}>
          <Text style={styles.compareTitle}>📊 المقارنة</Text>
          <View style={styles.tableHeader}>
            <View style={styles.tableLabel}><Text style={styles.tableLabelText}>الميزة</Text></View>
            {compareItems.map((s: any) => <View key={s.id} style={styles.tableCol}><Text style={styles.tableColTitle}>{s.nameAr as string}</Text></View>)}
          </View>
          {['price', 'duration', 'rating'].map((field) => (
            <View key={field} style={styles.tableRow}>
              <View style={styles.tableLabel}><Text style={styles.tableLabelText}>{field === 'price' ? '💰 السعر' : field === 'duration' ? '⏱️ المدة' : '⭐ التقييم'}</Text></View>
              {compareItems.map((s: any) => (
                <View key={s.id} style={styles.tableCol}>
                  <Text style={styles.tableValue}>{field === 'price' ? (s.price as number)?.toLocaleString() + ' ر.س' : field === 'duration' ? s.duration as string : s.rating as string}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  serviceChip: { width: '30%', backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  serviceChipActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  serviceEmoji: { fontSize: 24 }, serviceName: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4, textAlign: 'center' },
  serviceNameActive: { color: '#4f46e5' }, servicePrice: { fontSize: 11, color: '#9ca3af', marginTop: 2 }, servicePriceActive: { color: '#4f46e5' },
  compareTable: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  compareTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableLabel: { width: 80 }, tableLabelText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tableCol: { flex: 1, alignItems: 'center' }, tableColTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  tableValue: { fontSize: 12, color: '#374151' },
});
