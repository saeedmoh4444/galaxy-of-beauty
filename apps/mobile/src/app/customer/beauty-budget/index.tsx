import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
};

export default function BeautyBudgetScreen(): JSX.Element {
  const budget = (trpc as any).beautyBudget?.get?.useQuery?.() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const loyalty = (trpc as any).loyalty?.getAccount?.useQuery?.();
  const savings = (trpc as any).savingsGoals?.list?.useQuery?.();
  const data = budget.data as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={budget.isLoading}
      isError={budget.isError}
      isEmpty={!data}
      errorMessage="فشل تحميل الميزانية"
      onRetry={() => budget.refetch()}
    >
      <Text style={styles.title}> ميزانية الجمال</Text>
      <View style={styles.card}>
        <Text style={styles.label}>الميزانية الشهرية</Text>
        <Text style={styles.amount}>{formatCurrency(Number(data?.budget ?? 0))}</Text>
      </View>
      {loyalty?.data || savings?.data ? (
        <View style={styles.card}>
          {loyalty?.data && (
            <Text style={styles.label}> نقاط الولاء: {loyalty.data.points ?? 0}</Text>
          )}
          {savings?.data && (
            <Text style={styles.label}>
               أهداف الادخار: {(savings.data as any[])?.length ?? 0}
            </Text>
          )}
        </View>
      ) : null}
      <View style={styles.card}>
        <Text style={styles.label}>الإنفاق الحالي</Text>
        <Text
          style={[
            styles.amount,
            {
              color:
                Number(data?.spent ?? 0) > Number(data?.budget ?? 0)
                  ? COLORS.danger
                  : COLORS.success,
            },
          ]}
        >
          {formatCurrency(Number(data?.spent ?? 0))}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>المتبقي</Text>
        <Text style={[styles.amount, { color: COLORS.brand }]}>
          {formatCurrency(Math.max(0, Number(data?.budget ?? 0) - Number(data?.spent ?? 0)))}
        </Text>
      </View>
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 13, color: COLORS.gray400, marginBottom: 4 },
  amount: { fontSize: 24, fontWeight: '800', color: COLORS.gray900 },
});
