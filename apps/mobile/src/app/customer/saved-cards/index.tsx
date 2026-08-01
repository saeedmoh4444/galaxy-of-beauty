import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function SavedCardsScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.savedCards.list.query());
  if (loading) return <SkeletonList count={3} />;
  if (error) return <ErrorAlert message="فشل تحميل البطاقات" onRetry={refetch} />;
  const cards = (data ?? []) as Record<string, unknown>[];
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#6b7280']} />}>
      <Text style={styles.t}>💳 البطاقات المحفوظة</Text>
      {cards.length === 0 ? <Text style={styles.e}>لا توجد بطاقات</Text> : cards.map((c: Record<string, unknown>, i: number) => (<View key={i} style={styles.card}><Text style={styles.brand}>{(c as any).brand || 'بطاقة'}</Text><Text style={styles.last4}>**** {(c as any).last4 || '----'}</Text></View>))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  brand: { fontSize: 14, fontWeight: '600', color: '#111827' }, last4: { fontSize: 14, color: '#6b7280', fontFamily: 'monospace' },
});
