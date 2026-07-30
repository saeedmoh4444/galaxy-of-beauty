import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const COLORS: any = { silver: '#9ca3af', gold: '#f59e0b', platinum: '#7c3aed' };

export default function VIPMembershipScreen() {
  const [tiers, setTiers] = useState<Record<string, unknown>[]>([]);
  const [myTier, setMyTier] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([(trpc.vipMembership.tiers.query() as any), (trpc.vipMembership.myTier.query() as any)])
      .then(([t, m]) => { setTiers(t); setMyTier(m); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>💎 عضوية VIP</Text>
      {tiers.map((t: Record<string, unknown>, i: number) => {
        const isCurrent = myTier?.currentTier === t.key;
        return (
          <View key={i} style={[styles.card, isCurrent && { borderColor: COLORS[t.key as string] || '#7c3aed', borderWidth: 2 }]}>
            {isCurrent && <View style={styles.currentBadge}><Text style={styles.currentText}>حالية</Text></View>}
            <Text style={styles.tierEmoji}>{t.emoji as string}</Text>
            <Text style={styles.tierName}>{t.nameAr as string}</Text>
            <Text style={styles.tierPrice}>{(t.price as number) > 0 ? `${t.price as number} ر.س` : 'مجاناً'} / سنة</Text>
            {(t.benefits as string[]).map((b: string, j: number) => <Text key={j} style={styles.benefit}>✓ {b}</Text>)}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  inner: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, position: 'relative' },
  currentBadge: { position: 'absolute', top: -10, alignSelf: 'center', backgroundColor: '#7c3aed', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 3 },
  currentText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tierEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  tierName: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center' },
  tierPrice: { fontSize: 20, fontWeight: '700', color: '#7c3aed', textAlign: 'center', marginTop: 4, marginBottom: 12 },
  benefit: { fontSize: 13, color: '#374151', textAlign: 'right', marginBottom: 6 },
});
