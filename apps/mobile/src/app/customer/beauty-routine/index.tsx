import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyRoutineScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).beautyProfile.get.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;
  if (!data) return <Text style={styles.e}>لا توجد بيانات</Text>;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💄 روتين الجمال</Text>
      <View style={styles.card}>
        <Text style={styles.label}>نوع البشرة: {(data.skinType as string) || '—'}</Text>
        <Text style={styles.label}>نوع الشعر: {(data.hairType as string) || '—'}</Text>
        <Text style={styles.label}>طول الشعر: {(data.hairLength as string) || '—'}</Text>
        <Text style={styles.label}>لون البشرة: {(data.skinTone as string) || '—'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  label: { fontSize: 14, color: '#374151', textAlign: 'right', marginBottom: 10, fontWeight: '600' },
});
