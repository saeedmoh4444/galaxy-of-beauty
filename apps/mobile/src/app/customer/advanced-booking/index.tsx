import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

const REC = [
  { key: 'WEEKLY', emoji: '' },
  { key: 'BIWEEKLY', emoji: '' },
  { key: 'MONTHLY', emoji: '️' },
] as const;

interface ServiceRow {
  id: number;
  emoji?: string;
  titleJson?: { ar?: string; en?: string };
  nameAr?: string;
}

interface ServiceListData {
  items?: ServiceRow[];
}

interface RecurringBookingResult {
  bookings?: unknown[];
}

interface AddressRow {
  id: number;
}

interface TechnicianRow {
  id: number;
}

interface SlotRow {
  id: number;
}

export default function AdvancedBookingScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const [selectedSvc, setSelectedSvc] = useState<number | null>(null);
  const [recurrence, setRecurrence] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('WEEKLY');
  const [occurrences, setOccurrences] = useState(4);
  const [result, setResult] = useState<RecurringBookingResult | null>(null);

  const recLabels: Record<string, string> = {
    WEEKLY: t('advancedBooking.freq-weekly'),
    BIWEEKLY: t('advancedBooking.freq.biweekly'),
    MONTHLY: t('advancedBooking.freq-monthly'),
  };

  const servicesQ = trpc.services.list.useQuery({});
  const addressesQ = trpc.addresses.list.useQuery();
  const techniciansQ = trpc.technicians.list.useQuery({});

  // Resolve real IDs instead of hardcoded placeholders (audit fix B1/D1)
  const services: ServiceRow[] = (servicesQ.data as unknown as ServiceListData)?.items ?? [];
  const address: AddressRow | null = addressesQ.data?.[0] ?? null;
  const technician: TechnicianRow | null =
    ((techniciansQ.data?.items ?? []) as unknown as TechnicianRow[])[0] ?? null;

  // Load the first technician's availability once a technician is resolved
  const availabilityQ = trpc.slots.getAvailability.useQuery(
    { technicianId: technician?.id ?? 0 },
    { enabled: !!technician },
  );
  const slot: SlotRow | null = ((availabilityQ.data ?? []) as unknown as SlotRow[])[0] ?? null;

  const loading = servicesQ.isLoading || addressesQ.isLoading || techniciansQ.isLoading;
  const refreshing = servicesQ.isRefetching || addressesQ.isRefetching || techniciansQ.isRefetching;

  const createMut = trpc.advancedBooking.createRecurring.useMutation({
    onSuccess: (d) => setResult(d as unknown as RecurringBookingResult),
  });

  const create = () => {
    if (!selectedSvc) return;
    if (!address || !technician || !slot) {
      // Cannot create a recurring booking without resolved references
      return;
    }
    const s = new Date(Date.now() + 86400000).toISOString();
    const e = new Date(Date.now() + 86400000 + 3600000).toISOString();
    createMut.mutate({
      technicianId: technician.id,
      serviceId: selectedSvc,
      addressId: address.id,
      slotId: slot.id,
      startAt: s,
      endAt: e,
      recurrence,
      occurrences,
    });
  };
  if (loading) return <SkeletonList count={5} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('advancedBooking.recurringTitle')}</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rtt}>{t('advancedBooking.done')}</Text>
          <Text style={styles.rcnt}>
            {t('advancedBooking.bookings-count', {
              count: result.bookings?.length ?? occurrences,
            })}
          </Text>
        </View>
      </ScrollView>
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            void servicesQ.refetch();
            void addressesQ.refetch();
            void techniciansQ.refetch();
          }}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('advancedBooking.recurringTitle')}</Text>
      {services.slice(0, 10).map((s) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => setSelectedSvc(s.id)}
          style={[styles.sc, selectedSvc === s.id && styles.sca]}
        >
          <Text style={styles.se}>{s.emoji ?? '‍️'}</Text>
          <Text style={styles.sn}>{localize(s.titleJson, locale) || s.nameAr}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.st}>{t('advancedBooking.recurrence')}</Text>
      <View style={styles.rg}>
        {REC.map((r) => (
          <TouchableOpacity
            key={r.key}
            onPress={() => setRecurrence(r.key)}
            style={[styles.rcrd, recurrence === r.key && styles.rca]}
          >
            <Text style={styles.rce}>{r.emoji}</Text>
            <Text style={[styles.rcl, recurrence === r.key && styles.rcla]}>
              {recLabels[r.key]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.st}>
        {t('advancedBooking.occurrences-count', { count: occurrences })}
      </Text>
      <View style={styles.or}>
        {[2, 4, 6, 8, 12].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setOccurrences(n)}
            style={[styles.ob, occurrences === n && styles.oba]}
          >
            <Text style={[styles.ot, occurrences === n && styles.ota]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={create}
        disabled={!selectedSvc}
        style={[styles.cb, !selectedSvc && { opacity: 0.5 }]}
      >
        <Text style={styles.cbt}>{t('advancedBooking.create-count', { count: occurrences })}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 10 },
  sc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  sca: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  se: { fontSize: 26 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rg: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  rcrd: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  rca: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  rce: { fontSize: 28 },
  rcl: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 4 },
  rcla: { color: '#059669' },
  or: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  ob: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  oba: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  ot: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  ota: { color: '#059669' },
  cb: { backgroundColor: '#059669', borderRadius: 14, padding: 16, alignItems: 'center' },
  cbt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  rc: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  re: { fontSize: 48 },
  rtt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  rcnt: { fontSize: 16, fontWeight: '600', color: '#059669', marginTop: 4 },
});
