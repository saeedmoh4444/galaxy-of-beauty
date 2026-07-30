import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function GiftRegistryScreen() {
  const [registries, setRegistries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).giftRegistry.myRegistries.query() as any).then((d: any) => { setRegistries(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎁 سجل الهدايا</Text>
      {registries.length === 0 ? <Text style={styles.e}>لا يوجد سجل هدايا</Text> :
        registries.map((r: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardEmoji}>🎁</Text><View style={{flex:1}}><Text style={styles.name}>{r.name as string}</Text><Text style={styles.date}>{r.date as string}</Text></View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, gap: 12, alignItems: 'center' },
  cardEmoji: { fontSize: 36 }, name: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  date: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
});
