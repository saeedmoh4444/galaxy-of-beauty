import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function MySubscriptionScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).subscriptions.getMySubscription.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📦 اشتراكي</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.plan}>{((data as any).plan?.nameJson as any)?.ar || 'الباقة'}</Text>
          <Text style={styles.price}>{(data as any).plan?.price || 0} ر.س / شهرياً</Text>
          <Text style={styles.status}>الحالة: {(data as any).status === 'ACTIVE' ? '🟢 نشط' : '⚫ غير نشط'}</Text>
        </View>
      ) : <Text style={styles.e}>لا يوجد اشتراك</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  plan: { fontSize: 20, fontWeight: '700', color: '#111827' }, price: { fontSize: 24, fontWeight: '800', color: '#7c3aed', marginTop: 8 },
  status: { fontSize: 14, color: '#6b7280', marginTop: 12 },
});
