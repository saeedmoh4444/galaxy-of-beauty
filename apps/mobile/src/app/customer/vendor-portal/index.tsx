import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function VendorPortalScreen(): JSX.Element {
  const [dash, setDash] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    Promise.all([
      ((trpc as any).vendorPortal.dashboard.query() as any),
      ((trpc as any).vendorPortal.myProducts.query() as any),
    ]).then(([d, p]: any[]) => { setDash(d); setProducts(p || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = (id: number) => {
    ((trpc as any).vendorPortal.deleteProduct.mutate({ id }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🏪 بوابة البائعين</Text>
      <Text style={styles.sub}>أديري منتجاتكِ في متجر جالكسي بيوتي</Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📦</Text><Text style={styles.kpiVal}>{dash?.totalProducts as number ?? 0}</Text><Text style={styles.kpiLabel}>منتجات</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>💰</Text><Text style={[styles.kpiVal, {color:'#059669'}]}>{(dash?.totalRevenue as number ?? 0)?.toLocaleString()}</Text><Text style={styles.kpiLabel}>ر.س إيرادات</Text></View>
        <View style={styles.kpi}><Text style={styles.kpiEmoji}>📊</Text><Text style={[styles.kpiVal, {color:'#2563eb'}]}>{dash?.totalOrders as number ?? 0}</Text><Text style={styles.kpiLabel}>طلبات</Text></View>
      </View>

      <Text style={styles.sectionTitle}>📦 منتجاتي</Text>
      {products.length === 0 ? <Text style={styles.e}>لا توجد منتجات</Text> :
        products.map((p: any) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.prodEmoji}>📦</Text>
            <View style={{flex:1}}>
              <Text style={styles.prodName}>{p.name as string}</Text>
              <Text style={styles.prodMeta}>{(p.price as number)?.toLocaleString()} ر.س · المخزون: {p.stock as number}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(p.id as number)}><Text style={styles.deleteBtn}>🗑️</Text></TouchableOpacity>
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
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  kpi: { flex: 1, minWidth: '30%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 }, kpiVal: { fontSize: 22, fontWeight: '800', color: '#111827' }, kpiLabel: { fontSize: 11, color: '#9ca3af' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  prodEmoji: { fontSize: 28 }, prodName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  prodMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  deleteBtn: { fontSize: 18 },
});
