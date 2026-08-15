import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { DEFAULT_SAUDI_CITY } from '@galaxy/shared';

interface SalonLocation {
  id?: number;
  nameAr?: string;
  name?: string;
  city?: string;
  rating?: number;
}

export default function SalonMapScreen(): JSX.Element {
  const salonsQ = trpc.salonMap.explore.useQuery({ city: DEFAULT_SAUDI_CITY });

  if (salonsQ.isLoading) return <SkeletonList count={5} />;

  const salons = (salonsQ.data as unknown as SalonLocation[] | null) ?? [];
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={salonsQ.isRefetching}
          onRefresh={() => salonsQ.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> خريطة الصالونات</Text>
      {salons.map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.se}>‍️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{s.nameAr ?? s.name}</Text>
            <Text style={styles.sm}> {s.city}</Text>
            <Text style={styles.sr}> {s.rating ?? 0}</Text>
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
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
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
  sr: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
  vb: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  vt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
