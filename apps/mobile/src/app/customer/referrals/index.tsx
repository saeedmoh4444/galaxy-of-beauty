import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ReferralsScreen() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.referrals.getMyCode as any).query({} as never)
      .then((d: Record<string, unknown>) => { setData(d); setLoading(false); })
      .catch(() => { setError('فشل تحميل بيانات الإحالة'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    // Code is auto-generated on first fetch
    fetch();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>برنامج الإحالة</Text>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : !data ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.empty}>انضم لبرنامج الإحالة</Text>
          <Text style={styles.hint}>أحِلّي صديقاتك واكسبي مكافآت</Text>
          <TouchableOpacity style={styles.btn} onPress={handleCreate}><Text style={styles.btnText}>إنشاء رمز الإحالة</Text></TouchableOpacity>
        </View>
       ) : (
        <View>
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>رمز الإحالة الخاص بك</Text>
            <Text style={styles.code} selectable>{data.code as string}</Text>
            <Text style={styles.codeHint}>شاركي هذا الرمز مع صديقاتك</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{String(data.totalReferrals ?? 0)}</Text>
              <Text style={styles.statLabel}>إحالات</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{Number(data.totalRewards ?? 0).toFixed(0)} ر.س</Text>
              <Text style={styles.statLabel}>مكافآت</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center', marginBottom: 16 },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  codeCard: { backgroundColor: '#f5f3ff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  codeLabel: { fontSize: 14, color: '#7c3aed', marginBottom: 8 },
  code: { fontSize: 28, fontWeight: '800', color: '#111827', fontFamily: 'monospace', letterSpacing: 4 },
  codeHint: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});
