import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ReferralDashboardScreen() {
  const [code, setCode] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([(trpc.referrals.getMyCode.query() as any), (trpc.referrals.getStats.query() as any)])
      .then(([c, s]) => { setCode((c as any).code || ''); setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎫 الإحالات</Text>
      {code && <View style={styles.codeBox}><Text style={styles.codeLabel}>كودكِ</Text><Text style={styles.code}>{code}</Text></View>}
      {stats && (
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statNum}>{stats.totalReferred || 0}</Text><Text style={styles.statLabel}>مدعوة</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>{stats.completedReferrals || 0}</Text><Text style={styles.statLabel}>مكتملة</Text></View>
          <View style={styles.stat}><Text style={[styles.statNum, { color: '#059669' }]}>{stats.totalEarned || 0} ر.س</Text><Text style={styles.statLabel}>ربح</Text></View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  codeBox: { alignItems: 'center', backgroundColor: '#7c3aed', borderRadius: 16, padding: 20, marginBottom: 20 },
  codeLabel: { fontSize: 13, color: '#ddd6fe', marginBottom: 8 }, code: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 4 },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  stat: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, width: 100 },
  statNum: { fontSize: 18, fontWeight: '800', color: '#7c3aed' }, statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
});
