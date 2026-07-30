import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyMetaverseScreen(): JSX.Element {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    ((trpc as any).beautyMetaverse.salons.query() as any).then((d: any) => { setSalons(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const enter = (salonId: number) => {
    ((trpc as any).beautyMetaverse.enter.mutate({ salonId, avatar: 'skin1' }) as any).then((d: any) => setResult(d));
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>🎮 عالم الجمال الافتراضي</Text>
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultEmoji}>🌐</Text>
          <Text style={styles.resultTitle}>{result.welcomeMessage as string}</Text>
          <View style={styles.actions}>
            {(result.availableActions as string[])?.map((a: string) => <Text key={a} style={styles.actionChip}>{a}</Text>)}
          </View>
          <TouchableOpacity onPress={() => setResult(null)} style={styles.exitBtn}><Text style={styles.exitBtnText}>خروج</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎮 عالم الجمال الافتراضي</Text>
      <Text style={styles.sub}>تجولي في صالونات افتراضية ثلاثية الأبعاد</Text>
      {salons.length === 0 ? <Text style={styles.e}>لا توجد صالونات</Text> :
        <View style={styles.grid}>
          {salons.map((s: any) => (
            <TouchableOpacity key={s.id} onPress={() => enter(s.id as number)} style={styles.salonCard}>
              <Text style={styles.salonEmoji}>{s.emoji as string}</Text>
              <Text style={styles.salonName}>{s.name as string}</Text>
              <Text style={styles.salonMeta}>👩‍🎨 {s.technician as string} · ⭐ {s.rating as number} · 👥 {s.visitors as number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  salonCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  salonEmoji: { fontSize: 40 }, salonName: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 },
  salonMeta: { fontSize: 10, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  resultCard: { alignItems: 'center', borderWidth: 2, borderColor: '#c4b5fd' },
  resultEmoji: { fontSize: 56 }, resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 12, textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 12 },
  actionChip: { fontSize: 12, color: '#7c3aed', backgroundColor: '#ede9fe', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  exitBtn: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 16, width: '100%' },
  exitBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
