import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function GiftCardsScreen(): JSX.Element {
  const { data: cards, loading, error, refetch } = useQuery(() => trpc.giftCards.myCards.query() as any);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;
  if (error) return <ErrorAlert message="فشل تحميل البطاقات" onRetry={refetch} />;

  const items = (cards ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎁 بطاقات الهدايا</Text>
      {items.length === 0 ? <Text style={styles.e}>لا توجد بطاقات</Text> : items.map((c: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.giftCode}>{c.code as string}</Text>
          <Text style={styles.giftBalance}>{(c.balance as number)?.toLocaleString()} ر.س</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 6 },
  giftCode: { fontSize: 14, fontWeight: '700', color: '#d97706', fontFamily: 'monospace' },
  giftBalance: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
