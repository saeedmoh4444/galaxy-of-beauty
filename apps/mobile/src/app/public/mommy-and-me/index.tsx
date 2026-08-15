import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface MommyService {
  id?: number;
  emoji?: string;
  nameAr?: string;
  descAr?: string;
  price?: number;
  duration?: string;
}

export default function MommyAndMeScreen(): JSX.Element {
  const servicesQ = trpc.womensServices.categories.useQuery();
  const services: MommyService[] = (servicesQ.data as unknown as MommyService[] | undefined) ?? [];
  if (servicesQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={servicesQ.isRefetching}
          onRefresh={() => servicesQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>‍ أمي وأنا</Text>
      {services.map((s) => (
        <View key={s.id} style={styles.card}>
          <Text style={styles.se}>{s.emoji ?? '‍️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{s.nameAr}</Text>
            <Text style={styles.sd}>{s.descAr}</Text>
            <View style={styles.sm}>
              <Text style={styles.sp}>{s.price?.toLocaleString()} ر.س</Text>
              <Text style={styles.sdu}>️ {s.duration}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bb}>
            <Text style={styles.bt}>حجز</Text>
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
  se: { fontSize: 32 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sm: { flexDirection: 'row', gap: 12, marginTop: 4 },
  sp: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  sdu: { fontSize: 12, color: '#9ca3af' },
  bb: { backgroundColor: '#db2777', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  bt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
