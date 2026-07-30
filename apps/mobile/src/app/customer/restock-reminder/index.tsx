import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function RestockReminderScreen() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.restockReminder.myItems.query() as any).then((d: any) => { setItems(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📦 تجديد المنتجات</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد منتجات</Text> : items.map((item: Record<string, unknown>, i: number) => {
        const needsRestock = item.needsRestock as boolean;
        const pct = Math.min(100, Math.round(((item.daysLeft as number) / ((item.lifespanDays as number) || 60)) * 100));
        return (
          <View key={i} style={[styles.card, needsRestock && styles.needsRestock]}>
            <View style={{flex:1}}><Text style={styles.name}>{item.productName as string}</Text>
              <View style={styles.bar}><View style={[styles.fill, { width: `${pct}%`, backgroundColor: needsRestock ? '#dc2626' : '#059669' }]} /></View>
              <Text style={styles.days}>{item.daysLeft as number} يوم متبقي</Text>
            </View>
            <Text style={styles.emoji}>{item.emoji as string}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  needsRestock: { borderWidth: 2, borderColor: '#fecaca' },
  name: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right' },
  bar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginTop: 8, marginBottom: 4 }, fill: { height: 6, borderRadius: 3 },
  days: { fontSize: 11, color: '#9ca3af', textAlign: 'right' },
  emoji: { fontSize: 32, marginLeft: 8 },
});
