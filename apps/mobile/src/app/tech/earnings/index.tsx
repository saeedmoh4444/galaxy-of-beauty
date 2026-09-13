import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

const STATUS_MAP: Record<string, TranslationKey> = {
  PENDING: 'tech.earnings.status-pending',
  PROCESSING: 'tech.earnings.status-processing',
  COMPLETED: 'tech.earnings.status-completed',
  FAILED: 'tech.earnings.status-failed',
};

export default function TechEarningsScreen(): JSX.Element {
  const { t } = useLocale();
  const earnings = trpc.technicianEarnings.summary.useQuery() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const monthly = trpc.technicianEarnings.monthly.useQuery({ months: 6 });
  const data = earnings.data as unknown as Record<string, unknown> | undefined;
  const items = (monthly.data ?? []) as unknown as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={earnings.isLoading}
      isError={earnings.isError}
      isEmpty={!data}
      errorMessage={t('tech.earnings.earnings-load-error')}
      onRetry={() => earnings.refetch()}
    >
      <Text style={styles.title}>{t('mobile.tech.earnings.title')}</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{t('tech.wallet.total-earnings')}</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(Number(data?.totalEarned ?? 0))}</Text>
      </View>
      {items && items.length > 0 && (
        <FlatList
          data={items as Record<string, unknown>[]}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.txnRow}>
              <View>
                <Text style={styles.txnPeriod}>{item.month ? (item.month as string) : ''}</Text>
                <Text style={styles.txnStatus}>
                  {STATUS_MAP[item.status as string]
                    ? t(STATUS_MAP[item.status as string])
                    : (item.status as string)}
                </Text>
              </View>
              <Text style={styles.txnAmount}>{formatCurrency(Number(item.amount ?? 0))}</Text>
            </View>
          )}
        />
      )}
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
  summaryCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  summaryAmount: { fontSize: 32, fontWeight: '800', color: COLORS.white, marginTop: 8 },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  txnPeriod: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
  txnStatus: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: '700', color: COLORS.brand },
});
