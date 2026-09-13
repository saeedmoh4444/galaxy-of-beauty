import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function InvoicesScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const invoices = trpc.zatca.listInvoices.useQuery({}) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = invoices.data as unknown[] | undefined;
  const statusLabel = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return t('mobile.groupBookings.status-pending');
      case 'REPORTED':
        return t('mobile.invoices.status-reported');
      case 'CLEARED':
        return t('mobile.invoices.status-cleared');
      case 'REJECTED':
        return t('mobile.invoices.status-rejected');
      default:
        return status;
    }
  };

  return (
    <ScreenState
      isLoading={invoices.isLoading}
      isError={invoices.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('mobile.invoices.load-error')}
      emptyTitle={t('mobile.invoices.empty')}
      onRetry={() => invoices.refetch()}
    >
      <Text style={styles.title}>{t('mobile.invoices.title')}</Text>
      <FlatList
        data={data as Record<string, unknown>[]}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }: { item: Record<string, unknown> }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.invoice}>{item.invoiceNumber as string}</Text>
              <Text style={styles.status}>{statusLabel(item.status as string)}</Text>
            </View>
            <Text style={styles.date}>
              {item.createdAt
                ? new Date(item.createdAt as string).toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-GB',
                  )
                : ''}
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
  invoice: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
  status: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  date: { fontSize: 11, color: COLORS.gray400 },
});
