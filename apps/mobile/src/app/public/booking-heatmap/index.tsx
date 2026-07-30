import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BookingHeatmapScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).bookingHeatmap.data.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ef4444" style={{ marginTop: 40 }} size="large" />;

  const hours = (data?.hours ?? []) as string[];
  const days = (data?.days ?? []) as string[];
  const grid = (data?.grid ?? []) as number[][];
  const maxVal = Math.max(1, ...(grid?.flat() ?? [1]));

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📊 خريطة الحجوزات</Text>
      <Text style={styles.sub}>أوقات الذروة خلال الأسبوع</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.labelCell}><Text style={styles.labelText}>-</Text></View>
            {hours.map((h: string) => <View key={h} style={styles.headerCell}><Text style={styles.headerText}>{h}</Text></View>)}
          </View>
          {days.map((day: string, di: number) => (
            <View key={day} style={styles.row}>
              <View style={styles.labelCell}><Text style={styles.labelText}>{day}</Text></View>
              {hours.map((_h: string, hi: number) => {
                const val = grid?.[di]?.[hi] ?? 0;
                const intensity = val / maxVal;
                const bg = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : intensity > 0 ? '#86efac' : '#f3f4f6';
                return <View key={hi} style={[styles.cell, {backgroundColor: bg}]}><Text style={[styles.cellText, intensity > 0.4 && {color:'#fff'}]}>{val || ''}</Text></View>;
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#86efac'}]} /><Text style={styles.legendText}>هادئ</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#f59e0b'}]} /><Text style={styles.legendText}>متوسط</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#ef4444'}]} /><Text style={styles.legendText}>ذروة</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  headerRow: { flexDirection: 'row' }, row: { flexDirection: 'row' },
  labelCell: { width: 50, height: 36, justifyContent: 'center', alignItems: 'center' }, labelText: { fontSize: 11, color: '#6b7280' },
  headerCell: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }, headerText: { fontSize: 10, color: '#9ca3af' },
  cell: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', margin: 1, borderRadius: 6 },
  cellText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 }, legendDot: { width: 12, height: 12, borderRadius: 4 }, legendText: { fontSize: 11, color: '#6b7280' },
});
