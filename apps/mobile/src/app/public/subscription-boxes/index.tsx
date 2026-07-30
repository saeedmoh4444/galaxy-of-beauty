import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SubscriptionBoxesScreen(): JSX.Element {
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).subscriptionBoxes.list.query() as any).then((d: any) => { setBoxes(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📦 الصناديق الشهرية</Text>
      <Text style={styles.sub}>صندوق جمال شهري لباب بيتكِ</Text>
      {boxes.length === 0 ? <Text style={styles.e}>لا توجد صناديق</Text> :
        boxes.map((b: any) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.boxEmoji}>{b.emoji as string ?? '📦'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.boxName}>{b.nameAr as string}</Text>
              <Text style={styles.boxDesc}>{(b.descAr as string)?.substring(0, 80)}</Text>
              <Text style={styles.boxItems}>📦 {b.itemCount as number} منتجات</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={styles.boxPrice}>{(b.price as number)?.toLocaleString()} ر.س</Text>
              <Text style={styles.boxPeriod}>/شهرياً</Text>
              <TouchableOpacity style={styles.subBtn}><Text style={styles.subBtnText}>اشتراك</Text></TouchableOpacity>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  boxEmoji: { fontSize: 36 }, boxName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  boxDesc: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  boxItems: { fontSize: 12, color: '#7c3aed', marginTop: 4 },
  boxPrice: { fontSize: 18, fontWeight: '800', color: '#7c3aed' }, boxPeriod: { fontSize: 11, color: '#9ca3af' },
  subBtn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 6 },
  subBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
