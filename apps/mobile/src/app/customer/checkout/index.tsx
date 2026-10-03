import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Linking,
  AppState,
} from 'react-native';
import { useState, useEffect } from 'react';
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

const SHIPPING_METHODS = [
  { key: 1, label: 'mobile.checkout.shipping-method-dhl' },
  { key: 2, label: 'mobile.checkout.shipping-method-aramex' },
] as const;

interface ShippingState {
  personName: string;
  mobile: string;
  lineAddress: string;
  cityName: string;
  postalCode: string;
  countryCode: string;
  shippingMethod: 1 | 2;
}

export default function CheckoutScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { t } = useLocale();
  const [method, setMethod] = useState<'online' | 'wallet'>('online');
  const [placed, setPlaced] = useState(false);
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingState>({
    personName: '',
    mobile: '',
    lineAddress: '',
    cityName: '',
    postalCode: '',
    countryCode: 'SA',
    shippingMethod: 1,
  });
  const [cityInput, setCityInput] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const cartQ = trpc.marketplace.cart.useQuery(undefined, { enabled: isAuthed });
  const balanceQ = trpc.wallet.getBalance.useQuery(undefined, { enabled: isAuthed });
  // Real purchase (stock/sales/vendor revenue + shipping + payment) via
  // payments.payCart — wallet debit or MyFatoorah hosted invoice link.
  const payMut = trpc.payments.payCart.useMutation({
    onSuccess: (data) => {
      if (data.invoiceURL) {
        setLastInvoiceId(data.invoiceId ?? null);
        void Linking.openURL(data.invoiceURL);
      } else {
        setPlaced(true);
        void cartQ.refetch();
      }
    },
  });
  const verifyMut = trpc.payments.verifyCartPayment.useMutation({
    onSuccess: (d) => {
      if (d.status === 'PAID') {
        setPlaced(true);
        setVerifyFailed(false);
        setLastInvoiceId(null);
        void cartQ.refetch();
      } else if (d.status === 'FAILED') {
        setVerifyFailed(true);
        setLastInvoiceId(null);
      }
    },
  });

  const countriesQ = trpc.payments.shippingCountries.useQuery(undefined, { enabled: isAuthed });
  const citiesQ = trpc.payments.shippingCities.useQuery(
    {
      countryCode: shipping.countryCode,
      searchValue: citySearch || undefined,
      shippingMethod: shipping.shippingMethod,
    },
    { enabled: isAuthed && shipping.countryCode.length > 0 },
  );

  const cartItems = (cartQ.data as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const subtotal = cartItems.reduce(
    (s: number, i: Record<string, unknown>) =>
      s + Number((i.product as Record<string, unknown>)?.price ?? 0) * (i.quantity as number),
    0,
  );
  const fee = subtotal > 0 ? 11 : 0;
  const chargeItems = cartItems.map((i: Record<string, unknown>) => ({
    name: (i.product as Record<string, unknown> | undefined)?.nameJson
      ? (((i.product as Record<string, unknown>).nameJson as Record<string, string>).ar ?? '')
      : '',
    quantity: i.quantity as number,
    unitPrice: Number((i.product as Record<string, unknown>)?.price ?? 0),
  }));
  const chargeQ = trpc.payments.shippingCharge.useQuery(
    {
      shippingMethod: shipping.shippingMethod,
      countryCode: shipping.countryCode,
      cityName: shipping.cityName,
      postalCode: shipping.postalCode,
      items: chargeItems,
    },
    {
      enabled:
        isAuthed &&
        chargeItems.length > 0 &&
        shipping.cityName.length > 0 &&
        shipping.postalCode.length > 0,
    },
  );
  const shippingCharge = chargeQ.data?.shippingCharge ?? null;
  const total = subtotal + fee + (shippingCharge ?? 0);
  const walletBalance = Number((balanceQ.data as Record<string, unknown> | null)?.balance ?? 0);

  const shippingComplete =
    shipping.personName.trim().length > 0 &&
    shipping.mobile.trim().length > 0 &&
    shipping.lineAddress.trim().length > 0 &&
    shipping.cityName.length > 0 &&
    shipping.postalCode.trim().length > 0 &&
    shipping.countryCode.length > 0;

  // Debounce the city search input into the cities query.
  useEffect(() => {
    const id = setTimeout(() => setCitySearch(cityInput), 400);
    return () => clearTimeout(id);
  }, [cityInput]);

  // When the app comes back from the gateway page, verify the invoice.
  useEffect(() => {
    if (!lastInvoiceId) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        verifyMut.mutate({ invoiceId: lastInvoiceId });
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastInvoiceId]);

  if (cartQ.isLoading || balanceQ.isLoading) return <SkeletonList count={4} />;
  if (cartQ.isError)
    return <ErrorAlert message={t('common.loadFailed')} onRetry={() => cartQ.refetch()} />;

  const countries = (countriesQ.data ?? []) as Array<{
    countryCode: string;
    englishName: string;
    arabicName: string;
  }>;
  const cities = (citiesQ.data ?? []) as string[];

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
              <Text style={styles.sl}>{t('mobile.checkout.shipping-charge')}</Text>
              <Text style={styles.sv}>
                {shippingCharge === null ? '—' : formatCurrency(shippingCharge)}
              </Text>
            </View>
            <View style={styles.sr}>
              <Text style={[styles.sl, { fontWeight: '700' }]}>{t('wallet.total')}</Text>
              <Text style={[styles.sv, { fontWeight: '800', fontSize: 20 }]}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>

          <Text style={styles.st}>{t('mobile.checkout.shipping-title')}</Text>
          <View style={styles.summary}>
            <Text style={styles.sl}>{t('mobile.checkout.shipping-country')}</Text>
            <View style={styles.chips}>
              {countries.map((c) => (
                <TouchableOpacity
                  key={c.countryCode}
                  onPress={() => setShipping((s) => ({ ...s, countryCode: c.countryCode }))}
                  style={[styles.chip, shipping.countryCode === c.countryCode && styles.chipA]}
                >
                  <Text
                    style={[styles.chipL, shipping.countryCode === c.countryCode && styles.chipLA]}
                  >
                    {c.arabicName || c.englishName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sl}>{t('mobile.checkout.shipping-city')}</Text>
            <TextInput
              style={styles.inp}
              value={cityInput}
              onChangeText={(v) => {
                setCityInput(v);
                setShipping((s) => ({ ...s, cityName: v }));
              }}
              placeholder={t('mobile.checkout.shipping-city-placeholder')}
            />
            {cities.length > 0 && (
              <View style={styles.chips}>
                {cities.slice(0, 8).map((city) => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => {
                      setCityInput(city);
                      setShipping((s) => ({ ...s, cityName: city }));
                    }}
                    style={[styles.chip, shipping.cityName === city && styles.chipA]}
                  >
                    <Text style={[styles.chipL, shipping.cityName === city && styles.chipLA]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.sl}>{t('mobile.checkout.shipping-person-name')}</Text>
            <TextInput
              style={styles.inp}
              value={shipping.personName}
              onChangeText={(v) => setShipping((s) => ({ ...s, personName: v }))}
            />
            <Text style={styles.sl}>{t('mobile.checkout.shipping-mobile')}</Text>
            <TextInput
              style={styles.inp}
              value={shipping.mobile}
              onChangeText={(v) => setShipping((s) => ({ ...s, mobile: v }))}
              keyboardType="phone-pad"
            />
            <Text style={styles.sl}>{t('mobile.checkout.shipping-line-address')}</Text>
            <TextInput
              style={styles.inp}
              value={shipping.lineAddress}
              onChangeText={(v) => setShipping((s) => ({ ...s, lineAddress: v }))}
            />
            <Text style={styles.sl}>{t('mobile.checkout.shipping-postal-code')}</Text>
            <TextInput
              style={styles.inp}
              value={shipping.postalCode}
              onChangeText={(v) => setShipping((s) => ({ ...s, postalCode: v }))}
              keyboardType="number-pad"
            />

            <Text style={styles.sl}>{t('mobile.checkout.shipping-method')}</Text>
            <View style={styles.pms}>
              {SHIPPING_METHODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => setShipping((s) => ({ ...s, shippingMethod: m.key }))}
                  style={[styles.pm, shipping.shippingMethod === m.key && styles.pma]}
                >
                  <Text style={[styles.pl, shipping.shippingMethod === m.key && styles.pla]}>
                    {t(m.label)}
                  </Text>
                </TouchableOpacity>
              ))}
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

          {lastInvoiceId && (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => verifyMut.mutate({ invoiceId: lastInvoiceId })}
            >
              <Text style={styles.linkL}>{t('mobile.checkout.check-payment-status')}</Text>
            </TouchableOpacity>
          )}
          {verifyFailed && <Text style={styles.err}>{t('mobile.checkout.payment-failed')}</Text>}
          {(payMut.isError || verifyMut.isError) && (
            <Text style={styles.err}>
              {((payMut.error ?? verifyMut.error) as { message?: string } | null)?.message}
            </Text>
          )}
          {!shippingComplete && (
            <Text style={styles.warn}>{t('mobile.checkout.shipping-required')}</Text>
          )}
          <TouchableOpacity
            style={[styles.btn, (!shippingComplete || payMut.isPending) && { opacity: 0.5 }]}
            disabled={!shippingComplete || payMut.isPending}
            onPress={() =>
              payMut.mutate({
                idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
                method,
                shipping,
              })
            }
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
  sl: { fontSize: 14, color: '#374151', flex: 1, marginTop: 10 },
  sv: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sd: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipA: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  chipL: { fontSize: 12, color: '#6b7280' },
  chipLA: { color: '#059669', fontWeight: '700' },
  inp: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 6,
  },
  err: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  warn: { color: '#b45309', fontSize: 13, marginBottom: 8 },
  linkBtn: { alignItems: 'center', marginBottom: 8 },
  linkL: { color: '#059669', fontSize: 14, fontWeight: '700' },
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
