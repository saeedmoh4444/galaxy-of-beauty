import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function DiscoverScreen(): JSX.Element {
  const [trending, setTrending] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ((trpc as any).discover.trending.query() as any),
      ((trpc as any).discover.categories.query() as any),
    ]).then(([t, c]: any[]) => { setTrending(t || []); setCategories(c || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔍 اكتشف</Text>
      <Text style={styles.sub}>اكتشفي خدمات وأفكار جديدة</Text>

      {categories.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📂 الفئات</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:20}}>
            <View style={{flexDirection:'row', gap:10}}>
              {categories.map((cat: any) => (
                <TouchableOpacity key={cat.id ?? cat.key} style={styles.catChip}>
                  <Text style={styles.catEmoji}>{cat.emoji as string ?? '📂'}</Text>
                  <Text style={styles.catName}>{cat.nameAr as string}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <Text style={styles.sectionTitle}>🔥 الأكثر رواجاً</Text>
      {trending.length === 0 ? <Text style={styles.e}>لا توجد نتائج</Text> :
        trending.map((t: any) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.cardEmoji}>{t.emoji as string ?? '✨'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.cardTitle}>{t.nameAr as string ?? t.titleAr as string}</Text>
              <Text style={styles.cardDesc}>{(t.descAr as string ?? t.description as string)?.substring(0, 100)}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.price}>{(t.price as number)?.toLocaleString()} ر.س</Text>
                <Text style={styles.rating}>⭐ {t.rating as number ?? 0}</Text>
              </View>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  catChip: { backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', minWidth: 80 },
  catEmoji: { fontSize: 28 }, catName: { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 6 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  cardEmoji: { fontSize: 32 }, cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardDesc: { fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  price: { fontSize: 14, fontWeight: '700', color: '#db2777' }, rating: { fontSize: 12, color: '#f59e0b' },
});
