import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { localize } from '@galaxy/shared';

interface EmergencyService {
  id: number;
  emoji?: string;
  titleJson?: { ar?: string; en?: string };
  nameAr?: string;
}

interface AvailableTechnician {
  technicianId: number;
  name?: string;
  rating?: number;
}

interface AvailabilityResult {
  totalEstimate?: number;
  available?: AvailableTechnician[];
}

interface BookingResult {
  bookingCode?: string;
}

export default function EmergencyBookingScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { locale, t } = useLocale();
  const [selectedSvc, setSelectedSvc] = useState<number | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const servicesQ = trpc.services.list.useQuery({});
  const services: EmergencyService[] =
    (servicesQ.data as unknown as { items?: EmergencyService[] })?.items ?? [];

  // Availability is fetched on demand for the selected service
  const availabilityQ = trpc.emergencyBooking.checkAvailability.useQuery(
    { serviceId: selectedSvc ?? 0 },
    { enabled: !!selectedSvc },
  );
  const availability = (availabilityQ.data as AvailabilityResult | undefined) ?? null;

  const addressesQ = trpc.addresses.list.useQuery(undefined, { enabled: isAuthed });

  const createMut = trpc.emergencyBooking.create.useMutation({
    onSuccess: (d) => setResult(d as unknown as BookingResult),
  });

  const book = (technicianId: number, slotId: number) => {
    if (!selectedSvc) return;
    // Resolve the customer's first address instead of a hardcoded ID
    const addressId = addressesQ.data?.[0]?.id;
    if (!addressId) return;
    createMut.mutate({
      serviceId: selectedSvc,
      technicianId,
      addressId,
      slotId,
    });
  };
  if (servicesQ.isLoading) return <SkeletonList count={5} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('emergencyBooking.title')}</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rt}>{t('emergencyBooking.success')}</Text>
          <Text style={styles.rcode}>{result.bookingCode ?? '—'}</Text>
        </View>
      </ScrollView>
    );
  if (!availability || !selectedSvc)
    return (
      <ScrollView
        style={styles.c}
        contentContainerStyle={styles.i}
        refreshControl={
          <RefreshControl
            refreshing={servicesQ.isRefetching}
            onRefresh={() => servicesQ.refetch()}
            colors={['#ef4444']}
          />
        }
      >
        <Text style={styles.t}>{t('emergencyBooking.title')}</Text>
        <Text style={styles.sub}>{t('emergencyBooking.subtitle')}</Text>
        {services.slice(0, 10).map((s) => (
          <TouchableOpacity key={s.id} onPress={() => setSelectedSvc(s.id)} style={styles.sc}>
            <Text style={styles.se}>{s.emoji ?? ''}</Text>
            <Text style={styles.sn}>
              {s.titleJson ? localize(s.titleJson, locale) : (s.nameAr ?? '')}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  if (availabilityQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('emergencyBooking.title')}</Text>
      <View style={styles.ec}>
        <Text style={styles.et}>{t('emergencyBooking.estimated-cost')}</Text>
        <Text style={styles.ev}>
          {t('emergencyBooking.amount', {
            value: (availability.totalEstimate ?? 0).toLocaleString(),
          })}
        </Text>
      </View>
      {(availability.available ?? []).map((tech) => (
        <View key={tech.technicianId} style={styles.card}>
          <Text style={styles.te}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{tech.name ?? ''}</Text>
            <Text style={styles.tm}> {tech.rating ?? ''}</Text>
          </View>
          <TouchableOpacity onPress={() => book(tech.technicianId, 1)} style={styles.bb}>
            <Text style={styles.bt}>{t('emergencyBooking.book-now')}</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => {
          setSelectedSvc(null);
        }}
        style={styles.back}
      >
        <Text style={styles.backt}>{t('emergencyBooking.change-service')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  sc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  se: { fontSize: 28 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  arrow: { fontSize: 18, color: '#dc2626' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  rc: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  re: { fontSize: 48 },
  rt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  rcode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  ec: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  et: { fontSize: 15, fontWeight: '700', color: '#111827' },
  ev: { fontSize: 22, fontWeight: '800', color: '#dc2626', marginTop: 6 },
  te: { fontSize: 32 },
  tn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  tm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  bb: { backgroundColor: '#dc2626', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  bt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  back: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  backt: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
