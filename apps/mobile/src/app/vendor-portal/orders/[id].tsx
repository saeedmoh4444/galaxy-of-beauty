import type { JSX } from 'react';
import { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared/i18n-mobile';
import { orderStatusTone, isLate, fulfillIdempotencyKey, waLink } from '@/utils/vendorOrders';
import type { OrderStatusTone } from '@/utils/vendorOrders';

const TONE: Record<OrderStatusTone, { bg: string; fg: string; labelKey: string }> = {
  fulfilled: { bg: '#ecfdf5', fg: '#059669', labelKey: 'mobile.vendorPortal.orders.fulfilled' },
  cancelled: { bg: '#fef2f2', fg: '#dc2626', labelKey: 'mobile.vendorPortal.orders.cancelled' },
  pending: { bg: '#fffbeb', fg: '#d97706', labelKey: 'mobile.vendorPortal.orders.pending' },
};

/** E2b — order detail: line items, customer contact, dispute (1:1) and the
 *  fulfill/cancel actions. The push deep link (/vendor-portal/orders/:id)
 *  lands here via the orderDetail procedure (web reuses the list row). */
export default function VendorOrderDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const { t, locale } = useLocale();
  const router = useRouter();
  const isAuthed = useAuthState();

  const q = trpc.vendorPortal.orderDetail.useQuery(
    { orderId },
    { enabled: isAuthed && Number.isInteger(orderId) && orderId > 0 },
  );
  const order = q.data;

  // H0 — same per-order idempotency-key contract as the list screen.
  const fulfillKeys = useRef<Record<number, string>>({});
  const fulfillMut = trpc.vendorPortal.fulfillOrder.useMutation({
    onSuccess: (_data, vars) => {
      delete fulfillKeys.current[vars.orderId];
      void q.refetch();
    },
  });
  const cancelMut = trpc.vendorPortal.cancelOrder.useMutation({
    onSuccess: () => void q.refetch(),
  });

  const fulfill = () => {
    if (!order) return;
    fulfillKeys.current[order.id] ??= fulfillIdempotencyKey(order.id);
    fulfillMut.mutate({ orderId: order.id, idempotencyKey: fulfillKeys.current[order.id] });
  };

  const cancel = () => {
    if (!order) return;
    Alert.alert(
      t('mobile.vendorPortal.orders.cancelConfirm'),
      t('mobile.vendorPortal.orders.cancelConfirmBody'),
      [
        { text: t('mobile.vendorPortal.orders.keep'), style: 'cancel' },
        {
          text: t('mobile.vendorPortal.orders.cancel'),
          style: 'destructive',
          onPress: () => cancelMut.mutate({ orderId: order.id }),
        },
      ],
    );
  };

  const tone = order ? orderStatusTone(order.status) : 'pending';
  const pending = order?.status === 'PENDING_FULFILLMENT';
  const total = order ? Number(order.totalAmount) : 0;

  return (
    <ScreenState
      isLoading={q.isLoading}
      isError={q.isError}
      isEmpty={false}
      errorMessage={t('mobile.vendorPortal.orderDetail.loadError')}
      onRetry={() => void q.refetch()}
    >
      <ScrollView
        style={styles.c}
        contentContainerStyle={styles.i}
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching}
            onRefresh={() => void q.refetch()}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backText}>{t('mobile.vendorPortal.orderDetail.back')}</Text>
        </TouchableOpacity>
        {order ? (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.title}>
                {t('mobile.vendorPortal.orderDetail.title', { id: String(order.id) })}
              </Text>
              <View style={styles.chips}>
                {isLate(order) ? (
                  <Text style={styles.lateChip}>{t('mobile.vendorPortal.orders.late')}</Text>
                ) : null}
                <Text
                  style={[
                    styles.statusChip,
                    { backgroundColor: TONE[tone].bg, color: TONE[tone].fg },
                  ]}
                >
                  {t(TONE[tone].labelKey as TranslationKey)}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>
              {new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}
            </Text>

            <View style={styles.card}>
              <Text style={styles.section}>{t('mobile.vendorPortal.orderDetail.items')}</Text>
              {order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {(item.nameSnapshot as { ar?: string; en?: string } | null)?.[
                      locale === 'ar' ? 'ar' : 'en'
                    ] ?? `#${item.productId}`}
                  </Text>
                  <Text style={styles.itemQty}>
                    {Number(item.priceSnapshot).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}{' '}
                    × {item.quantity}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('mobile.vendorPortal.orders.title')}</Text>
                <Text style={styles.total}>
                  {t('mobile.vendorPortal.orders.total', {
                    amount: total.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB'),
                  })}
                </Text>
              </View>
            </View>

            {order.customer ? (
              <View style={styles.card}>
                <Text style={styles.section}>{t('mobile.vendorPortal.orderDetail.customer')}</Text>
                <Text style={styles.customerName}>
                  {order.customer.name ?? `#${order.customer.id}`}
                </Text>
                {order.customer.phone ? (
                  <TouchableOpacity
                    style={styles.waBtn}
                    onPress={() => void Linking.openURL(waLink(order.customer!.phone!))}
                  >
                    <Text style={styles.waText}>
                      {t('mobile.vendorPortal.orderDetail.contact')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {order.dispute ? (
              <View style={styles.disputeCard}>
                <Text style={styles.disputeTitle}>
                  {t('mobile.vendorPortal.orderDetail.dispute')}
                </Text>
                <Text style={styles.disputeLabel}>
                  {t('mobile.vendorPortal.orderDetail.disputeReason')}
                </Text>
                <Text style={styles.disputeReason}>{order.dispute.reason}</Text>
                {order.dispute.description ? (
                  <Text style={styles.disputeDescription}>{order.dispute.description}</Text>
                ) : null}
                <Text style={styles.disputeStatus}>{order.dispute.status}</Text>
              </View>
            ) : null}

            {pending ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={fulfill}
                  disabled={fulfillMut.isPending || cancelMut.isPending}
                  style={styles.fulfillBtn}
                >
                  <Text style={styles.fulfillText}>{t('mobile.vendorPortal.orders.fulfill')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={cancel}
                  disabled={fulfillMut.isPending || cancelMut.isPending}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>{t('mobile.vendorPortal.orders.cancel')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  backRow: { marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
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
  date: { fontSize: 11, color: '#9ca3af', marginTop: 4, marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  section: { fontSize: 13, fontWeight: '800', color: '#6b7280', marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { flex: 1, fontSize: 14, color: '#111827' },
  itemQty: { fontSize: 13, color: '#6b7280' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  total: { fontSize: 14, fontWeight: '800', color: '#111827' },
  customerName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  waBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  waText: { fontSize: 13, fontWeight: '700', color: '#059669' },
  disputeCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  disputeTitle: { fontSize: 13, fontWeight: '800', color: '#d97706', marginBottom: 6 },
  disputeLabel: { fontSize: 11, color: '#9ca3af' },
  disputeReason: { fontSize: 14, color: '#111827', marginTop: 2 },
  disputeDescription: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  disputeStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d97706',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actions: { flexDirection: 'row', gap: 10 },
  fulfillBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  fulfillText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
});
