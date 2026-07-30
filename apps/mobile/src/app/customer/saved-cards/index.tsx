import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SavedCardsScreen() {
  const [cards, setCards] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).savedCards.list.query() as any).then((d: any) => { setCards(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#6b7280" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💳 البطاقات المحفوظة</Text>
      {cards.length === 0 ? <Text style={styles.e}>لا توجد بطاقات</Text> :
        cards.map((c: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.brand}>{(c as any).brand || 'بطاقة'}</Text>
            <Text style={styles.last4}>**** {(c as any).last4 || '----'}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  brand: { fontSize: 14, fontWeight: '600', color: '#111827' }, last4: { fontSize: 14, color: '#6b7280', fontFamily: 'monospace' },
});
