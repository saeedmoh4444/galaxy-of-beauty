import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  border: '#e5e7eb',
};

export default function TechProfileScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const profileQ = trpc.users.getMe.useQuery(undefined, { enabled: isAuthed });
  const updateProfileMut = trpc.technicians.updateProfile.useMutation({
    onSuccess: () => {
      setEditing(false);
      profileQ.refetch();
    },
  });

  const me = profileQ.data as unknown as Record<string, unknown> | undefined;
  const tech = (me?.technician ?? {}) as Record<string, unknown>;
  const bio = (tech.bioJson ?? {}) as Record<string, string>;

  // B.8a: real edit form (the button used to be a no-op).
  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [bufferMinutes, setBufferMinutes] = useState('');
  const [isEcoFriendly, setIsEcoFriendly] = useState(false);

  const startEditing = () => {
    setCity((tech.city as string) ?? '');
    setArea((tech.area as string) ?? '');
    setBioAr(bio['ar'] ?? '');
    setBioEn(bio['en'] ?? '');
    setBufferMinutes(String((tech.bufferMinutes as number) ?? 15));
    setIsEcoFriendly((tech.isEcoFriendly as boolean) ?? false);
    setEditing(true);
  };

  const save = () => {
    const buf = Number(bufferMinutes);
    updateProfileMut.mutate({
      city: city || undefined,
      area: area || undefined,
      bioAr: bioAr || undefined,
      bioEn: bioEn || undefined,
      bufferMinutes: Number.isFinite(buf) ? buf : undefined,
      isEcoFriendly,
    });
  };

  const bioText = locale === 'en' ? bio['en'] : bio['ar'];

  return (
    <ScreenState
      isLoading={profileQ.isLoading}
      isError={profileQ.isError}
      isEmpty={!me}
      errorMessage={t('tech.profile.load-error')}
      onRetry={() => profileQ.refetch()}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('mobile.tech.profile.title')}</Text>

        {!editing ? (
          <>
            {(
              [
                { label: t('tech.profile.phone'), value: me?.phone as string },
                { label: t('tech.profile.city'), value: tech.city as string },
                { label: t('tech.profile.area'), value: (tech.area as string) ?? '—' },
                {
                  label: t('tech.profile.rating'),
                  value: `${String((tech.ratingAvg as number) ?? 0)}`,
                },
                {
                  label: t('tech.profile.total-reviews'),
                  value: String((tech.totalReviews as number) ?? 0),
                },
                {
                  label: t('mobile.tech.profile.completed-bookings'),
                  value: String((tech.completedBookings as number) ?? 0),
                },
                { label: t('tech.dashboard.kyc-status'), value: tech.kycStatus as string },
                {
                  label: t('mobile.tech.profile.eco-friendly-products'),
                  value: (tech.isEcoFriendly as boolean)
                    ? t('mobile.tech.profile.yes')
                    : t('mobile.tech.profile.no'),
                },
                {
                  label: t('tech.profile.buffer-minutes'),
                  value: String((tech.bufferMinutes as number) ?? 15),
                },
              ] as Array<{ label: string; value: string }>
            ).map((row, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value}>{row.value || '—'}</Text>
              </View>
            ))}

            {bioText ? (
              <View style={styles.bioBox}>
                <Text style={styles.label}>{t('mobile.tech.profile.bio')}</Text>
                <Text style={styles.bioText}>{bioText}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.editBtn} onPress={startEditing}>
              <Text style={styles.editText}>{t('mobile.tech.profile.edit-profile')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.form}>
            {updateProfileMut.isError && (
              <Text style={styles.error}>{updateProfileMut.error.message}</Text>
            )}
            <Text style={styles.fieldLabel}>{t('tech.profile.city')}</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} />
            <Text style={styles.fieldLabel}>{t('tech.profile.area')}</Text>
            <TextInput style={styles.input} value={area} onChangeText={setArea} />
            <Text style={styles.fieldLabel}>{t('tech.profile.bio-ar')}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={bioAr}
              onChangeText={setBioAr}
              multiline
            />
            <Text style={styles.fieldLabel}>{t('tech.profile.bio-en')}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={bioEn}
              onChangeText={setBioEn}
              multiline
            />
            <Text style={styles.fieldLabel}>{t('tech.profile.buffer-minutes')}</Text>
            <TextInput
              style={styles.input}
              value={bufferMinutes}
              onChangeText={setBufferMinutes}
              keyboardType="number-pad"
            />
            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>{t('tech.profile.eco-friendly')}</Text>
              <Switch value={isEcoFriendly} onValueChange={setIsEcoFriendly} />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, updateProfileMut.isPending && styles.btnDisabled]}
              onPress={save}
              disabled={updateProfileMut.isPending}
            >
              <Text style={styles.saveText}>
                {updateProfileMut.isPending
                  ? t('mobile.tech.profile.saving')
                  : t('tech.profile.save-changes')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditing(false)}
              disabled={updateProfileMut.isPending}
            >
              <Text style={styles.cancelText}>{t('mobile.tech.profile.cancel')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
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
  bioBox: { marginTop: 16, backgroundColor: '#faf5ff', borderRadius: 12, padding: 14 },
  bioText: { marginTop: 6, fontSize: 13, color: COLORS.gray900, lineHeight: 20 },
  editBtn: { marginTop: 24, alignItems: 'center', padding: 16 },
  editText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
  form: { marginTop: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray900, marginTop: 12 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  saveBtn: {
    marginTop: 24,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  cancelBtn: { marginTop: 10, padding: 12, alignItems: 'center' },
  cancelText: { color: COLORS.gray400, fontSize: 14 },
});
