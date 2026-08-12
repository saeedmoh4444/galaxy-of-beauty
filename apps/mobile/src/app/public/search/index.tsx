import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function SearchScreen(): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const doSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    ((trpc as any).search.all.query({ q: query.trim() }) as any)
      .then((d: any) => {
        setResults(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> بحث</Text>
      <View style={styles.sr}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ابحثي عن خدمات، فنيات، منتجات..."
          style={styles.inp}
          placeholderTextColor="#9ca3af"
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={doSearch} style={styles.sb}>
          <Text style={styles.sbt}></Text>
        </TouchableOpacity>
      </View>
      {loading && <SkeletonList count={4} />}
      {results && !loading && (
        <>
          {((results.services as any[]) ?? []).length > 0 && (
            <Text style={styles.st}>‍️ خدمات</Text>
          )}
          {(results.services as any[])?.map((s: any) => (
            <View key={s.id} style={styles.card}>
              <Text style={styles.ce}>{(s.emoji as string) ?? '‍️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cn}>{s.nameAr as string}</Text>
                <Text style={styles.cm}>{(s.price as number)?.toLocaleString()} ر.س</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 16 },
  sr: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  inp: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  sb: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sbt: { fontSize: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  ce: { fontSize: 28 },
  cn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
