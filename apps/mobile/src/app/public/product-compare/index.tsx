import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ProductCompareScreen(): JSX.Element {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    ((trpc as any).productCompare.products.query() as any).then((d: any) => { setProducts(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };

  const compareItems = products.filter(p => selected.includes(p.id as number));

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📊 مقارنة المنتجات</Text>
      <Text style={styles.sub}>اختاري حتى ٣ منتجات للمقارنة</Text>
      <View style={styles.grid}>
        {products.map((p: any) => {
          const isSel = selected.includes(p.id as number);
          return (
            <TouchableOpacity key={p.id} onPress={() => toggle(p.id as number)} style={[styles.chip, isSel && styles.chipActive]}>
              <Text style={styles.chipEmoji}>{p.emoji as string ?? '🧴'}</Text>
              <Text style={[styles.chipName, isSel && styles.chipNameActive]}>{p.nameAr as string}</Text>
              <Text style={styles.chipPrice}>{(p.price as number)?.toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {compareItems.length > 0 && (
        <View style={styles.table}>
          <Text style={styles.tableTitle}>📊 جدول المقارنة</Text>
          <View style={styles.tableHeader}>
            <View style={styles.labelCol}><Text style={styles.labelText}>—</Text></View>
            {compareItems.map((p: any) => <View key={p.id} style={styles.valCol}><Text style={styles.valTitle}>{p.nameAr as string}</Text></View>)}
          </View>
          {['price', 'brand', 'rating'].map(field => (
            <View key={field} style={styles.tableRow}>
              <View style={styles.labelCol}><Text style={styles.labelText}>{field === 'price' ? '💰 السعر' : field === 'brand' ? '🏷️ الماركة' : '⭐ التقييم'}</Text></View>
              {compareItems.map((p: any) => (
                <View key={p.id} style={styles.valCol}>
                  <Text style={styles.valText}>{field === 'price' ? (p.price as number)?.toLocaleString() + ' ر.س' : field === 'brand' ? p.brand as string : p.rating as string}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { width: '30%', backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  chipActive: { borderColor: '#0891b2', backgroundColor: '#ecfeff' },
  chipEmoji: { fontSize: 24 }, chipName: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4, textAlign: 'center' },
  chipNameActive: { color: '#0891b2' }, chipPrice: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  table: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  tableTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#e5e7eb', paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  labelCol: { width: 80 }, labelText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  valCol: { flex: 1, alignItems: 'center' }, valTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  valText: { fontSize: 12, color: '#374151' },
});
