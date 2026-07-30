import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState } from 'react';

export default function HomeServiceScreen() {
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fetch = () => { setLoading(true); ((trpc as any).homeService.estimate.query({ city: 'الرياض' }) as any).then((d: any) => { setEstimate(d); setLoading(false); }).catch(() => setLoading(false)); };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🏠 خدمة منزلية</Text>
      <TouchableOpacity onPress={fetch} style={styles.btn} disabled={loading}><Text style={styles.btnText}>💰 تقدير التكلفة — الرياض</Text></TouchableOpacity>
      {loading ? <ActivityIndicator color="#059669" style={{ marginTop: 20 }} /> : estimate ? (
        <View style={styles.result}>
          <View style={styles.row}><Text style={styles.label}>رسوم الخدمة</Text><Text>{estimate.serviceFee} ر.س</Text></View>
          <View style={styles.row}><Text style={styles.label}>رسوم الزيارة</Text><Text>{estimate.travelFee} ر.س</Text></View>
          <View style={styles.row}><Text style={styles.label}>الإجمالي</Text><Text style={styles.total}>{estimate.total} ر.س</Text></View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: '#059669', borderRadius: 14, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  result: { marginTop: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 14, color: '#6b7280' },
  total: { fontSize: 18, fontWeight: '800', color: '#059669' },
});
