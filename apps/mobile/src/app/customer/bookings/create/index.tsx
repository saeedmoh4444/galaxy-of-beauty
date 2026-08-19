import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useState } from 'react';
import { MAX_LIST_SIZE } from '@galaxy/ui';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/Toast';

interface ServiceListItem {
  id?: number;
  titleJson?: { ar?: string; en?: string };
  basePrice?: number;
  durationMin?: number;
}

interface TechnicianService {
  technician?: { userId?: number };
}

interface ServiceVariant {
  id?: number;
  nameJson?: { ar?: string; en?: string };
}

interface ServiceDetail extends ServiceListItem {
  technicianServices?: TechnicianService[];
  variants?: ServiceVariant[];
}

interface AddressItem {
  id?: number;
  label?: string;
  city?: string;
}

export default function CreateBookingScreen() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<number | undefined>();
  const [variantId, setVariantId] = useState<number | undefined>();
  const [addressId, setAddressId] = useState<number | undefined>();
  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');

  const servicesQ = trpc.services.list.useQuery({ page: 1, limit: MAX_LIST_SIZE });
  const addressesQ = trpc.addresses.list.useQuery();
  const svcQ = trpc.services.getById.useQuery({ id: serviceId! }, { enabled: !!serviceId });

  const services: ServiceListItem[] =
    (servicesQ.data as unknown as { items?: ServiceListItem[] })?.items ?? [];
  const svc: ServiceDetail | null = svcQ.data as unknown as ServiceDetail | null;
  const addresses: AddressItem[] = (addressesQ.data as AddressItem[] | undefined) ?? [];
  const loading = servicesQ.isLoading || addressesQ.isLoading;

  const createMut = trpc.bookings.create.useMutation({
    onSuccess: () => {
      showToast('success', t('booking.created-success'));
      setTimeout(() => router.back(), 1000);
    },
    onError: () => {
      showToast('error', t('booking.create-failed'));
    },
  });

  const handleSubmit = () => {
    if (!serviceId || !addressId) {
      showToast('warning', t('booking.select-service-address'));
      return;
    }
    // Auto-assign first available technician for this service
    const techs = svc?.technicianServices ?? [];
    const technicianId = techs[0]?.technician?.userId ?? 0;
    if (!technicianId) {
      showToast('warning', t('booking.no-technicians'));
      return;
    }

    createMut.mutate({
      serviceId,
      variantId,
      addressId,
      technicianId,
      idempotencyKey: `mob_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      notes: notes || undefined,
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 86400000 + (svc?.durationMin ?? 60) * 60000).toISOString(),
    });
  };

  const variants = svc?.variants ?? [];

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>{t('booking.new-booking')}</Text>

      {/* Steps indicator */}
      <View style={styles.steps}>
        {[t('booking.service'), t('booking.step-details'), t('booking.step-confirm')].map(
          (label, i) => (
            <View key={i} style={styles.stepRow}>
              <View
                style={[
                  styles.stepCircle,
                  step > i + 1
                    ? styles.stepDone
                    : step === i + 1
                      ? styles.stepActive
                      : styles.stepInactive,
                ]}
              >
                <Text style={[styles.stepNum, step === i + 1 && { color: '#fff' }]}>
                  {step > i + 1 ? '' : i + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  step === i + 1 && { color: '#7c3aed', fontWeight: '700' },
                ]}
              >
                {label}
              </Text>
              {i < 2 && <Text style={styles.stepArrow}>→</Text>}
            </View>
          ),
        )}
      </View>

      {step === 1 && (
        <View>
          <Text style={styles.sectionTitle}>{t('booking.choose-service')}</Text>
          {services.map((s, i) => (
            <TouchableOpacity
              key={s.id ?? i}
              style={[styles.serviceCard, serviceId === s.id && styles.serviceCardActive]}
              onPress={() => {
                setServiceId(s.id);
                setStep(2);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.serviceName}>{localize(s.titleJson, locale)}</Text>
              <Text style={styles.serviceMeta}>
                {t('bookings.create.service-meta', {
                  price: Number(s.basePrice).toFixed(0),
                  duration: s.durationMin ?? '',
                })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 2 && svc && (
        <View>
          <Text style={styles.sectionTitle}>{t('booking.details')}</Text>
          <Text style={styles.selectedService}>{localize(svc.titleJson, locale)}</Text>

          {variants.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>{t('bookings.create.variant-label')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, !variantId && styles.chipActive]}
                  onPress={() => setVariantId(undefined)}
                >
                  <Text style={[styles.chipText, !variantId && { color: '#fff' }]}>
                    {t('bookings.create.variant-basic')}
                  </Text>
                </TouchableOpacity>
                {variants.map((v, i) => (
                  <TouchableOpacity
                    key={v.id ?? i}
                    style={[styles.chip, variantId === v.id && styles.chipActive]}
                    onPress={() => setVariantId(v.id)}
                  >
                    <Text style={[styles.chipText, variantId === v.id && { color: '#fff' }]}>
                      {localize(v.nameJson, locale)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>{t('bookings.create.address-label')}</Text>
            {addresses.map((a, i) => (
              <TouchableOpacity
                key={a.id ?? i}
                style={[styles.optionCard, addressId === a.id && styles.optionCardActive]}
                onPress={() => setAddressId(a.id)}
              >
                <Text style={styles.optionText}>
                  {a.label} — {a.city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('mobile.promo')}</Text>
            <TextInput
              style={styles.input}
              value={promoCode}
              onChangeText={(t) => setPromoCode(t.toUpperCase())}
              placeholder={t('booking.promo-example')}
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('booking.notes')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('booking.notes-placeholder')}
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backText}>{t('booking.previous')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
              <Text style={styles.nextText}>{t('button.next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && svc && (
        <View>
          <Text style={styles.sectionTitle}>{t('booking.confirm')}</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('booking.service')}</Text>
              <Text style={styles.summaryValue}>{localize(svc.titleJson, locale)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('booking.price')}</Text>
              <Text style={styles.summaryPrice}>
                {Number(svc.basePrice).toFixed(0)} {t('misc.sar')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('booking.duration')}</Text>
              <Text style={styles.summaryValue}>
                {svc.durationMin} {t('misc.min')}
              </Text>
            </View>
          </View>
          <Text style={styles.note}>{t('bookings.create.technician-note')}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backText}>{t('booking.previous')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleSubmit}
              disabled={createMut.isPending}
            >
              {createMut.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextText}>{t('booking.confirm')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 16,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDone: { backgroundColor: '#16a34a' },
  stepActive: { backgroundColor: '#7c3aed' },
  stepInactive: { backgroundColor: '#e5e7eb' },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  stepLabel: { fontSize: 12, color: '#9ca3af' },
  stepArrow: { fontSize: 12, color: '#d1d5db', marginHorizontal: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 12,
  },
  serviceCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 8,
  },
  serviceCardActive: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#111827', textAlign: 'right' },
  serviceMeta: { fontSize: 12, color: '#6b7280', marginTop: 2, textAlign: 'right' },
  selectedService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
    textAlign: 'right',
    marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', textAlign: 'right', marginBottom: 6 },
  chipRow: { flexDirection: 'row', gap: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  chipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipText: { fontSize: 13, color: '#6b7280' },
  optionCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    marginBottom: 6,
  },
  optionCardActive: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
  optionText: { fontSize: 14, color: '#374151', textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlign: 'right',
    backgroundColor: '#f9fafb',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  backText: { fontSize: 15, color: '#6b7280', fontWeight: '600' },
  nextBtn: {
    flex: 2,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  nextText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  summary: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  summaryLabel: { fontSize: 13, color: '#6b7280' },
  summaryValue: { fontSize: 14, color: '#374151' },
  summaryPrice: { fontSize: 16, fontWeight: '700', color: '#7c3aed' },
  note: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 12 },
});
