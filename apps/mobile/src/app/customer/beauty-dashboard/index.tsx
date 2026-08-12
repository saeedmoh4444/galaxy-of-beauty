import { View, Text, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
};

export default function BeautyDashboardScreen(): JSX.Element {
  const loyalty = trpc.loyalty.myAccount.useQuery();
  const insights = trpc.analytics.customerInsights.useQuery();
  const lData = loyalty.data as Record<string, unknown> | undefined;
  const iData = insights.data as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={loyalty.isLoading}
      isError={loyalty.isError}
      isEmpty={!lData && !iData}
      errorMessage="فشل تحميل لوحة الجمال"
      onRetry={() => {
        loyalty.refetch();
        insights.refetch();
      }}
    >
      <Text style={styles.title}> لوحة الجمال</Text>
      {[
        { label: 'نقاط الولاء', value: `${String(lData?.points ?? 0)} `, color: COLORS.warning },
        { label: 'المستوى', value: (lData?.tier as string) ?? '—', color: COLORS.brand },
        { label: 'الحجوزات', value: String(iData?.bookingCount ?? 0), color: COLORS.success },
        { label: 'الإنفاق', value: `${String(iData?.totalSpent ?? 0)} ر.س`, color: COLORS.gray900 },
      ].map((item, i) => (
        <View key={i} style={styles.card}>
          <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  value: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, color: COLORS.gray400 },
});
