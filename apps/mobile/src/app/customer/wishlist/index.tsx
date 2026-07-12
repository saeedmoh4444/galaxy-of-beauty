import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function WishlistScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.wishlist.list as any).query({} as never)
      .then((d: Record<string, unknown>) => { setData((d?.items ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => { setError('فشل تحميل المفضلة'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleRemove = async (id: number) => {
    try {
      await (trpc.wishlist.remove as any).mutate({ wishlistItemId: id });
      fetch();
    } catch {}
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>المفضلة</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>💝</Text>
          <Text style={styles.empty}>المفضلة فارغة</Text>
          <Text style={styles.hint}>لم تقم بإضافة أي عنصر إلى المفضلة بعد</Text>
        </View>
       ) : (
        data.map((item: Record<string, unknown>) => {
          const service = item.service as Record<string, unknown> | null;
          const technician = item.technician as Record<string, unknown> | null;
          const title = service ? (service.titleJson as Record<string, string>)?.ar ?? '' : (technician?.user as Record<string, unknown>)?.name as string ?? '';
          const subtitle = service ? `ر.س ${service.basePrice as number}` : (technician?.city as string) ?? '';
          return (
            <View key={item.id as number} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{title}</Text>
                <Text style={styles.itemSub}>{subtitle}</Text>
              </View>
              <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id as number)}>
                <Text style={styles.removeText}>إزالة</Text>
              </TouchableOpacity>
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
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  itemSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  removeBtn: { borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  removeText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
