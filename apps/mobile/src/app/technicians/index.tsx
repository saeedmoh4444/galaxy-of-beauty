import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function TechniciansScreen() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.technicians.list as any).query({ page: 1, limit: 50 })
      .then((d: Record<string, unknown>) => { setData((d?.items ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => { setError('فشل تحميل الفنيات'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const filtered = search
    ? data.filter((t) => {
        const name = (t.name as string ?? '').toLowerCase();
        const city = (t.city as string ?? '').toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || city.includes(q);
      })
    : data;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الفنيات</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="بحث عن فنية..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>👩‍🎤</Text>
          <Text style={styles.empty}>لا توجد فنيات</Text>
        </View>
       ) : (
        <ScrollView>
          {filtered.map((t: Record<string, unknown>) => (
            <TouchableOpacity
              key={t.id as number}
              style={styles.card}
              onPress={() => router.push(`/technicians/${t.id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{t.name as string}</Text>
                <Text style={styles.city}>{t.city as string ?? '—'}</Text>
                <View style={styles.ratingRow}>
                  <Text style={styles.rating}>⭐ {Number(t.ratingAvg ?? 0).toFixed(1)}</Text>
                  <Text style={styles.reviews}>({String(t.totalReviews ?? 0)})</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
  searchInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 24 },
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  city: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 14, color: '#f59e0b', fontWeight: '600' },
  reviews: { fontSize: 13, color: '#9ca3af' },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
