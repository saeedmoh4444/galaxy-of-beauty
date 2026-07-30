import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function ReviewsScreen(): JSX.Element {
  const { data, loading, error, refetch } = useQuery(() => trpc.reviews.list.query({}));

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;
  if (error) return <ErrorAlert message="فشل تحميل التقييمات" onRetry={refetch} />;

  const items = (data ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>⭐ تقييماتي</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد تقييمات</Text> :
        (items as any[]).map((r: any) => (
          <View key={r.id as number} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.rating}>⭐ {r.rating as number}</Text>
              <Text style={styles.date}>{new Date(r.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            </View>
            {r.comment && <Text style={styles.comment}>{r.comment as string}</Text>}
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rating: { fontSize: 14, fontWeight: '700', color: '#d97706' },
  date: { fontSize: 12, color: '#9ca3af' },
  comment: { fontSize: 13, color: '#374151', lineHeight: 20, textAlign: 'right' },
});
