import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function GeofenceOffersScreen(): JSX.Element {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).geofenceOffers.nearby.query({ city: 'الرياض' /* TODO: from user location */ }) as any).then((d: any) => { setOffers(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const optIn = () => {
    ((trpc as any).geofenceOffers.optIn.mutate({}) as any);
  };

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📍 عروض بالقرب منك</Text>
      <Text style={styles.sub}>عروض حصرية من الصالونات القريبة</Text>
      <TouchableOpacity onPress={optIn} style={styles.optInBtn}><Text style={styles.optInBtnText}>🔔 فعلي التنبيهات القريبة</Text></TouchableOpacity>
      {offers.length === 0 ? <Text style={styles.e}>لا توجد عروض قريبة</Text> :
        offers.map((o: any) => (
          <View key={o.id} style={styles.card}>
            <Text style={styles.offerEmoji}>{o.emoji as string}</Text>
            <View style={{flex:1}}>
              <Text style={styles.offerTitle}>{o.titleAr as string}</Text>
              <Text style={styles.offerMeta}>{o.salonName as string} · {o.distance as string} · {o.city as string}</Text>
            </View>
            <View style={styles.expiryBadge}><Text style={styles.expiryText}>⏰ {o.expiresIn as string}</Text></View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  optInBtn: { backgroundColor: '#059669', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
  optInBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  offerEmoji: { fontSize: 36 }, offerTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  offerMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  expiryBadge: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  expiryText: { fontSize: 11, fontWeight: '700', color: '#dc2626' },
});
