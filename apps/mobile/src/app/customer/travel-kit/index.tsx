import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TravelKitScreen() {
  const [dests, setDests] = useState<Record<string, unknown>[]>([]);
  const [kit, setKit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (trpc.travelKit.destinations.query() as any).then((d: any) => { setDests(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const build = (dest: string) => { setLoading(true); ((trpc as any).travelKit.build.query({ destination: dest, days: 7 }) as any).then((d: any) => { setKit(d); setLoading(false); }).catch(() => setLoading(false)); };

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;

  if (kit) return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <TouchableOpacity onPress={() => setKit(null)}><Text style={styles.back}>← العودة</Text></TouchableOpacity>
      <Text style={styles.t}>🧳 حقيبة {kit.days} أيام</Text>
      <Text style={styles.tip}>💡 {kit.tip}</Text>
      {(kit.items as Record<string, unknown>[]).map((item: Record<string, unknown>, i: number) => (
        <View key={i} style={[styles.item, (item.essential as boolean) && styles.essential]}>
          <Text style={styles.itemEmoji}>{item.emoji as string}</Text><View style={{flex:1}}><Text style={styles.itemName}>{item.nameAr as string}</Text><Text style={styles.itemSize}>{item.size as string}</Text></View>
          {(item.essential as boolean) ? <Text style={styles.essentialBadge}>أساسي</Text> : null}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🧳 حقيبة السفر</Text>
      {dests.map((d: Record<string, unknown>) => (
        <TouchableOpacity key={d.key as string} onPress={() => build(d.key as string)} style={styles.card}>
          <Text style={styles.cardEmoji}>{d.nameAr as string}</Text><Text style={styles.cardName}>{d.tips as string}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  back: { fontSize: 14, color: '#0891b2', marginBottom: 12 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 12 },
  tip: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardEmoji: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'right' },
  cardName: { fontSize: 13, color: '#6b7280', textAlign: 'right', marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 6, gap: 10 },
  essential: { borderWidth: 1, borderColor: '#a7f3d0', backgroundColor: '#f0fdf4' },
  itemEmoji: { fontSize: 28 }, itemName: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'right' },
  itemSize: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 2 },
  essentialBadge: { fontSize: 10, fontWeight: '700', color: '#059669', backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
});
