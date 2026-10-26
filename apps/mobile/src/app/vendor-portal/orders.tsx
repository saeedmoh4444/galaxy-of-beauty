import type { JSX } from 'react';
import { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared/i18n-mobile';
import type { StoreOrderRow } from '@galaxy/api';
import { orderStatusTone, isLate, fulfillIdempotencyKey } from '@/utils/vendorOrders';
import type { OrderStatusTone } from '@/utils/vendorOrders';

// Mirrors the web orders-tab chips (green/red/amber).
const TONE: Record<OrderStatusTone, { bg: string; fg: string; labelKey: string }> = {
  fulfilled: { bg: '#ecfdf5', fg: '#059669', labelKey: 'mobile.vendorPortal.orders.fulfilled' },
  cancelled: { bg: '#fef2f2', fg: '#dc2626', labelKey: 'mobile.vendorPortal.orders.cancelled' },
  pending: { bg: '#fffbeb', fg: '#d97706', labelKey: 'mobile.vendorPortal.orders.pending' },
};

/** E2 — order operations: the daily run loop (list, SLA late flags,
 *  fulfill with idempotency key, cancel). Same staff-aware procedures as
 *  the web orders tab; native UI over the existing orders query. */
export default function VendorOrdersScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isAuthed = useAuthState();

  const ordersQ = trpc.vendorPortal.orders.useInfiniteQuery(
    { limit: 20 },
    {
      enabled: isAuthed,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );
  const orders = ordersQ.data?.pages.flatMap((p) => p.items) ?? [];

  // H0 — one idempotency key per order until success: a retried tap after
  // a client timeout re-uses the key and gets the row instead of an error.
  const fulfillKeys = useRef<Record<number, string>>({});
  const fulfillMut = trpc.vendorPortal.fulfillOrder.useMutation({
    onSuccess: (_data, vars) => {
      delete fulfillKeys.current[vars.orderId];
      void ordersQ.refetch();
    },
  });
  const cancelMut = trpc.vendorPortal.cancelOrder.useMutation({
    onSuccess: () => void ordersQ.refetch(),
  });

  const fulfill = (orderId: number) => {
    fulfillKeys.current[orderId] ??= fulfillIdempotencyKey(orderId);
    fulfillMut.mutate({ orderId, idempotencyKey: fulfillKeys.current[orderId] });
  };

  const cancel = (orderId: number) => {
    Alert.alert(
      t('mobile.vendorPortal.orders.cancelConfirm'),
      t('mobile.vendorPortal.orders.cancelConfirmBody'),
      [
        { text: t('mobile.vendorPortal.orders.keep'), style: 'cancel' },
        {
          text: t('mobile.vendorPortal.orders.cancel'),
          style: 'destructive',
          onPress: () => cancelMut.mutate({ orderId }),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: StoreOrderRow }) => {
    const tone = orderStatusTone(item.status);
    const pending = item.status === 'PENDING_FULFILLMENT';
    const total = Number(item.totalAmount); // Decimal arrives as a string
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/vendor-portal/orders/${item.id}`)}
      >
        <View style={styles.row}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <View style={styles.chips}>
            {isLate(item) ? (
              <Text style={styles.lateChip}>{t('mobile.vendorPortal.orders.late')}</Text>
            ) : null}
            <Text
              style={[styles.statusChip, { backgroundColor: TONE[tone].bg, color: TONE[tone].fg }]}
            >
              {t(TONE[tone].labelKey as TranslationKey)}
            </Text>
          </View>
        </View>
        <Text style={styles.customer}>{item.customer?.name ?? `#${item.customerId}`}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}
        </Text>
        <View style={[styles.row, styles.footer]}>
          <Text style={styles.total}>
            {t('mobile.vendorPortal.orders.total', {
              amount: total.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB'),
            })}
          </Text>
          {pending ? (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => fulfill(item.id)}
                disabled={fulfillMut.isPending || cancelMut.isPending}
                style={styles.fulfillBtn}
              >
                <Text style={styles.fulfillText}>{t('mobile.vendorPortal.orders.fulfill')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => cancel(item.id)}
                disabled={fulfillMut.isPending || cancelMut.isPending}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>{t('mobile.vendorPortal.orders.cancel')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenState
      isLoading={ordersQ.isLoading}
      isError={ordersQ.isError}
      isEmpty={!ordersQ.isLoading && orders.length === 0}
      errorMessage={t('mobile.vendorPortal.orders.error')}
      emptyTitle={t('mobile.vendorPortal.orders.empty')}
      emptyDescription={t('mobile.vendorPortal.orders.emptyDescription')}
      onRetry={() => void ordersQ.refetch()}
    >
      <Text style={styles.title}>{t('mobile.vendorPortal.orders.title')}</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={() => void ordersQ.fetchNextPage()}
        onEndReachedThreshold={0.4}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={ordersQ.isRefetching}
            onRefresh={() => void ordersQ.refetch()}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      />
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7c3aed',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 16,
  },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { fontSize: 15, fontWeight: '800', color: '#111827' },
  chips: { flexDirection: 'row', gap: 6 },
  statusChip: {
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  lateChip: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  customer: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 8 },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  footer: { marginTop: 10 },
  total: { fontSize: 14, fontWeight: '800', color: '#111827' },
  actions: { flexDirection: 'row', gap: 8 },
  fulfillBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  fulfillText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelText: { fontSize: 13, fontWeight: '700', color: '#dc2626' },
});
