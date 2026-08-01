import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AddressesScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.addresses.list.query());

  if (loading) return <View style={styles.c}><Text style={styles.t}>📍 عناويني</Text><SkeletonList count={3} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل العناوين" onRetry={refetch} />;

  const items = (data ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#0891b2']} />}>
      <Text style={styles.t}>📍 عناويني</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد عناوين محفوظة</Text> :
        (items as any[]).map((a: any) => (
          <View key={a.id as number} style={styles.card}>
            <Text style={styles.addrLabel}>{a.label as string ?? 'عنوان'}</Text>
            <Text style={styles.addrText}>{a.city as string} · {a.area as string}</Text>
            {a.street && <Text style={styles.addrStreet}>{a.street as string}</Text>}
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  addrLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  addrText: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  addrStreet: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
