import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface GeofenceOffer {
  id?: number;
  emoji?: string;
  titleAr?: string;
  salonName?: string;
  distance?: string;
  expiresIn?: string;
}

export default function GeofenceOffersScreen(): JSX.Element {
  const [offers, setOffers] = useState<GeofenceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (
      typedTrpc().geofenceOffers.nearby.query({
        city: 'الرياض' /* TODO: from user location */,
      }) as Promise<GeofenceOffer[]>
    )
      .then((d) => {
        setOffers(d || []);
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
  const optIn = () => {
    typedTrpc().geofenceOffers.optIn.mutate({}) as Promise<unknown>;
  };
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> عروض بالقرب منك</Text>
      <TouchableOpacity onPress={optIn} style={styles.ob}>
        <Text style={styles.ot}> فعلي التنبيهات القريبة</Text>
      </TouchableOpacity>
      {offers.map((o) => (
        <View key={o.id} style={styles.card}>
          <Text style={styles.oe}>{o.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.otit}>{o.titleAr ?? ''}</Text>
            <Text style={styles.om}>
              {o.salonName ?? ''} · {o.distance ?? ''}
            </Text>
          </View>
          <View style={styles.ex}>
            <Text style={styles.ext}> {o.expiresIn ?? ''}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 16 },
  ob: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  ot: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  oe: { fontSize: 36 },
  otit: { fontSize: 14, fontWeight: '600', color: '#111827' },
  om: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  ex: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  ext: { fontSize: 11, fontWeight: '700', color: '#dc2626' },
});
