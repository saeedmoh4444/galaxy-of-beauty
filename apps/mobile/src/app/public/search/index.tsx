import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState } from 'react';

export default function SearchScreen(): JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    ((trpc as any).search.all.query({ q: query.trim() }) as any).then((d: any) => { setResults(d); setLoading(false); }).catch(() => setLoading(false));
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔍 بحث</Text>
      <View style={styles.searchRow}>
        <TextInput value={query} onChangeText={setQuery} placeholder="ابحثي عن خدمات، فنيات، منتجات..." style={styles.input} placeholderTextColor="#9ca3af" onSubmitEditing={doSearch} returnKeyType="search" />
        <TouchableOpacity onPress={doSearch} style={styles.searchBtn}><Text style={styles.searchBtnText}>🔍</Text></TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} size="large" />}

      {results && !loading && (
        <>
          {((results.services as any[]) ?? []).length > 0 && (
            <>
              <Text style={styles.sectionTitle}>💆‍♀️ خدمات</Text>
              {(results.services as any[]).map((s: any) => (
                <View key={s.id} style={styles.card}>
                  <Text style={styles.cardEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
                  <View style={{flex:1}}>
                    <Text style={styles.cardTitle}>{s.nameAr as string}</Text>
                    <Text style={styles.cardMeta}>{(s.price as number)?.toLocaleString()} ر.س · ⏱️ {s.duration as string}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
          {((results.technicians as any[]) ?? []).length > 0 && (
            <>
              <Text style={styles.sectionTitle}>👩‍🎨 فنيات</Text>
              {(results.technicians as any[]).map((t: any) => (
                <View key={t.id} style={styles.card}>
                  <Text style={styles.cardEmoji}>👩‍🎨</Text>
                  <View style={{flex:1}}><Text style={styles.cardTitle}>{t.name as string}</Text><Text style={styles.cardMeta}>⭐ {t.rating as number}</Text></View>
                </View>
              ))}
            </>
          )}
          {((results.services as any[]) ?? []).length === 0 && ((results.technicians as any[]) ?? []).length === 0 && <Text style={styles.e}>لا توجد نتائج</Text>}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: { flex: 1, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#111827', backgroundColor: '#fff' },
  searchBtn: { backgroundColor: '#4f46e5', borderRadius: 14, width: 50, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { fontSize: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 6 },
  cardEmoji: { fontSize: 28 }, cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
