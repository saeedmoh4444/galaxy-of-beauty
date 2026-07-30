import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const TYPES = ['lips','eyes','blush','nails'] as const;
const LABELS: any = { lips: '💄 شفاه', eyes: '👁️ عيون', blush: '😊 خدود', nails: '💅 أظافر' };

export default function VirtualTryOnScreen() {
  const [palettes, setPalettes] = useState<any>(null);
  const [type, setType] = useState<string>('lips');
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (trpc.virtualTryOn.palettes.query() as any).then((d: any) => { setPalettes(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;
  const colors: any[] = palettes?.[type] ?? [];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🤳 تجربة افتراضية</Text>
      <View style={styles.types}>{TYPES.map((t) => <TouchableOpacity key={t} onPress={() => { setType(t); setSelected(null); }} style={[styles.typeBtn, type === t && styles.typeActive]}><Text style={[styles.typeText, type === t && styles.typeTextActive]}>{LABELS[t]}</Text></TouchableOpacity>)}</View>
      <View style={styles.colors}>{colors.map((c: any) => <TouchableOpacity key={c.id} onPress={() => setSelected(c)} style={[styles.colorBtn, selected?.id === c.id && styles.colorSelected]}><View style={[styles.colorSwatch, { backgroundColor: c.hex }]} /><Text style={styles.colorName}>{c.nameAr}</Text></TouchableOpacity>)}</View>
      {selected && <View style={styles.selectedCard}><View style={[styles.selectedColor, { backgroundColor: selected.hex }]} /><Text style={styles.selectedName}>{selected.nameAr}</Text><Text style={styles.selectedCat}>{selected.category}</Text></View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginBottom: 20 },
  types: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: '#fce7f3' },
  typeActive: { backgroundColor: '#be185d' },
  typeText: { fontSize: 13, color: '#be185d', fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 },
  colorBtn: { alignItems: 'center', padding: 8, borderRadius: 12, backgroundColor: '#fff', width: 72 },
  colorSelected: { backgroundColor: '#fce7f3', borderWidth: 2, borderColor: '#be185d' },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, marginBottom: 4 },
  colorName: { fontSize: 9, color: '#6b7280', textAlign: 'center' },
  selectedCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 8 },
  selectedColor: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  selectedName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  selectedCat: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
