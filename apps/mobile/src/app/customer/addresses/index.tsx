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
} from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  border: '#e5e7eb',
};

export default function AddressesScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const utils = trpc.useUtils();

  const addresses = trpc.addresses.list.useQuery(undefined, { enabled: isAuthed });
  const data = addresses.data as unknown[] | undefined;

  // ── Add-address form (audit D2 — the screen was read-only, which
  // blocked new users from ever booking) ──
  const [formOpen, setFormOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [justCreated, setJustCreated] = useState(false);

  const createMut = trpc.addresses.create.useMutation({
    onSuccess: () => {
      void utils.addresses.list.invalidate();
      setFormOpen(false);
      setLabel('');
      setCity('');
      setArea('');
      setStreet('');
      setJustCreated(true);
      setTimeout(() => setJustCreated(false), 2500);
    },
  });

  const canSave =
    label.trim().length > 0 &&
    city.trim().length > 0 &&
    area.trim().length > 0 &&
    street.trim().length > 0;

  return (
    <ScreenState
      isLoading={addresses.isLoading}
      isError={addresses.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('profile.addresses-load-error')}
      emptyTitle={t('addresses.empty-title')}
      emptyDescription={t('addresses.empty-desc')}
      onRetry={() => addresses.refetch()}
    >
      <Text style={styles.title}>{t('addresses.title')}</Text>
      {(data as Record<string, unknown>[])?.map((a: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{a.label as string}</Text>
            {a.isDefault ? <Text style={styles.defaultBadge}>{t('profile.default')}</Text> : null}
          </View>
          <Text style={styles.detail}>
            {[a.street as string, a.area as string, a.city as string].join(
              `${t('mobile.addresses.separator')} `,
            )}
          </Text>
        </View>
      ))}
      <Pressable style={styles.addBtn} onPress={() => setFormOpen(true)}>
        {justCreated ? (
          <Text style={styles.addText}>{t('addresses.created')}</Text>
        ) : (
          <Text style={styles.addText}>{t('addresses.add-new')}</Text>
        )}
      </Pressable>

      <Modal
        visible={formOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFormOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('addresses.add-new')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('addresses.form-label')}
              placeholderTextColor={COLORS.gray400}
              value={label}
              onChangeText={setLabel}
            />
            <TextInput
              style={styles.input}
              placeholder={t('addresses.form-city')}
              placeholderTextColor={COLORS.gray400}
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={styles.input}
              placeholder={t('addresses.form-area')}
              placeholderTextColor={COLORS.gray400}
              value={area}
              onChangeText={setArea}
            />
            <TextInput
              style={styles.input}
              placeholder={t('addresses.form-street')}
              placeholderTextColor={COLORS.gray400}
              value={street}
              onChangeText={setStreet}
            />
            {createMut.isError ? (
              <Text style={styles.error}>{createMut.error?.message ?? t('addresses.add-new')}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setFormOpen(false)}>
                <Text style={styles.secondaryText}>{t('addresses.cancel')}</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, !canSave && styles.primaryBtnDisabled]}
                disabled={!canSave || createMut.isPending}
                onPress={() =>
                  createMut.mutate({
                    label: label.trim(),
                    city: city.trim(),
                    area: area.trim(),
                    street: street.trim(),
                  })
                }
              >
                {createMut.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryText}>{t('addresses.save')}</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  defaultBadge: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
  detail: { fontSize: 13, color: COLORS.gray400 },
  addBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
  addText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray900,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray900,
    marginBottom: 10,
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
    minWidth: 80,
    alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
