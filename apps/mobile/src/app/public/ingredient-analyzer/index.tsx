import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState } from 'react';

const RATING_COLORS: any = { safe: '#16a34a', caution: '#d97706', avoid: '#dc2626' };

export default function IngredientAnalyzerScreen() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = () => {
    if (!text.trim()) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.ingredientAnalyzer.analyze.query({ ingredients: text.trim() }) as any).then((d: any) => { setResult(d); setLoading(false); }).catch(() => setLoading(false));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🧪 تحليل المكونات</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="الصقي قائمة المكونات..." multiline numberOfLines={4} textAlign="right" />
        <TouchableOpacity style={styles.btn} onPress={analyze} disabled={!text.trim() || loading}><Text style={styles.btnText}>🧪 تحليل</Text></TouchableOpacity>
        {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} /> : result ? (
          <View style={styles.resultCard}>
            <View style={styles.stats}>
              <View style={styles.stat}><Text style={[styles.statNum, { color: '#16a34a' }]}>{result.stats.safe}</Text><Text style={styles.statLabel}>آمن</Text></View>
              <View style={styles.stat}><Text style={[styles.statNum, { color: '#d97706' }]}>{result.stats.caution}</Text><Text style={styles.statLabel}>حذر</Text></View>
              <View style={styles.stat}><Text style={[styles.statNum, { color: '#dc2626' }]}>{result.stats.avoid}</Text><Text style={styles.statLabel}>تجنب</Text></View>
              <View style={styles.stat}><Text style={[styles.statNum, { color: '#7c3aed' }]}>{result.stats.score}%</Text><Text style={styles.statLabel}>أمان</Text></View>
            </View>
            {result.ingredients.map((ing: any, i: number) => (
              <View key={i} style={styles.ingRow}>
                <Text style={styles.ingName}>{ing.name}</Text>
                <View style={[styles.ingBadge, { backgroundColor: RATING_COLORS[ing.rating] + '20' }]}><Text style={[styles.ingBadgeText, { color: RATING_COLORS[ing.rating] }]}>{ing.rating === 'safe' ? '✅' : ing.rating === 'caution' ? '⚠️' : '❌'}</Text></View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  input: { backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 14, fontSize: 14, marginBottom: 12, minHeight: 100 },
  btn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  resultCard: { marginTop: 20 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  ingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  ingName: { fontSize: 14, color: '#374151', flex: 1, textAlign: 'right' },
  ingBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  ingBadgeText: { fontSize: 14 },
});
