import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function IngredientSubScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.ingredientSub.list.query() as any).then((d: any) => { setItems(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const search = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.ingredientSub.find.query({ ingredient: q }) as any).then((d: any) => { setResult(d); setLoading(false); }).catch(() => setLoading(false));
  };

  if (loading && !result) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🧴 بدائل المكونات</Text></View>
      <View style={styles.searchRow}>
        <TextInput style={styles.input} value={query} onChangeText={setQuery} onSubmitEditing={() => search(query)} placeholder="اسم المادة..." textAlign="right" />
        <TouchableOpacity style={styles.btn} onPress={() => search(query)}><Text style={styles.btnText}>بحث</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.inner}>
        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>🔄 بدائل {result.ingredient as string}</Text>
            {(result.subs as Record<string, unknown>[])?.map((s: Record<string, unknown>, i: number) => (
              <View key={i} style={styles.sub}>
                <Text style={styles.subEmoji}>{s.emoji as string}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subName}>{s.nameAr as string}</Text>
                  <Text style={styles.subEn}>{s.nameEn as string}</Text>
                  <Text style={styles.subDesc}>{s.descAr as string}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          items.map((item: Record<string, unknown>, i: number) => (
            <TouchableOpacity key={i} style={styles.item} onPress={() => { setQuery(item.ingredient as string); search(item.ingredient as string); }}>
              <Text style={styles.itemText}>⚠️ {item.ingredient as string}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ecfdf5' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#d1fae5', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#059669', textAlign: 'center' },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#d1fae5', padding: 10, fontSize: 14 },
  btn: { backgroundColor: '#059669', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  inner: { padding: 12, paddingBottom: 40 },
  item: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 14, marginBottom: 8 },
  itemText: { fontSize: 14, fontWeight: '600', color: '#dc2626', textAlign: 'right' },
  resultCard: { marginTop: 8 },
  resultTitle: { fontSize: 16, fontWeight: '700', color: '#059669', textAlign: 'right', marginBottom: 12 },
  sub: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, gap: 10, alignItems: 'center' },
  subEmoji: { fontSize: 28 },
  subName: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right' },
  subEn: { fontSize: 11, color: '#9ca3af', textAlign: 'right' },
  subDesc: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
});
