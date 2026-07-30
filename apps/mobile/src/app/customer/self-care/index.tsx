import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SelfCareScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).selfCare.todayMood.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🌸 العناية الذاتية</Text>
      {data ? (
        <View style={styles.card}>
          <Text style={styles.mood}>مزاج اليوم: {['😞','😕','😐','🙂','😄'][((data as any).mood || 3) - 1]}</Text>
          <View style={styles.r}><Text>💧 ماء</Text><Text>{(data as any).water || 0} أكواب</Text></View>
          <View style={styles.r}><Text>😴 نوم</Text><Text>{(data as any).sleep || 0} ساعات</Text></View>
        </View>
      ) : <Text style={styles.e}>لا توجد بيانات اليوم</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  mood: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 16 },
  r: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
});
