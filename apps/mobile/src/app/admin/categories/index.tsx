import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminCategoriesScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.categories.all as any).query({} as never)
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل الأقسام'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const parents = data.filter((c) => !c.parentId);
  const childrenOf = (pid: number) => data.filter((c) => Number(c.parentId) === pid);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إدارة الأقسام</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}><Text style={styles.empty}>لا توجد أقسام</Text></View>
       ) : (
        parents.map((cat: Record<string, unknown>) => (
          <View key={cat.id as number}>
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.catName}>{cat.nameAr as string} / {cat.nameEn as string}</Text>
                <Text style={styles.catMeta}>المعرف: {cat.slug as string} | الترتيب: {String(cat.sortOrder ?? 0)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: cat.isActive ? '#d1fae5' : '#fee2e2' }]}>
                <Text style={{ color: cat.isActive ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: '600' }}>{cat.isActive ? 'نشط' : 'غير نشط'}</Text>
              </View>
            </View>
            {childrenOf(cat.id as number).map((child: Record<string, unknown>) => (
              <View key={child.id as number} style={[styles.card, { marginLeft: 24 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>↳ {child.nameAr as string} / {child.nameEn as string}</Text>
                  <Text style={styles.catMeta}>المعرف: {child.slug as string}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: child.isActive ? '#d1fae5' : '#fee2e2' }]}>
                  <Text style={{ color: child.isActive ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: '600' }}>{child.isActive ? 'نشط' : 'غير نشط'}</Text>
                </View>
              </View>
            ))}
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
  catName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  catMeta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
});
