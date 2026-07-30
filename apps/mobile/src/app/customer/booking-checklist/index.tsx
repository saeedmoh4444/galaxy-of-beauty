import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BookingChecklistScreen() {
  const [cats, setCats] = useState<Record<string, unknown>[]>([]);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (trpc.bookingChecklist.categories.query() as any).then((d: any) => { setCats(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const fetch = (cat: string) => { setLoading(true); (trpc.bookingChecklist.get.query({ category: cat }) as any).then((d: any) => { setItems((d as any).items || []); setLoading(false); }).catch(() => setLoading(false)); };

  if (loading) return <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📋 قائمة التحضير</Text>
      <View style={styles.cats}>{cats.map((c: Record<string, unknown>) => <TouchableOpacity key={c.key as string} onPress={() => fetch(c.key as string)} style={styles.cat}><Text>{c.emoji as string} {c.nameAr as string}</Text></TouchableOpacity>)}</View>
      {items.map((item: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.item}><Text style={styles.itemEmoji}>{item.emoji as string}</Text><View style={{flex:1}}><Text style={styles.itemText}>{item.textAr as string}</Text><Text style={styles.itemEn}>{item.textEn as string}</Text></View></View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 16 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16, justifyContent: 'center' },
  cat: { backgroundColor: '#dbeafe', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, gap: 10 },
  itemEmoji: { fontSize: 28 }, itemText: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'right' },
  itemEn: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 2 },
});
