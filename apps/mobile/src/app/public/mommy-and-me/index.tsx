import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function MommyAndMeScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).mommyAndMe.services.query() as any).then((d: any) => { setServices(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>👩‍👧 أمي وأنا</Text>
      <Text style={styles.sub}>خدمات تجميل للأم والطفلة معاً</Text>
      {services.length === 0 ? <Text style={styles.e}>لا توجد خدمات</Text> :
        services.map((s: any) => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.svcEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.svcName}>{s.nameAr as string}</Text>
              <Text style={styles.svcDesc}>{s.descAr as string}</Text>
              <View style={styles.svcMeta}>
                <Text style={styles.svcPrice}>{(s.price as number)?.toLocaleString()} ر.س</Text>
                <Text style={styles.svcDuration}>⏱️ {s.duration as string}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bookBtn}><Text style={styles.bookBtnText}>حجز</Text></TouchableOpacity>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  svcEmoji: { fontSize: 32 }, svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  svcDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 }, svcMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  svcPrice: { fontSize: 14, fontWeight: '700', color: '#db2777' }, svcDuration: { fontSize: 12, color: '#9ca3af' },
  bookBtn: { backgroundColor: '#db2777', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
