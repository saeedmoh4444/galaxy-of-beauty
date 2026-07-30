import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function HairColorSimScreen() {
  const [colors, setColors] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.hairColorSim.colors.query() as any).then((d: any) => { setColors(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💇‍♀️ محاكي لون الشعر</Text>
      <View style={styles.grid}>{colors.map((c: Record<string, unknown>) => (
        <TouchableOpacity key={c.id as string} onPress={() => setSelected(c.id as string)} style={[styles.swatch, selected === c.id && styles.selected]}>
          <View style={[styles.color, { backgroundColor: c.hex as string }]} /><Text style={styles.name}>{c.nameAr as string}</Text>
        </TouchableOpacity>
      ))}</View>
      {selected ? <Text style={styles.pick}>تم اختيار {(colors as any[]).find((c: any) => c.id === selected)?.nameAr}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  swatch: { alignItems: 'center', padding: 8, borderRadius: 14, backgroundColor: '#fff', width: 80 },
  selected: { borderWidth: 2, borderColor: '#7c3aed', backgroundColor: '#ede9fe' },
  color: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3, marginBottom: 4 },
  name: { fontSize: 10, color: '#6b7280', textAlign: 'center' },
  pick: { marginTop: 16, fontSize: 14, color: '#7c3aed', textAlign: 'center', fontWeight: '600' },
});
