import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyFaqScreen() {
  const insets = useSafeAreaInsets();
  const [faqs, setFaqs] = useState<Record<string, unknown>[]>([]);
  const [cats, setCats] = useState<Record<string, unknown>[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise.all([(trpc.beautyFaq.categories.query() as any), (trpc.beautyFaq.search.query({}) as any)])
      .then(([c, d]) => { setCats(c); setFaqs(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const search = (q: string, cat: string | null) => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.beautyFaq.search.query({ query: q || undefined, category: cat || undefined }) as any)
      .then((d: any) => { setFaqs(d); setLoading(false); }).catch(() => setLoading(false));
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🤖 أسئلة شائعة</Text></View>
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} onSubmitEditing={() => search(query, category)} placeholder="ابحثي..." textAlign="right" />
        <TouchableOpacity style={styles.searchBtn} onPress={() => search(query, category)}><Text style={styles.searchBtnText}>بحث</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal style={styles.catRow} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity onPress={() => { setCategory(null); search(query, null); }} style={[styles.cat, !category && styles.catActive]}><Text style={[styles.catText, !category && styles.catTextActive]}>الكل</Text></TouchableOpacity>
        {cats.map((c: Record<string, unknown>) => (
          <TouchableOpacity key={c.key as string} onPress={() => { setCategory(c.key as string); search(query, c.key as string); }} style={[styles.cat, category === c.key && styles.catActive]}><Text style={[styles.catText, category === c.key && styles.catTextActive]}>{c.emoji as string} {c.nameAr as string}</Text></TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.inner}>
        {faqs.map((f: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.q}>{f.q as string}</Text>
            <Text style={styles.a}>{f.a as string}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center' },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 10, fontSize: 14 },
  searchBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  catRow: { paddingHorizontal: 12, marginBottom: 8, maxHeight: 40 },
  cat: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6', marginRight: 6 },
  catActive: { backgroundColor: '#7c3aed' },
  catText: { fontSize: 12, color: '#6b7280' },
  catTextActive: { color: '#fff' },
  inner: { padding: 12, paddingBottom: 40 },
  card: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginBottom: 10 },
  q: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 8 },
  a: { fontSize: 13, color: '#6b7280', textAlign: 'right', lineHeight: 22 },
});
