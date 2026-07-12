import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminServicesScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.services.list as any).query({ limit: 50 } as never)
      .then((d: Record<string, unknown>) => { setData((d?.items ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => { setError('فشل تحميل الخدمات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إدارة الخدمات</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}><Text style={styles.empty}>لا توجد خدمات</Text></View>
       ) : (
        data.map((svc: Record<string, unknown>) => (
          <View key={svc.id as number} style={styles.card}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.svcName}>{svc.titleAr as string}</Text>
                {svc.isPopular ? <Text style={{ color: '#f59e0b' }}>⭐</Text> : null}
              </View>
              <Text style={styles.svcMeta}>{(svc.titleEn as string) ?? ''}</Text>
              <Text style={styles.svcMeta}>{Number(svc.basePrice ?? 0).toFixed(0)} ر.س | {String(svc.durationMin ?? 0)} دقيقة</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: svc.isActive ? '#d1fae5' : '#fee2e2' }]}>
              <Text style={{ color: svc.isActive ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: '600' }}>{svc.isActive ? 'نشط' : 'غير نشط'}</Text>
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
  svcName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  svcMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
});
