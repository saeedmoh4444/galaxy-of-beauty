import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ServicesScreen(): JSX.Element {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    ((trpc as any).services.categories.query() as any).then((d: any) => { setCategories(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const selectCat = (catKey: string) => {
    setActiveCat(catKey);
    ((trpc as any).services.byCategory.query({ category: catKey }) as any).then((d: any) => setServices(d || []));
  };

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💆‍♀️ الخدمات</Text>
      <Text style={styles.sub}>اكتشفي جميع خدمات التجميل والعناية</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}}>
        <View style={{flexDirection:'row', gap:8}}>
          {categories.map((cat: any) => {
            const isActive = activeCat === cat.key;
            return (
              <TouchableOpacity key={cat.key} onPress={() => selectCat(cat.key as string)} style={[styles.catChip, isActive && styles.catChipActive]}>
                <Text style={styles.catEmoji}>{cat.emoji as string ?? '📂'}</Text>
                <Text style={[styles.catName, isActive && styles.catNameActive]}>{cat.nameAr as string}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {activeCat && (
        <>
          <Text style={styles.sectionTitle}>{services.length} خدمات</Text>
          {services.length === 0 ? <Text style={styles.e}>لا توجد خدمات في هذه الفئة</Text> :
            services.map((s: any) => (
              <View key={s.id} style={styles.card}>
                <Text style={styles.svcEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
                <View style={{flex:1}}>
                  <Text style={styles.svcName}>{s.nameAr as string}</Text>
                  <Text style={styles.svcDesc}>{(s.descAr as string)?.substring(0, 80)}</Text>
                  <View style={styles.svcMeta}>
                    <Text style={styles.svcPrice}>{(s.price as number)?.toLocaleString()} ر.س</Text>
                    <Text style={styles.svcDuration}>⏱️ {s.duration as string}</Text>
                  </View>
                </View>
              </View>
            ))
          }
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  catChip: { backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', minWidth: 80, borderWidth: 2, borderColor: '#e5e7eb' },
  catChipActive: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  catEmoji: { fontSize: 28 }, catName: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 6 }, catNameActive: { color: '#db2777' },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  svcEmoji: { fontSize: 30 }, svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  svcDesc: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  svcMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  svcPrice: { fontSize: 14, fontWeight: '700', color: '#db2777' }, svcDuration: { fontSize: 12, color: '#9ca3af' },
});
