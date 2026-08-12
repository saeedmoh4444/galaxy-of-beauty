import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  active: '#10b981',
  redeemed: '#f59e0b',
};

export default function GiftCardsScreen(): JSX.Element {
  const cards = (trpc as any).giftCards?.myCards?.useQuery?.({}) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = cards.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={cards.isLoading}
      isError={cards.isError}
      isEmpty={!data || data.length === 0}
      errorMessage="فشل تحميل البطاقات"
      emptyTitle="لا توجد بطاقات هدايا"
      emptyDescription="اشتري بطاقة هدية لأصدقائك"
      onRetry={() => cards.refetch()}
    >
      <Text style={styles.title}> بطاقات الهدية</Text>
      {(data as Record<string, unknown>[])?.map((gc: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.code}>{gc.code as string}</Text>
            <Text
              style={[
                styles.status,
                { color: gc.status === 'ACTIVE' ? COLORS.active : COLORS.redeemed },
              ]}
            >
              {(gc.status as string) === 'ACTIVE' ? ' نشطة' : ' مستخدمة'}
            </Text>
          </View>
          <Text style={styles.balance}>
            الرصيد: {formatCurrency(Number(gc.balance ?? gc.amount ?? 0))}
          </Text>
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
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  code: { fontSize: 14, fontWeight: '700', color: COLORS.gray900, fontFamily: 'monospace' },
  status: { fontSize: 12, fontWeight: '600' },
  balance: { fontSize: 15, fontWeight: '700', color: COLORS.brand },
});
