import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function GiftCardsScreen() {
  const [cards, setCards] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.giftCards.myCards.query() as any).then((d: any) => { setCards(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎁 بطاقات الهدايا</Text>
      {cards.length === 0 ? <Text style={styles.e}>لا توجد بطاقات</Text> : cards.map((c: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardEmoji}>🎁</Text><View style={{ flex: 1 }}><Text style={styles.cardTitle}>بطاقة {c.value as number} ر.س</Text><Text style={styles.cardCode}>{(c.code as string) || '———'}</Text></View>
          <Text style={[styles.status, { color: (c.isUsed as boolean) ? '#9ca3af' : '#059669' }]}>{(c.isUsed as boolean) ? 'مستخدمة' : 'صالحة'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, alignItems: 'center', gap: 12 },
  cardEmoji: { fontSize: 36 }, cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  cardCode: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 4, fontFamily: 'monospace' },
  status: { fontSize: 13, fontWeight: '600' },
});
