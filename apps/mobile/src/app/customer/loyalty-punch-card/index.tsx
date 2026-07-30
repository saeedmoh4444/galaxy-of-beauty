import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function LoyaltyPunchCardScreen() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.loyaltyPunchCard.myCard.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  const stamps = (data?.stamps as number) ?? 0;
  const total = (data?.total as number) ?? 10;
  const free = data?.earnedFree as boolean;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎀 بطاقة الولاء</Text>
      <Text style={styles.msg}>{free ? '🎉 جلسة مجانية!' : `احجزي ${total - stamps} مرات للجلسة المجانية`}</Text>
      <View style={styles.stamps}>{Array.from({length: total}, (_, i) => <View key={i} style={[styles.stamp, i < stamps && styles.filled]}><Text style={styles.stampText}>{i < stamps ? '💅' : '○'}</Text></View>)}</View>
      <Text style={styles.count}>{stamps}/{total}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, alignItems: 'center', paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', marginBottom: 8 },
  msg: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 12 },
  stamp: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  filled: { backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#f59e0b' },
  stampText: { fontSize: 20 },
  count: { fontSize: 18, fontWeight: '800', color: '#d97706' },
});
