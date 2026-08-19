import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  danger: '#dc2626',
};

export default function CartScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const cart = trpc.marketplace.cart.useQuery() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = cart.data as unknown[] | undefined;
  const total = data
    ? (data as Record<string, unknown>[]).reduce(
        (sum: number, i: Record<string, unknown>) =>
          sum + Number(i.price ?? 0) * Number(i.quantity ?? 1),
        0,
      )
    : 0;

  return (
    <ScreenState
      isLoading={cart.isLoading}
      isError={cart.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('cart.load-error')}
      emptyTitle={t('cart.empty-title')}
      emptyDescription={t('cart.empty-desc')}
      onRetry={() => cart.refetch()}
    >
      <Text style={styles.title}>{t('cart.title')}</Text>
      {(data as Record<string, unknown>[])?.map((item: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.name}>
                {item.nameJson
                  ? localize(item.nameJson as { ar?: string; en?: string }, locale)
                  : ''}
              </Text>
              <Text style={styles.qty}>
                {t('cart.quantity', { qty: String(item.quantity ?? 1) })}
              </Text>
            </View>
            <Text style={styles.price}>{formatCurrency(Number(item.price ?? 0))}</Text>
          </View>
        </View>
      ))}
      {data && data.length > 0 ? (
        <View style={styles.footer}>
          <Text style={styles.total}>{t('cart.total', { total: formatCurrency(total) })}</Text>
          <TouchableOpacity style={styles.checkoutBtn}>
            <Text style={styles.checkoutText}>{t('cart.checkout')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
  qty: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.brand },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    alignItems: 'center',
  },
  total: { fontSize: 18, fontWeight: '800', color: COLORS.gray900, marginBottom: 12 },
  checkoutBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  checkoutText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
