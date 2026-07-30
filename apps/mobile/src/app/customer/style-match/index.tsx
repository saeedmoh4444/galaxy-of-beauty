import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState } from 'react';

const PRESETS = [
  { label: 'وردي', colors: ['#D4737C', '#F2A0B6', '#C4A38C'] },
  { label: 'ذهبي', colors: ['#D4A843', '#B76E79', '#E8D5B7'] },
  { label: 'بني', colors: ['#6B4423', '#CD853F', '#8B6914'] },
  { label: 'طبيعي', colors: ['#DEB6AB', '#C4A38C', '#F2A0B6'] },
];

export default function StyleMatchScreen() {
  const [colors, setColors] = useState<string[]>(['#D4737C']);
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(false);

  const match = () => { setLoading(true); ((trpc as any).styleMatch.match.mutate({ colors }) as any).then((d: any) => { setResults(d); setLoading(false); }).catch(() => setLoading(false)); };

  if (results) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>✨ إطلالات مشابهة</Text>
        {results.map((r: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.rCard}>
            <Text style={styles.rEmoji}>{['daily','evening','party','bridal'].includes(r.category as string) ? ({daily:'☀️',evening:'🌙',party:'🎉',bridal:'👰'} as any)[r.category as string] : '✨'}</Text>
            <View style={{flex:1}}><Text style={styles.rName}>{r.titleAr as string}</Text><Text style={styles.rPct}>{r.matchPct as number}% تطابق</Text></View>
          </View>
        ))}
        <TouchableOpacity style={styles.resetBtn} onPress={() => setResults(null)}><Text>🔄 إعادة</Text></TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📸 Style Match</Text>
      <View style={styles.presets}>{PRESETS.map((p) => <TouchableOpacity key={p.label} onPress={() => setColors(p.colors)} style={styles.preset}><View style={styles.presetDots}>{p.colors.map((c: string) => <View key={c} style={[styles.dot, { backgroundColor: c }]} />)}</View><Text style={styles.presetLabel}>{p.label}</Text></TouchableOpacity>)}</View>
      <View style={styles.colorRow}>{colors.map((c: string, i: number) => <View key={i} style={[styles.colorSwatch, { backgroundColor: c }]} />)}</View>
      <TouchableOpacity style={styles.matchBtn} onPress={match}><Text style={styles.matchText}>🔍 ابحثي عن إطلالات</Text></TouchableOpacity>
      {loading && <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
  preset: { backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center' },
  presetDots: { flexDirection: 'row', gap: 3, marginBottom: 4 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
  presetLabel: { fontSize: 11, color: '#6b7280' },
  colorRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#fff' },
  matchBtn: { backgroundColor: '#7c3aed', borderRadius: 14, padding: 16, alignItems: 'center' },
  matchText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, gap: 12, alignItems: 'center' },
  rEmoji: { fontSize: 36 }, rName: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right' },
  rPct: { fontSize: 12, fontWeight: '700', color: '#059669', textAlign: 'right', marginTop: 4 },
  resetBtn: { marginTop: 16, alignSelf: 'center' },
});
