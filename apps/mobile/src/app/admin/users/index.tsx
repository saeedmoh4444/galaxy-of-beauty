import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminUsersScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.admin.listCustomers as any).query({ page: 1, limit: 50 } as never)
      .then((d: Record<string, unknown>) => { setData((d?.items ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => { setError('فشل تحميل المستخدمين'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleSuspend = async (userId: number) => {
    try { await (trpc.admin.suspendUser as any).mutate({ userId }); fetch(); } catch {}
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إدارة المستخدمين</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}><Text style={styles.empty}>لا يوجد مستخدمين</Text></View>
       ) : (
        data.map((u: Record<string, unknown>) => (
          <View key={u.id as number} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{u.name as string}</Text>
              <Text style={styles.email}>{u.email as string}</Text>
              <Text style={styles.role}>{(u.role as string) === 'CUSTOMER' ? 'عميلة' : (u.role as string) === 'TECHNICIAN' ? 'فنية' : 'مشرف'}</Text>
            </View>
            <TouchableOpacity style={styles.suspendBtn} onPress={() => handleSuspend(u.id as number)}>
              <Text style={styles.suspendText}>{u.isActive ? 'تعليق' : 'تفعيل'}</Text>
            </TouchableOpacity>
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
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  role: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  suspendBtn: { borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  suspendText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
});
