import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function AddressesScreen(): JSX.Element {
  const { data, loading, error, refetch } = useQuery(() => trpc.addresses.list.query());

  if (loading) return <ActivityIndicator color="#0891b2" style={{ marginTop: 40 }} size="large" />;
  if (error) return <ErrorAlert message="فشل تحميل العناوين" onRetry={refetch} />;

  const items = (data ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
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
