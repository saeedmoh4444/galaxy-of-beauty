import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SalonFinderScreen(): JSX.Element {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).salonMap.locations.query({ city: 'الرياض' }) as any).then((d: any) => { setSalons(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📍 صالونات قريبة</Text>
      <Text style={styles.sub}>اكتشفي الصالونات القريبة من موقعكِ</Text>

      {salons.length === 0 ? <Text style={styles.e}>لا توجد صالونات قريبة</Text> :
        salons.map((s: any) => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.salonEmoji}>💇‍♀️</Text>
            <View style={{flex:1}}>
              <Text style={styles.salonName}>{s.nameAr as string ?? s.name as string}</Text>
              <Text style={styles.salonAddr}>📍 {s.city as string}{s.distance ? ` · ${s.distance as string}` : ''}</Text>
              <View style={styles.meta}>
                <Text style={styles.rating}>⭐ {s.rating as number ?? 0}</Text>
                <Text style={styles.techs}>👩‍🎨 {s.technicianCount as number ?? 0} فنيات</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewBtn}><Text style={styles.viewBtnText}>عرض</Text></TouchableOpacity>
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
  salonEmoji: { fontSize: 36 }, salonName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  salonAddr: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  rating: { fontSize: 12, color: '#f59e0b' }, techs: { fontSize: 12, color: '#6b7280' },
  viewBtn: { backgroundColor: '#db2777', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  viewBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
