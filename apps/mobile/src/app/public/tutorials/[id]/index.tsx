import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function TutorialDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).tutorials.get.query({ id: parseInt(id, 10) }) as any)
      .then((d: any) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;
  if (!data) return <View style={styles.c}><Text style={styles.e}>تعذر تحميل الدرس</Text></View>;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <View style={styles.videoPlaceholder}>
        <Text style={styles.playIcon}>▶️</Text>
        <Text style={styles.videoNote}>اضغط للمشاهدة</Text>
      </View>
      <Text style={styles.t}>{data.emoji as string ?? '📹'} {data.titleAr as string}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaItem}>{data.categoryAr as string}</Text>
        <Text style={styles.metaItem}>{data.difficultyAr as string}</Text>
        <Text style={styles.metaItem}>⏱️ {data.duration as string}</Text>
        <Text style={styles.metaItem}>👁 {data.views as number}</Text>
      </View>
      <Text style={styles.desc}>{data.descAr as string}</Text>

      {data.steps && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 الخطوات</Text>
          {(data.steps as any[]).map((s: any, i: number) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
              <View style={{flex:1}}>
                <Text style={styles.stepTitle}>{s.titleAr as string}</Text>
                <Text style={styles.stepDesc}>{s.descAr as string}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {data.products && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 المنتجات المستخدمة</Text>
          {(data.products as any[]).map((p: any) => (
            <View key={p.id} style={styles.product}>
              <Text style={styles.prodEmoji}>{p.emoji as string ?? '🧴'}</Text>
              <View style={{flex:1}}>
                <Text style={styles.prodName}>{p.nameAr as string}</Text>
                <Text style={styles.prodBrand}>{p.brand as string}</Text>
              </View>
              <Text style={styles.prodPrice}>{(p.price as number)?.toLocaleString()} ر.س</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  videoPlaceholder: { backgroundColor: '#1e1b4b', borderRadius: 16, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  playIcon: { fontSize: 48, color: '#fff' }, videoNote: { fontSize: 13, color: '#a78bfa', marginTop: 8 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 10 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  metaItem: { fontSize: 12, color: '#6b7280', backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  desc: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#111827' }, stepDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  product: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', borderRadius: 12, padding: 10, marginBottom: 6 },
  prodEmoji: { fontSize: 24 }, prodName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  prodBrand: { fontSize: 11, color: '#6b7280', marginTop: 2 }, prodPrice: { fontSize: 13, fontWeight: '700', color: '#7c3aed' },
});
