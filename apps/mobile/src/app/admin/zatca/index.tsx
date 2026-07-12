import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminZatcaScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.zatca.listInvoices as any).query({ page: 1, limit: 50 } as never)
      .then((d: Record<string, unknown>) => { setData((d?.invoices ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => { setError('فشل تحميل الفواتير'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const statusColor = (s: string) => {
    if (s === 'CLEARED') return '#10b981';
    if (s === 'PENDING') return '#f59e0b';
    if (s === 'FAILED') return '#ef4444';
    return '#9ca3af';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>فواتير زاتكا</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}><Text style={styles.empty}>لا توجد فواتير</Text></View>
       ) : (
        data.map((inv: Record<string, unknown>) => (
          <View key={inv.id as number} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.invId}>فاتورة #{inv.id as string}</Text>
              <Text style={styles.meta}>{inv.bookingCode as string ?? `حجز #${inv.bookingId as string}`}</Text>
              <Text style={styles.meta}>{Number(inv.totalAmount ?? 0).toFixed(0)} ر.س</Text>
              <Text style={styles.meta}>{new Date(inv.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor(inv.zatcaStatus as string) + '20' }]}>
              <Text style={{ color: statusColor(inv.zatcaStatus as string), fontSize: 12, fontWeight: '600' }}>{inv.zatcaStatus as string}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  centered: { alignItems: 'center', marginTop: 40 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  invId: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
});
