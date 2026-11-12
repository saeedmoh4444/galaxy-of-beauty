import type { JSX } from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { ScreenState } from '@/components/ScreenState';
import { NpsCard } from '@/components/NpsCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { formatCurrency } from '@galaxy/ui';
const SC: Record<string, { color: string; bg: string }> = {
  REQUESTED: { color: '#d97706', bg: '#fef3c7' },
  ACCEPTED: { color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { color: '#059669', bg: '#dcfce7' },
  CANCELLED: { color: '#dc2626', bg: '#fee2e2' },
  REJECTED: { color: '#dc2626', bg: '#fee2e2' },
  NO_SHOW: { color: '#6b7280', bg: '#f3f4f6' },
  PAID: { color: '#7c3aed', bg: '#ede9fe' },
  IN_PROGRESS: { color: '#7c3aed', bg: '#ede9fe' },
};
const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function BookingDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const detail = trpc.bookings.getById.useQuery({ id: Number(id) }, { enabled: !!id }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = detail.data as Record<string, unknown> | undefined;

  const utils = trpc.useUtils();

  // D2 — customer cancellation via the shared state machine (the API
  // supports it; the screen never exposed it).
  const cancelMut = trpc.bookings.transition.useMutation({
    onSuccess: () => {
      void utils.bookings.getById.invalidate({ id: Number(id) });
      void utils.bookings.list.invalidate();
    },
  });

  // W2-3 (audit 2026-11-11): the booking→payment path was missing on
  // mobile too — pay on ACCEPTED (online invoice or cash-on-arrival).
  const paymentQ = trpc.payments.getByBooking.useQuery({ bookingId: Number(id) });
  const payment = paymentQ.data as { status?: string } | undefined;

  // v4 uuid (no crypto module on RN — Math.random entropy is fine for
  // client idempotency keys).
  const randomUuid = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  const payMut = trpc.payments.authorize.useMutation({
    onSuccess: (result) => {
      void utils.bookings.getById.invalidate({ id: Number(id) });
      void utils.bookings.list.invalidate();
      void utils.payments.getByBooking.invalidate({ bookingId: Number(id) });
      const url = (result as { invoiceURL?: string } | null)?.invoiceURL;
      if (url) {
        void Linking.openURL(url).catch(() => {});
      }
    },
  });

  // D2b — review creation on completed bookings (the screen had NPS only).
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const reviewMut = trpc.reviews.create.useMutation({
    onSuccess: () => {
      void utils.reviews.list.invalidate();
      void utils.bookings.getById.invalidate({ id: Number(id) });
      setComment('');
    },
  });

  const statusLabels: Record<string, string> = {
    REQUESTED: t('booking.status.REQUESTED'),
    ACCEPTED: t('booking.status.ACCEPTED'),
    PAID: t('booking.status.PAID'),
    IN_PROGRESS: t('booking.status.IN_PROGRESS'),
    COMPLETED: t('booking.status.COMPLETED'),
    REJECTED: t('booking.status.REJECTED'),
    CANCELLED: t('booking.status.CANCELLED'),
    NO_SHOW: t('booking.status.NO_SHOW'),
  };

  return (
    <ScreenState
      isLoading={detail.isLoading}
      isError={detail.isError}
      isEmpty={!data}
      errorMessage={t('booking.detail-error')}
      onRetry={() => detail.refetch()}
    >
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.title}>{t('booking.details')}</Text>
        {(data
          ? [
              { label: t('bookings.detail.booking-code'), value: data.bookingCode as string },
              {
                label: t('booking.status-label'),
                value: statusLabels[data.status as string] ?? (data.status as string),
                color: SC[data.status as string]?.color,
              },
              {
                label: t('booking.date'),
                value: new Date(data.startAt as string).toLocaleString(
                  locale === 'ar' ? 'ar-SA' : 'en-GB',
                ),
              },
              { label: t('booking.amount'), value: formatCurrency(Number(data.totalAmount ?? 0)) },
              {
                label: t('bookings.detail.technician-id'),
                value: `#${data.technicianId as number}`,
              },
            ]
          : []
        ).map((row, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={[styles.value, row.color ? { color: row.color } : {}]}>{row.value}</Text>
          </View>
        ))}
        {['PENDING', 'ACCEPTED', 'PAID', 'REQUESTED', 'IN_PROGRESS'].includes(
          data?.status as string,
        ) && (
          <TouchableOpacity
            style={styles.rescheduleBtn}
            onPress={() => router.push('/customer/bookings/reschedule')}
            activeOpacity={0.7}
          >
            <Text style={styles.rescheduleText}>{t('mobile.reschedule.title')}</Text>
          </TouchableOpacity>
        )}
        {/* W2-3 — payment actions on ACCEPTED. */}
        {data?.status === 'ACCEPTED' && (!payment || payment.status !== 'CAPTURED') && (
          <View style={styles.payBox}>
            {payment?.status === 'AUTHORIZED' && (
              <Text style={styles.payHint}>{t('booking.payment.authorized-waiting-capture')}</Text>
            )}
            {payMut.isError && <Text style={styles.payError}>{t('booking.payment.error')}</Text>}
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() =>
                payMut.mutate({
                  bookingId: Number(id),
                  idempotencyKey: randomUuid(),
                  method: 'online',
                })
              }
              disabled={payMut.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.payBtnText}>{t('booking.payment.online-label')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.payCashBtn}
              onPress={() =>
                payMut.mutate({
                  bookingId: Number(id),
                  idempotencyKey: randomUuid(),
                  method: 'cash',
                })
              }
              disabled={payMut.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.payCashText}>{t('booking.payment.venue-label')}</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* D2 — cancel was missing entirely from the app despite API support.
            Cancelable states only (REQUESTED/ACCEPTED/PAID/CONFIRMED_OFFLINE). */}
        {['REQUESTED', 'ACCEPTED', 'PAID', 'CONFIRMED_OFFLINE'].includes(
          data?.status as string,
        ) && (
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={() => {
              cancelMut.mutate({ id: Number(id), action: 'cancel' });
            }}
          >
            {cancelMut.isPending ? (
              <ActivityIndicator color={COLORS.brand} />
            ) : (
              <Text style={styles.cancelText}>{t('booking.status.CANCELLED')}</Text>
            )}
          </TouchableOpacity>
        )}
        {data?.status === 'COMPLETED' && <NpsCard bookingId={Number(data.id)} />}
        {/* D2b — review creation was missing from the app entirely. */}
        {data?.status === 'COMPLETED' && (
          <TouchableOpacity
            style={styles.reviewBtn}
            activeOpacity={0.7}
            onPress={() => setReviewOpen(true)}
          >
            <Text style={styles.reviewText}>{t('mobile.reviews.write')}</Text>
          </TouchableOpacity>
        )}
        <Modal
          visible={reviewOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setReviewOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t('mobile.reviews.write')}</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7}>
                    <Text style={[styles.starGlyph, n <= rating ? styles.starActive : null]}>
                      {n <= rating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder={t('mobile.reviews.comment-placeholder')}
                placeholderTextColor="#6b7280"
                value={comment}
                onChangeText={setComment}
                multiline
              />
              {reviewMut.isError ? (
                <Text style={styles.error}>{reviewMut.error?.message}</Text>
              ) : null}
              {reviewMut.isSuccess ? (
                <Text style={styles.successText}>{t('mobile.reviews.submitted')}</Text>
              ) : null}
              <View style={styles.modalActions}>
                <Pressable style={styles.secondaryBtn} onPress={() => setReviewOpen(false)}>
                  <Text style={styles.secondaryText}>{t('addresses.cancel')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.primaryBtn, rating < 1 && styles.primaryBtnDisabled]}
                  disabled={rating < 1 || reviewMut.isPending}
                  onPress={() =>
                    reviewMut.mutate({
                      bookingId: Number(id),
                      rating,
                      comment: comment.trim() || undefined,
                    })
                  }
                >
                  {reviewMut.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryText}>{t('addresses.save')}</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  payBox: { marginTop: 12, gap: 8 },
  payHint: { fontSize: 13, color: '#1d4ed8', textAlign: 'right' },
  payError: { fontSize: 13, color: '#b91c1c', textAlign: 'right' },
  payBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  payCashBtn: {
    borderWidth: 1,
    borderColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  payCashText: { color: '#7c3aed', fontWeight: '600', fontSize: 15 },
  c: { flex: 1 },
  i: { padding: 16 },
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 14, color: COLORS.gray400 },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  rescheduleBtn: {
    marginTop: 20,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rescheduleText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: COLORS.brand, fontSize: 15, fontWeight: '700' },
  reviewBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reviewText: { color: COLORS.brand, fontSize: 15, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray900,
    marginBottom: 16,
    textAlign: 'center',
  },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 14 },
  starGlyph: { fontSize: 32, color: '#d1d5db' },
  starActive: { color: '#f59e0b' },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray900,
    marginBottom: 10,
    minHeight: 70,
  },
  error: { color: '#dc2626', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  successText: { color: '#059669', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  secondaryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  secondaryText: { color: COLORS.gray400, fontWeight: '600', fontSize: 14 },
  primaryBtn: {
    backgroundColor: COLORS.brand,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
