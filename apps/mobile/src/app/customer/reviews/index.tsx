import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ReviewsScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.reviews.list as any).query({} as never)
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل التقييمات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>تقييماتي</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.empty}>لا توجد تقييمات</Text>
          <Text style={styles.hint}>قيم الخدمات بعد إكمال الحجز</Text>
        </View>
       ) : (
        data.map((r: Record<string, unknown>) => {
          const svc = r.service as Record<string, unknown> | undefined;
          return (
            <View key={r.id as number} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.serviceName}>{((svc?.titleJson as Record<string, string>)?.ar ?? '') || `حجز #${r.bookingId as string}`}</Text>
                <View style={styles.stars}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Text key={i} style={{ color: i < (r.rating as number) ? '#f59e0b' : '#d1d5db', fontSize: 18 }}>★</Text>
                  ))}
                </View>
              </View>
              {r.comment ? <Text style={styles.comment}>{r.comment as string}</Text> : null}
              <Text style={styles.date}>{new Date(r.createdAt as string).toLocaleDateString('ar-SA')}</Text>
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
  card: { padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  stars: { flexDirection: 'row' },
  comment: { fontSize: 14, color: '#6b7280', marginTop: 8, fontStyle: 'italic' },
  date: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
