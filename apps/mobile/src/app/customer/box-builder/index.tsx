import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BoxBuilderScreen() {
  const [catalog, setCatalog] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.boxBuilder.catalog.query() as any).then((d: any) => { setCatalog(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const toggle = (id: number) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length < 6 ? [...p, id] : p);
  const total = catalog.filter((p) => selected.includes(p.id as number)).reduce((s, p) => s + (p.price as number), 0);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📦 صندوق التجميل</Text>
      <Text style={styles.sub}>اختاري {selected.length}/6 منتجات</Text>
      <View style={styles.grid}>{catalog.map((p: Record<string, unknown>) => (
        <TouchableOpacity key={p.id as number} onPress={() => toggle(p.id as number)} style={[styles.card, selected.includes(p.id as number) && styles.selected]}>
          <Text style={styles.cardEmoji}>{p.emoji as string}</Text><Text style={styles.cardName}>{p.nameAr as string}</Text><Text style={styles.cardPrice}>{p.price as number} ر.س</Text>
        </TouchableOpacity>
      ))}</View>
      {selected.length >= 3 && <View style={styles.footer}><Text style={styles.total}>الإجمالي: {total} ر.س</Text><Text style={styles.discount}>الخصم: {Math.round(total * 0.15)} ر.س</Text></View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center' },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 4, alignItems: 'center' },
  selected: { borderWidth: 2, borderColor: '#be185d', backgroundColor: '#fce7f3' },
  cardEmoji: { fontSize: 32 }, cardName: { fontSize: 11, fontWeight: '600', color: '#111827', textAlign: 'center', marginTop: 4 },
  cardPrice: { fontSize: 12, fontWeight: '700', color: '#be185d', marginTop: 4 },
  footer: { marginTop: 16, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  total: { fontSize: 16, fontWeight: '700', color: '#111827' },
  discount: { fontSize: 14, color: '#059669', marginTop: 4 },
});
