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
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  border: '#e5e7eb',
};

export default function CustomerProfileScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const utils = trpc.useUtils();
  const user = trpc.users.getMe.useQuery(undefined, { enabled: isAuthed });
  const data = user.data as Record<string, unknown> | undefined;

  // D2 — the Edit button was a dead View; wire name/phone editing.
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const updateMut = trpc.users.updateMe.useMutation({
    onSuccess: () => {
      void utils.users.getMe.invalidate();
      setEditOpen(false);
    },
  });

  const openEdit = () => {
    setName((data?.name as string) ?? '');
    setPhone((data?.phone as string) ?? '');
    setEditOpen(true);
  };

  const canSave = name.trim().length >= 2;

  return (
    <ScreenState
      isLoading={user.isLoading}
      isError={user.isError}
      isEmpty={!data}
      errorMessage={t('mobile.profile.load-error')}
      onRetry={() => user.refetch()}
    >
      <Text style={styles.title}>{t('mobile.profile.title')}</Text>
      {(data
        ? [
            { label: t('mobile.profile.name'), value: data.name as string },
            { label: t('mobile.profile.email'), value: data.email as string },
            { label: t('mobile.profile.phone'), value: data.phone as string },
            {
              label: t('mobile.profile.role'),
              value:
                (data.role as string) === 'CUSTOMER'
                  ? t('mobile.profile.role-customer')
                  : (data.role as string) === 'TECHNICIAN'
                    ? t('mobile.profile.role-technician')
                    : t('mobile.profile.role-supervisor'),
            },
            {
              label: t('mobile.profile.language'),
              value:
                (data.preferredLanguage as string) === 'ar'
                  ? t('mobile.profile.lang-ar')
                  : 'English',
            },
          ]
        : []
      ).map((row, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value ?? '—'}</Text>
        </View>
      ))}
      <Pressable style={styles.editBtn} onPress={openEdit}>
        <Text style={styles.editText}>{t('mobile.profile.edit')}</Text>
      </Pressable>

      <Modal
        visible={editOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('mobile.profile.edit')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('mobile.profile.name')}
              placeholderTextColor={COLORS.gray400}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder={t('mobile.profile.phone')}
              placeholderTextColor={COLORS.gray400}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            {updateMut.isError ? (
              <Text style={styles.error}>{updateMut.error?.message}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={() => setEditOpen(false)}>
                <Text style={styles.secondaryText}>{t('addresses.cancel')}</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, !canSave && styles.primaryBtnDisabled]}
                disabled={!canSave || updateMut.isPending}
                onPress={() =>
                  updateMut.mutate({ name: name.trim(), phone: phone.trim() || undefined })
                }
              >
                {updateMut.isPending ? (
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 14, color: COLORS.gray400 },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  editBtn: { marginTop: 24, alignItems: 'center', padding: 16 },
  editText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
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
