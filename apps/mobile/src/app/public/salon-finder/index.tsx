import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface Salon {
  id?: number;
  nameAr?: string;
  name?: string;
  city?: string;
  distance?: string;
  rating?: number;
  technicianCount?: number;
}

export default function SalonFinderScreen(): JSX.Element {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().salonMap.locations.query({ city: 'الرياض' /* TODO */ }) as Promise<Salon[]>)
      .then((d: Salon[]) => {
        setSalons(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}> صالونات قريبة</Text>
      {salons.map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.se}>‍️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{s.nameAr ?? s.name}</Text>
            <Text style={styles.sm}>
               {s.city ?? ''}
              {s.distance ? ` · ${s.distance}` : ''}
            </Text>
            <Text style={styles.sr}>
               {s.rating ?? 0} · ‍ {s.technicianCount ?? 0} فنيات
            </Text>
          </View>
          <TouchableOpacity style={styles.vb}>
            <Text style={styles.vt}>عرض</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  se: { fontSize: 36 },
  sn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sr: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  vb: { backgroundColor: '#db2777', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  vt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
