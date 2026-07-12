import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminFinanceScreen() {
  const [payouts, setPayouts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.payouts.listForAdmin as any).query({ page: 1, limit: 50 } as never)
      .then((d: Record<string, unknown>) => { setPayouts((d?.payouts ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => { setError('فشل تحميل البيانات المالية'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleProcess = async (id: number, action: string) => {
    try { await (trpc.payouts.process as any).mutate({ id, action }); fetch(); } catch {}
  };

  const statusColours: Record<string, string> = { PENDING: '#f59e0b', PROCESSING: '#3b82f6', COMPLETED: '#10b981', FAILED: '#ef4444' };
  const statusLabels: Record<string, string> = { PENDING: 'قيد الانتظار', PROCESSING: 'قيد المعالجة', COMPLETED: 'مكتمل', FAILED: 'فشل' };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>الإدارة المالية</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : payouts.length === 0 ? (
        <View style={styles.centered}><Text style={styles.empty}>لا توجد طلبات سحب</Text></View>
       ) : (
        payouts.map((p: Record<string, unknown>) => {
          const st = (p.status as string) ?? 'PENDING';
          return (
            <View key={p.id as number} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.amount}>{Number(p.amount ?? 0).toFixed(0)} ر.س</Text>
                <Text style={styles.user}>{p.userName as string ?? `#${p.userId as string}`}</Text>
                <Text style={styles.date}>{new Date(p.createdAt as string).toLocaleDateString('ar-SA')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <View style={[styles.badge, { backgroundColor: statusColours[st] + '20' }]}>
                  <Text style={{ color: statusColours[st], fontSize: 12, fontWeight: '600' }}>{statusLabels[st] ?? st}</Text>
                </View>
                {st === 'PENDING' && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleProcess(p.id as number, 'approve')}>
                      <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>موافقة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleProcess(p.id as number, 'reject')}>
                      <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>رفض</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })
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
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  amount: { fontSize: 18, fontWeight: '700', color: '#111827' },
  user: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  approveBtn: { borderWidth: 1, borderColor: '#10b981', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  rejectBtn: { borderWidth: 1, borderColor: '#ef4444', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
});
