import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyBudgetScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).beautyBudget.get.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💰 ميزانية الجمال</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.budget}>{(data.monthlyBudget as number)?.toLocaleString()} ر.س</Text>
          <Text style={styles.spent}>تم الإنفاق: {(data.spent as number)?.toLocaleString()} ر.س</Text>
          <View style={styles.bar}><View style={[styles.fill, { width: `${Math.min(100, ((data.spent as number) / (data.monthlyBudget as number || 1)) * 100)}%` }]} /></View>
        </View>
      ) : <Text style={styles.e}>لا توجد بيانات</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  budget: { fontSize: 32, fontWeight: '800', color: '#059669' },
  spent: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  bar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, width: '100%', marginTop: 12 },
  fill: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
});
