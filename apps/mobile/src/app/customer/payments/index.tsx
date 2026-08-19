import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency, EXTENDED_PAGE_SIZE } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  danger: '#dc2626',
};

export default function PaymentsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const payments = trpc.wallet.getTransactions.useQuery({ page: 1, limit: EXTENDED_PAGE_SIZE }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = payments.data?.transactions as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={payments.isLoading}
      isError={payments.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('mobile.payments.load-error')}
      emptyTitle={t('mobile.payments.empty')}
      onRetry={() => payments.refetch()}
    >
      <Text style={styles.title}>{t('mobile.payments.title')}</Text>
      <FlatList
        data={data as Record<string, unknown>[]}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }: { item: Record<string, unknown> }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.desc}>
                {t('mobile.reschedule.booking', { id: (item.bookingId as number) ?? '' })}
              </Text>
              <Text style={styles.date}>
                {new Date(item.createdAt as string).toLocaleDateString(
                  locale === 'ar' ? 'ar-SA' : 'en-GB',
                )}
              </Text>
            </View>
            <Text
              style={[
                styles.amount,
                { color: item.status === 'CAPTURED' ? COLORS.success : COLORS.danger },
              ]}
            >
              {formatCurrency(Number(item.amount ?? 0))}
            </Text>
          </View>
        )}
      />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  desc: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
  date: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700' },
});
