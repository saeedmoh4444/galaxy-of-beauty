import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function ExpiryTrackerScreen(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).expiryTracker.myItems.query() as any).then((d: any) => { setItems(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = (id: number) => {
    ((trpc as any).expiryTracker.delete.mutate({ id }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#ef4444" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>⏱️ متعقب الصلاحية</Text>
      <Text style={styles.sub}>تتبعي تاريخ فتح منتجاتكِ</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد منتجات</Text> :
        items.map((i: any) => (
          <View key={i.id} style={[styles.card, i.expired ? styles.expiredCard : i.isClose ? styles.closeCard : {}]}>
            <Text style={styles.itemEmoji}>{i.emoji as string}</Text>
            <View style={{flex:1}}>
              <Text style={styles.itemName}>{i.productName as string}</Text>
              <Text style={styles.itemMeta}>فتح: {new Date(i.openDate as string).toLocaleDateString('ar-SA')} · ينتهي بعد {i.expiryMonths as number} شهر</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              {i.expired ? <Text style={styles.badgeExpired}>منتهي</Text> :
                i.isClose ? <Text style={styles.badgeClose}>{i.daysLeft as number} يوم</Text> :
                <Text style={styles.badgeOk}>{i.daysLeft as number} يوم</Text>}
              <TouchableOpacity onPress={() => remove(i.id as number)}><Text style={styles.deleteBtn}>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  expiredCard: { borderWidth: 2, borderColor: '#fca5a5', opacity: 0.7 },
  closeCard: { borderWidth: 2, borderColor: '#fcd34d' },
  itemEmoji: { fontSize: 32 }, itemName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  badgeExpired: { fontSize: 11, fontWeight: '700', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeClose: { fontSize: 11, fontWeight: '700', color: '#d97706', backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeOk: { fontSize: 11, fontWeight: '600', color: '#059669' },
  deleteBtn: { fontSize: 16, marginTop: 4 },
});
