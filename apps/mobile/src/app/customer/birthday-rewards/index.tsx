import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BirthdayRewardsScreen() {
  const [reward, setReward] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => { setLoading(true); (trpc.birthdayRewards.myReward.query() as any).then((d: any) => { setReward(d); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>🎂 هدية عيد ميلادكِ</Text>
      {reward?.claimed ? (
        <View style={styles.claimedCard}>
          <Text style={styles.bigEmoji}>🎉</Text><Text style={styles.heading}>تم استلام هديتكِ!</Text>
          {reward.promoCode ? <View style={styles.codeBox}><Text style={styles.codeText}>{reward.promoCode as string}</Text></View> : null}
        </View>
      ) : reward ? (
        <View style={styles.claimCard}>
          <Text style={styles.bigEmoji}>🎁</Text><Text style={styles.heading}>هديتكِ في انتظاركِ!</Text>
          <TouchableOpacity style={styles.claimBtn} onPress={() => ((trpc as any).birthdayRewards.claim.mutate()).then(() => fetch())}><Text style={styles.claimText}>🎂 استلمي هديتكِ</Text></TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyCard}><Text style={styles.bigEmoji}>📅</Text><Text style={styles.heading}>لم يحن موعد هديتكِ بعد</Text><Text style={styles.hint}>تأكدي من تحديث تاريخ ميلادكِ</Text></View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' },
  inner: { padding: 20, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#be185d', marginBottom: 24 },
  bigEmoji: { fontSize: 64, marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  hint: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  claimedCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 30, width: '100%' },
  claimCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 30, width: '100%' },
  emptyCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 30, width: '100%' },
  codeBox: { backgroundColor: '#fce7f3', borderRadius: 14, borderWidth: 2, borderColor: '#f9a8d4', borderStyle: 'dashed', padding: 20, marginTop: 12 },
  codeText: { fontSize: 28, fontWeight: '800', color: '#be185d', letterSpacing: 6 },
  claimBtn: { backgroundColor: '#be185d', borderRadius: 14, padding: 16, marginTop: 12, width: '100%', alignItems: 'center' },
  claimText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
