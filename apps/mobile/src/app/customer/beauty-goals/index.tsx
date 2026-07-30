import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const GOAL_TEMPLATES = [
  { key: 'glowing_skin', emoji: '✨', title: 'بشرة متألقة', target: 12, unit: 'جلسة' },
  { key: 'hair_care', emoji: '💇‍♀️', title: 'عناية بالشعر', target: 8, unit: 'جلسة' },
  { key: 'selfcare', emoji: '🧖‍♀️', title: 'عناية ذاتية', target: 20, unit: 'جلسة' },
  { key: 'nails', emoji: '💅', title: 'أظافر مثالية', target: 24, unit: 'جلسة' },
];

export default function BeautyGoalsScreen(): JSX.Element {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).beautyBudget.get.query() as any).then(() => setLoading(false)).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎯 أهداف الجمال</Text>
      <Text style={styles.sub}>حددي أهدافكِ وتابعي تقدمكِ</Text>

      <View style={styles.grid}>
        {GOAL_TEMPLATES.map(g => {
          const pct = Math.min(100, Math.floor(Math.random() * 100));
          return (
            <View key={g.key} style={styles.card}>
              <Text style={styles.goalEmoji}>{g.emoji}</Text>
              <Text style={styles.goalTitle}>{g.title}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {width: `${pct}%`}]} />
              </View>
              <Text style={styles.goalMeta}>{g.target} {g.unit} · {pct}%</Text>
              <TouchableOpacity style={styles.setBtn}><Text style={styles.setBtnText}>تحديد هدف</Text></TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' },
  goalEmoji: { fontSize: 40 }, goalTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 },
  progressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, width: '100%', marginTop: 12 },
  progressFill: { height: 6, backgroundColor: '#059669', borderRadius: 3 },
  goalMeta: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  setBtn: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10 },
  setBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
