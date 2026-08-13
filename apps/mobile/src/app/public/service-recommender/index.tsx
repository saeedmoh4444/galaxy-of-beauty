import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc, typedTrpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function ServiceRecommenderScreen(): JSX.Element {
  const recs = typedTrpc().serviceRecommender?.getRecommendations?.useQuery?.({}) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = recs.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={recs.isLoading}
      isError={recs.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل التوصيات"
      emptyTitle="لا توجد توصيات"
      onRetry={() => recs.refetch()}
    >
      <Text style={styles.title}> توصيات لكِ</Text>
      {(data as Record<string, unknown>[])?.map((r: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{(r.emoji as string) ?? ''}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{(r.nameJson as any)?.ar ?? (r.nameAr as string) ?? ''}</Text>
            <Text style={styles.price}>{r.price ? formatCurrency(Number(r.price)) : ''}</Text>
          </View>
        </View>
      ))}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: { fontSize: 32, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.brand, marginTop: 4 },
});
