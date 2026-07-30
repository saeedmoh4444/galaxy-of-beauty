import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminCMSScreen(): JSX.Element {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).cms.listCategories.query() as any).then((d: any) => { setCategories(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📝 إدارة المحتوى</Text>
      <Text style={styles.sub}>إدارة فئات وخدمات المنصة</Text>
      {categories.length === 0 ? <Text style={styles.e}>لا توجد فئات</Text> :
        categories.map((cat: any) => (
          <View key={cat.id} style={styles.card}>
            <Text style={styles.catEmoji}>📂</Text>
            <View style={{flex:1}}>
              <Text style={styles.catName}>{(cat.nameJson as any)?.ar as string ?? cat.slug as string}</Text>
              <Text style={styles.catMeta}>{cat.slug as string} · {cat._count?.services ?? 0} خدمات</Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  catEmoji: { fontSize: 28 }, catName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  catMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});
