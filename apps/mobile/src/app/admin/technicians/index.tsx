import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminTechniciansScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kycTab, setKycTab] = useState('ALL');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.admin.listTechnicians as any).query({ page: 1, limit: 50 } as never)
      .then((d: Record<string, unknown>) => { setData((d?.items ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => { setError('فشل تحميل الفنيات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleVerify = async (userId: number, status: string) => {
    try { await (trpc.technicians.verifyKyc as any).mutate({ userId, status }); fetch(); } catch {}
  };

  const kycColor = (s: string) => {
    if (s === 'VERIFIED') return '#10b981';
    if (s === 'SUBMITTED') return '#f59e0b';
    if (s === 'REJECTED') return '#ef4444';
    return '#9ca3af';
  };

  const kycLabel = (s: string) => {
    if (s === 'VERIFIED') return 'موثق';
    if (s === 'SUBMITTED') return 'مقدم';
    if (s === 'REJECTED') return 'مرفوض';
    return 'قيد الانتظار';
  };

  const filtered = kycTab === 'ALL' ? data : data.filter((t) => (t.kycStatus as string) === kycTab);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إدارة الفنيات</Text>

      <ScrollView horizontal style={styles.filters} showsHorizontalScrollIndicator={false}>
        {['ALL', 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'].map((tab) => (
          <TouchableOpacity key={tab} style={[styles.filterBtn, kycTab === tab && styles.filterActive]} onPress={() => setKycTab(tab)}>
            <Text style={[styles.filterText, kycTab === tab && { color: '#fff' }]}>{
              tab === 'ALL' ? 'الكل' : tab === 'PENDING' ? 'قيد الانتظار' : tab === 'SUBMITTED' ? 'مقدم' : tab === 'VERIFIED' ? 'موثق' : 'مرفوض'
            }</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : filtered.length === 0 ? (
        <View style={styles.centered}><Text style={styles.empty}>لا توجد فنيات</Text></View>
       ) : (
        <ScrollView>
          {filtered.map((t: Record<string, unknown>) => (
            <View key={t.id as number} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{t.name as string}</Text>
                <Text style={styles.email}>{t.email as string}</Text>
                <Text style={styles.city}>{t.city as string ?? '—'} | ⭐ {Number(t.ratingAvg ?? 0).toFixed(1)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <View style={[styles.badge, { backgroundColor: kycColor(t.kycStatus as string) + '20' }]}>
                  <Text style={{ color: kycColor(t.kycStatus as string), fontSize: 12, fontWeight: '600' }}>{kycLabel(t.kycStatus as string)}</Text>
                </View>
                {(t.kycStatus as string) !== 'VERIFIED' && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify(t.id as number, 'VERIFIED')}>
                      <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>✅</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectKycBtn} onPress={() => handleVerify(t.id as number, 'REJECTED')}>
                      <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>❌</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
  filters: { maxHeight: 44, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8 },
  filterActive: { backgroundColor: '#7c3aed' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  centered: { alignItems: 'center', marginTop: 40 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  city: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  verifyBtn: { borderWidth: 1, borderColor: '#10b981', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  rejectKycBtn: { borderWidth: 1, borderColor: '#ef4444', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
});
