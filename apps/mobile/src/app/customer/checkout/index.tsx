import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

const PAYMENT_METHODS = [
  { key: 'online', emoji: '💳', label: 'checkout.method-card' },
  { key: 'wallet', emoji: '👛', label: 'checkout.method-wallet' },
] as const;

export default function CheckoutScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { t } = useLocale();
  const [method, setMethod] = useState<'online' | 'wallet'>('online');
  const [placed, setPlaced] = useState(false);

  const cartQ = trpc.marketplace.cart.useQuery(undefined, { enabled: isAuthed });
  const balanceQ = trpc.wallet.getBalance.useQuery(undefined, { enabled: isAuthed });
  // Real purchase (stock/sales/vendor revenue) via marketplace.buyCart —
  // mirrors the web checkout. Payment processing (wallet debit / payfort)
  // remains separate work.
  const buyMut = trpc.marketplace.buyCart.useMutation({
    onSuccess: () => {
      setPlaced(true);
      void cartQ.refetch();
    },
  });

  const cartItems = (cartQ.data as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const subtotal = cartItems.reduce(
    (s: number, i: Record<string, unknown>) =>
      s + Number((i.product as Record<string, unknown>)?.price ?? 0) * (i.quantity as number),
    0,
  );
  const fee = subtotal > 0 ? 11 : 0;
  const total = subtotal + fee;
  const walletBalance = Number((balanceQ.data as Record<string, unknown> | null)?.balance ?? 0);

  if (cartQ.isLoading || balanceQ.isLoading) return <SkeletonList count={4} />;
  if (cartQ.isError)
    return <ErrorAlert message={t('common.loadFailed')} onRetry={() => cartQ.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={cartQ.isRefetching || balanceQ.isRefetching}
          onRefresh={async () => {
            await cartQ.refetch();
            await balanceQ.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('checkout.title')}</Text>

      <View style={styles.bc}>
        <Text style={styles.bl}>{t('checkout.wallet-balance')}</Text>
        <Text style={styles.ba}>
          {t('checkout.amount-sar', { value: walletBalance.toLocaleString() })}
        </Text>
      </View>

      {placed ? (
        <View style={styles.success}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>{t('wallet.order-placed')}</Text>
          <Text style={styles.successMsg}>{t('wallet.order-confirm-message')}</Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.success}>
          <Text style={styles.successEmoji}>🛒</Text>
          <Text style={styles.successTitle}>{t('wallet.empty-cart')}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.st}>{t('checkout.summary')}</Text>
          <View style={styles.summary}>
            {cartItems.map((item: Record<string, unknown>) => {
              const p = item.product as Record<string, unknown>;
              return (
                <View key={item.id as number} style={styles.sr}>
                  <Text style={styles.sl}>
                    {`${(p?.nameJson as Record<string, string> | undefined)?.ar ?? ''} ×${item.quantity as number}`}
                  </Text>
                  <Text style={styles.sv}>
                    {formatCurrency(Number(p?.price ?? 0) * (item.quantity as number))}
                  </Text>
                </View>
              );
            })}
            <View style={styles.sd} />
            <View style={styles.sr}>
              <Text style={styles.sl}>{t('wallet.subtotal')}</Text>
              <Text style={styles.sv}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.sr}>
              <Text style={styles.sl}>{t('wallet.platform-fee')}</Text>
              <Text style={styles.sv}>{formatCurrency(fee)}</Text>
            </View>
            <View style={styles.sr}>
              <Text style={[styles.sl, { fontWeight: '700' }]}>{t('wallet.total')}</Text>
              <Text style={[styles.sv, { fontWeight: '800', fontSize: 20 }]}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>

          <Text style={styles.st}>{t('checkout.payment-method')}</Text>
          <View style={styles.pms}>
            {PAYMENT_METHODS.map((p) => (
              <TouchableOpacity
                key={p.key}
                onPress={() => setMethod(p.key)}
                disabled={p.key === 'wallet' && walletBalance < total}
                style={[
                  styles.pm,
                  method === p.key && styles.pma,
                  p.key === 'wallet' && walletBalance < total && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.pe}>{p.emoji}</Text>
                <Text style={[styles.pl, method === p.key && styles.pla]}>{t(p.label)}</Text>
                {p.key === 'wallet' && walletBalance < total && (
                  <Text style={styles.insuf}>{t('wallet.insufficient-balance')}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {buyMut.isError && (
            <Text style={styles.err}>{(buyMut.error as { message?: string })?.message}</Text>
          )}
          <TouchableOpacity
            style={styles.btn}
            disabled={buyMut.isPending}
            onPress={() => buyMut.mutate({})}
          >
            <Text style={styles.bt}>
              {t('checkout.pay-now', { amount: total.toLocaleString() })}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  bc: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  bl: { fontSize: 13, color: '#a7f3d0' },
  ba: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  pms: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  pm: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  pma: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  pe: { fontSize: 24 },
  pl: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4 },
  pla: { color: '#059669' },
  insuf: { fontSize: 9, color: '#dc2626', marginTop: 2 },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  sr: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  sl: { fontSize: 14, color: '#374151', flex: 1 },
  sv: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sd: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  err: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  btn: { backgroundColor: '#059669', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  success: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86efac',
  },
  successEmoji: { fontSize: 48 },
  successTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  successMsg: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
});
