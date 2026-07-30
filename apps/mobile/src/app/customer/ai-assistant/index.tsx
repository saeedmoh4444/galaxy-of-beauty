import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AIAssistantScreen() {
  const [topics, setTopics] = useState<Record<string, unknown>[]>([]);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { (trpc.aiAssistant.topics.query() as any).then((d: any) => setTopics(d)).catch(() => {}); }, []);

  const ask = () => { if (!query.trim()) return; setLoading(true); (trpc.aiAssistant.ask.query({ question: query.trim() }) as any).then((d: any) => { setAnswer(d); setLoading(false); }).catch(() => setLoading(false)); };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>🧠 المساعدة الذكية</Text>
      <View style={styles.topics}>{topics.map((t: Record<string, unknown>) => <TouchableOpacity key={t.key as string} onPress={() => { setQuery(t.label as string); setAnswer(null); }} style={styles.topic}><Text style={styles.topicText}>{t.emoji as string} {t.label as string}</Text></TouchableOpacity>)}</View>
      <View style={styles.askRow}><TextInput style={styles.input} value={query} onChangeText={setQuery} onSubmitEditing={ask} placeholder="اسألي..." textAlign="right" /><TouchableOpacity style={styles.askBtn} onPress={ask}><Text style={styles.askText}>اسألي</Text></TouchableOpacity></View>
      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} /> : answer ? <View style={styles.answerCard}><Text style={styles.a}>{answer.answer as string}</Text></View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  inner: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 16 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16, justifyContent: 'center' },
  topic: { backgroundColor: '#ede9fe', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  topicText: { fontSize: 12, color: '#7c3aed', fontWeight: '600' },
  askRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 10, fontSize: 14 },
  askBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  askText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  answerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 16, borderLeftWidth: 4, borderLeftColor: '#7c3aed' },
  a: { fontSize: 14, color: '#374151', lineHeight: 24, textAlign: 'right' },
});
