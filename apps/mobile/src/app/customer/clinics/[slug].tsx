import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/components/Toast';

const TREATMENT_TYPES = ['dermatology', 'laser', 'injectables', 'dental', 'nutrition'] as const;

interface ClinicDetail {
  id?: number;
  storeName?: string;
  clinicType?: string | null;
  licenseAgency?: string | null;
  licenseVerifiedAt?: string | null;
  consultationPrice?: number;
  descriptionJson?: { ar?: string; en?: string } | null;
  ratingAvg?: number;
  totalReviews?: number;
  packages?: Array<Record<string, unknown>>;
}

export default function ClinicDetailScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const isAuthed = useAuthState();
  const { showToast } = useToast();

  const detailQ = trpc.clinics.detail.useQuery({ slug: slug ?? '' });
  const slotsQ = trpc.clinics.slots.useQuery(
    {
      clinicId: (detailQ.data as unknown as ClinicDetail | null)?.id ?? 0,
      from: new Date().toISOString(),
      to: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    },
    { enabled: !!detailQ.data },
  );
  const bookMut = trpc.clinics.book.useMutation({
    onSuccess: () => {
      showToast('success', t('mobile.clinics.booked'));
      setBookingSlot(null);
      setConsent(false);
      slotsQ.refetch();
    },
    onError: (e) => showToast('error', e.message),
  });

  const [bookingSlot, setBookingSlot] = useState<Record<string, unknown> | null>(null);
  const [treatmentType, setTreatmentType] = useState('dermatology');
  const [consent, setConsent] = useState(false);

  const clinic = detailQ.data as unknown as ClinicDetail | null;
  const slots = (slotsQ.data as Array<Record<string, unknown>> | undefined) ?? [];
  const packages = clinic?.packages ?? [];

  if (detailQ.isLoading) return <SkeletonList count={4} />;
  if (detailQ.isError || !clinic)
    return <ErrorAlert message={t('mobile.clinics.not-found')} onRetry={() => detailQ.refetch()} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={detailQ.isRefetching} onRefresh={() => detailQ.refetch()} />
      }
    >
      <Text style={s.name}>{clinic.storeName}</Text>
      <Text style={s.meta}>
        {t(`clinics.treatment.${clinic.clinicType ?? ''}` as never)} ·{' '}
        {t('mobile.clinics.price', { price: Number(clinic.consultationPrice ?? 0) })}
      </Text>
      {clinic.licenseVerifiedAt ? (
        <Text style={s.badge}>
          {t('mobile.clinics.verified')} · {clinic.licenseAgency ?? ''}
        </Text>
      ) : null}
      {clinic.descriptionJson?.[locale] ? (
        <Text style={s.bio}>{clinic.descriptionJson[locale]}</Text>
      ) : null}

      {/* Open slots */}
      <Text style={s.section}>{t('mobile.clinics.slots')}</Text>
      {slots.length === 0 ? (
        <Text style={s.empty}>{t('mobile.clinics.no-slots')}</Text>
      ) : (
        slots.map((slot) => (
          <View key={slot.id as number} style={s.slotRow}>
            <Text style={s.slotText}>
              {new Date(slot.startAt as string).toLocaleDateString('ar-SA')} ·{' '}
              {new Date(slot.startAt as string).toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <TouchableOpacity
              style={s.bookBtn}
              onPress={() => {
                if (!isAuthed) {
                  showToast('warning', t('mobile.clinics.login-to-book'));
                  return;
                }
                setBookingSlot(slot);
              }}
            >
              <Text style={s.bookText}>{t('mobile.clinics.book')}</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Booking form (inline) */}
      {bookingSlot && (
        <View style={s.bookForm}>
          <Text style={s.section}>{t('mobile.clinics.book')}</Text>
          <Text style={s.meta}>
            {new Date(bookingSlot.startAt as string).toLocaleString('ar-SA')}
          </Text>
          <View style={s.typeRow}>
            {TREATMENT_TYPES.map((tt) => (
              <TouchableOpacity
                key={tt}
                style={[s.typeChip, treatmentType === tt && s.typeChipActive]}
                onPress={() => setTreatmentType(tt)}
              >
                <Text style={[s.typeText, treatmentType === tt && s.typeTextActive]}>
                  {t(`clinics.treatment.${tt}` as never)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.consentRow}>
            <Switch value={consent} onValueChange={setConsent} />
            <Text style={s.consentText}>{t('mobile.clinics.consent')}</Text>
          </View>
          <TouchableOpacity
            style={[s.confirmBtn, !consent && s.confirmDisabled]}
            disabled={!consent || bookMut.isPending}
            onPress={() =>
              bookMut.mutate({
                slotId: bookingSlot.id as number,
                treatmentType: treatmentType as never,
                consent: true,
              })
            }
          >
            <Text style={s.bookText}>{bookMut.isPending ? '…' : t('mobile.clinics.confirm')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Treatment packages */}
      <Text style={s.section}>{t('mobile.clinics.packages')}</Text>
      {packages.length === 0 ? (
        <Text style={s.empty}>{t('mobile.clinics.packages')} — 0</Text>
      ) : (
        packages.map((p) => (
          <View key={p.id as number} style={s.pkgCard}>
            <Text style={s.pkgName}>{localize(p.nameJson, locale)}</Text>
            <Text style={s.meta}>{localize(p.descriptionJson, locale)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  bio: { fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 20 },
  badge: {
    fontSize: 11,
    color: '#047857',
    backgroundColor: '#d1fae5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 6,
    overflow: 'hidden',
  },
  section: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 8 },
  empty: { color: '#9ca3af', fontSize: 13 },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  slotText: { fontSize: 13, color: '#111827', fontWeight: '600' },
  bookBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bookText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  bookForm: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  typeChip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeChipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  typeText: { fontSize: 12, color: '#111827' },
  typeTextActive: { color: '#fff' },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  consentText: { flex: 1, fontSize: 12, color: '#6b7280' },
  confirmBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmDisabled: { opacity: 0.5 },
  pkgCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  pkgName: { fontSize: 14, fontWeight: '700', color: '#111827' },
});
