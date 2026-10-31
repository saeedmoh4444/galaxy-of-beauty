import type { JSX } from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  border: '#e5e7eb',
  success: '#059669',
};

export default function DisputesScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { locale, t } = useLocale();
  const utils = trpc.useUtils();

  const statusLabels: Record<string, string> = {
    OPEN: t('disputes.status-open'),
    UNDER_REVIEW: t('disputes.status-under-review'),
    RESOLVED_CUSTOMER: t('disputes.status-resolved'),
    RESOLVED_TECHNICIAN: t('disputes.status-resolved'),
    CLOSED: t('disputes.status-closed'),
  };
  const disputes = trpc.disputes.list.useQuery({}, { enabled: isAuthed }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = disputes.data as unknown[] | undefined;

  // D2c — the "open new" button was a dead View; wire a real dispute
  // creation flow against the customer's completed bookings.
  const [formOpen, setFormOpen] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const completedBookings = trpc.bookings.list.useQuery(
    { status: 'COMPLETED', page: 1, limit: 50 },
    { enabled: isAuthed && formOpen },
  );
  const bookingsData = (completedBookings.data?.bookings ?? []) as Array<Record<string, unknown>>;

  const createMut = trpc.disputes.create.useMutation({
    onSuccess: () => {
      void utils.disputes.list.invalidate();
      setFormOpen(false);
      setBookingId(null);
      setReason('');
      setDescription('');
    },
  });

  const canSubmit = !!bookingId && reason.trim().length > 0 && !createMut.isPending;

  return (
    <ScreenState
      isLoading={disputes.isLoading}
      isError={disputes.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('disputes.load-error')}
      emptyTitle={t('disputes.empty-title')}
      emptyDescription={t('disputes.empty-desc')}
      onRetry={() => disputes.refetch()}
    >
      <Text style={styles.title}>{t('disputes.title')}</Text>
      {(data as Record<string, unknown>[])?.map((d: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.reason}>{d.reason as string}</Text>
            <Text style={styles.status}>
              {statusLabels[d.status as string] ?? (d.status as string)}
            </Text>
          </View>
          {d.resolution ? (
            <Text style={styles.resolution}>
              {t('disputes.resolution', { resolution: d.resolution as string })}
            </Text>
          ) : null}
          <Text style={styles.date}>
            {new Date(d.createdAt as string).toLocaleDateString(
              locale === 'ar' ? 'ar-SA' : 'en-US',
            )}
          </Text>
        </View>
      ))}
      <Pressable style={styles.addBtn} onPress={() => setFormOpen(true)}>
        <Text style={styles.addText}>{t('disputes.createNew')}</Text>
      </Pressable>

      <Modal
        visible={formOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFormOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('disputes.open')}</Text>
            <ScrollView style={styles.formScroll}>
              <Text style={styles.fieldLabel}>{t('disputes.bookingLabel')}</Text>
              {completedBookings.isLoading ? (
                <ActivityIndicator color={COLORS.brand} />
              ) : (
                <ScrollView
                  horizontal
                  style={styles.bookingRow}
                  contentContainerStyle={styles.bookingRowContent}
                >
                  {bookingsData.length === 0 ? (
                    <Text style={styles.hint}>{t('disputes.bookingPlaceholder')}</Text>
                  ) : (
                    bookingsData.map((b: Record<string, unknown>) => {
                      const selected = bookingId === (b.id as number);
                      return (
                        <Pressable
                          key={b.id as number}
                          style={[styles.bookingChip, selected && styles.bookingChipActive]}
                          onPress={() => setBookingId(b.id as number)}
                        >
                          <Text
                            style={[
                              styles.bookingChipText,
                              selected && styles.bookingChipTextActive,
                            ]}
                          >
                            {b.bookingCode as string}
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              )}
              <Text style={styles.fieldLabel}>{t('disputes.reasonLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('disputes.reasonPlaceholder')}
                placeholderTextColor={COLORS.gray400}
                value={reason}
                onChangeText={setReason}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder={t('disputes.descriptionPlaceholder')}
                placeholderTextColor={COLORS.gray400}
                value={description}
                onChangeText={setDescription}
                multiline
              />
              {createMut.isError ? (
                <Text style={styles.error}>{createMut.error?.message}</Text>
              ) : null}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setFormOpen(false)}>
                <Text style={styles.secondaryText}>{t('addresses.cancel')}</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
                disabled={!canSubmit}
                onPress={() =>
                  createMut.mutate({
                    bookingId: bookingId!,
                    reason: reason.trim(),
                    description: description.trim() || undefined,
                  })
                }
              >
                {createMut.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryText}>{t('disputes.submit')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reason: { fontSize: 15, fontWeight: '700', color: COLORS.gray900, flex: 1 },
  status: { fontSize: 11, color: COLORS.brand, fontWeight: '600' },
  resolution: { fontSize: 13, color: COLORS.success, marginBottom: 4 },
  date: { fontSize: 11, color: COLORS.gray400 },
  addBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
  addText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
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
    marginBottom: 12,
    textAlign: 'center',
  },
  formScroll: { maxHeight: 420 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 6,
    marginTop: 8,
  },
  bookingRow: { marginBottom: 8 },
  bookingRowContent: { gap: 8, paddingVertical: 2 },
  bookingChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  bookingChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  bookingChipText: { fontSize: 12, fontWeight: '600', color: COLORS.gray900 },
  bookingChipTextActive: { color: COLORS.white },
  hint: { fontSize: 12, color: COLORS.gray400 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray900,
    marginBottom: 10,
    minHeight: 60,
  },
  error: { color: '#dc2626', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  secondaryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  secondaryText: { color: COLORS.gray400, fontWeight: '600', fontSize: 14 },
  primaryBtn: {
    backgroundColor: COLORS.brand,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
