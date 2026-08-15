import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { DEFAULT_SAUDI_CITY } from '@galaxy/shared';

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
  const salonsQ = trpc.salonMap.explore.useQuery({
    city: DEFAULT_SAUDI_CITY /* TODO: use user location */,
  });
  const salons: Salon[] = (salonsQ.data as unknown as Salon[] | undefined) ?? [];
  if (salonsQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={salonsQ.isRefetching}
          onRefresh={() => salonsQ.refetch()}
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
