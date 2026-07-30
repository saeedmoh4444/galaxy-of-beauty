import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const TIER_LABELS: Record<string, { name: string; emoji: string; color: string }> = {
  SILVER: { name: 'الفضية', emoji: '🥈', color: '#9ca3af' },
  GOLD: { name: 'الذهبية', emoji: '🥇', color: '#f59e0b' },
  PLATINUM: { name: 'البلاتينية', emoji: '💎', color: '#7c3aed' },
};

export default function RewardsScreen(): JSX.Element {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).loyalty.rewards.query() as any).then((d: any) => { setRewards(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🏆 برنامج المكافآت</Text>
      <Text style={styles.sub}>اكسبي نقاط مع كل حجز واستبدليها بمكافآت حصرية</Text>

      <View style={styles.tierRow}>
        {Object.entries(TIER_LABELS).map(([key, t]) => (
          <View key={key} style={[styles.tierCard, {backgroundColor: t.color + '20', borderColor: t.color}]}>
            <Text style={styles.tierEmoji}>{t.emoji}</Text>
            <Text style={[styles.tierName, {color: t.color}]}>{t.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>🎁 المكافآت المتاحة</Text>
      {rewards.length === 0 ? <Text style={styles.e}>لا توجد مكافآت متاحة</Text> :
        rewards.map((r: any) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.rewardEmoji}>{r.emoji as string ?? '🎁'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.rewardName}>{r.nameAr as string ?? r.titleAr as string}</Text>
              <Text style={styles.rewardDesc}>{r.descAr as string}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.rewardPoints}>{(r.pointsCost as number ?? r.points as number)?.toLocaleString()} نقطة</Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  tierRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  tierCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 2 },
  tierEmoji: { fontSize: 28 }, tierName: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  rewardEmoji: { fontSize: 30 }, rewardName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rewardDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rewardPoints: { fontSize: 14, fontWeight: '700', color: '#d97706' },
});
