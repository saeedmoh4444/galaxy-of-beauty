import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'معلق', color: '#d97706', bg: '#fef3c7' },
  PROCESSING: { label: 'قيد المعالجة', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { label: 'مكتمل', color: '#059669', bg: '#dcfce7' },
  FAILED: { label: 'فشل', color: '#dc2626', bg: '#fee2e2' },
};

export default function PayoutsScreen(): JSX.Element {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    ((trpc as any).payouts.listForAdmin.query({}) as any).then((d: any) => { setItems(d?.payouts || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const process = (id: number) => {
    ((trpc as any).payouts.process.mutate({ payoutId: id }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💸 المدفوعات للفنيات</Text>
      <Text style={styles.sub}>إدارة مدفوعات الفنيات</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد مدفوعات</Text> :
        items.map((p: any) => {
          const s = STATUS_MAP[p.status as string] ?? { label: p.status, color: '#6b7280', bg: '#f3f4f6' };
          return (
            <View key={p.id} style={styles.card}>
              <View style={{flex:1}}>
                <Text style={styles.techName}>👩‍🎨 {p.technicianName as string}</Text>
                <Text style={styles.amount}>{(p.amount as number)?.toLocaleString()} ر.س</Text>
                <Text style={styles.date}>{new Date(p.createdAt as string).toLocaleDateString('ar-SA')}</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <View style={[styles.badge, {backgroundColor: s.bg}]}><Text style={[styles.badgeText, {color: s.color}]}>{s.label}</Text></View>
                {p.status === 'PENDING' && (
                  <TouchableOpacity onPress={() => process(p.id as number)} style={styles.processBtn}><Text style={styles.processBtnText}>معالجة</Text></TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  techName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  amount: { fontSize: 16, fontWeight: '700', color: '#0891b2', marginTop: 2 },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  processBtn: { backgroundColor: '#0891b2', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, marginTop: 6 },
  processBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
