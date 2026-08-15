import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

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
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSvc, setSelectedSvc] = useState<number | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (rawTrpc.services.list.query({}) as Promise<{ items?: EmergencyService[] }>)
      .then((d) => {
        setServices(d?.items || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const check = (serviceId: number) => {
    setSelectedSvc(serviceId);
    setChecking(true);
    (rawTrpc.emergencyBooking.checkAvailability.query({ serviceId }) as Promise<AvailabilityResult>)
      .then((d) => {
        setAvailability(d);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  };
  const book = async (technicianId: number, slotId: number) => {
    if (!selectedSvc) return;
    // Resolve the customer's first address instead of a hardcoded ID
    const addresses = (await rawTrpc.addresses.list.query()) as unknown as
      { id: number }[] | undefined;
    const addressId = addresses?.[0]?.id;
    if (!addressId) return;
    (
      rawTrpc.emergencyBooking.create.mutate({
        serviceId: selectedSvc,
        technicianId,
        addressId,
        slotId,
      }) as Promise<BookingResult>
    ).then((d) => setResult(d));
  };
  if (loading) return <SkeletonList count={5} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}> حجز طارئ</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rt}>تم الحجز الطارئ!</Text>
          <Text style={styles.rcode}>{result.bookingCode ?? '—'}</Text>
        </View>
      </ScrollView>
    );
  if (!availability)
    return (
      <ScrollView
        style={styles.c}
        contentContainerStyle={styles.i}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetch(true)}
            colors={['#ef4444']}
          />
        }
      >
        <Text style={styles.t}> حجز طارئ</Text>
        <Text style={styles.sub}>حجز فوري خلال ٣ ساعات — رسوم إضافية ٥٠ ر.س</Text>
        {services.slice(0, 10).map((s) => (
          <TouchableOpacity key={s.id} onPress={() => check(s.id)} style={styles.sc}>
            <Text style={styles.se}>{s.emoji ?? ''}</Text>
            <Text style={styles.sn}>{s.titleJson?.ar ?? s.nameAr ?? ''}</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  if (checking) return <SkeletonList count={4} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> حجز طارئ</Text>
      <View style={styles.ec}>
        <Text style={styles.et}> التكلفة التقديرية</Text>
        <Text style={styles.ev}>{(availability.totalEstimate ?? 0).toLocaleString()} ر.س</Text>
      </View>
      {(availability.available ?? []).map((t) => (
        <View key={t.technicianId} style={styles.card}>
          <Text style={styles.te}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{t.name ?? ''}</Text>
            <Text style={styles.tm}> {t.rating ?? ''}</Text>
          </View>
          <TouchableOpacity onPress={() => book(t.technicianId, 1)} style={styles.bb}>
            <Text style={styles.bt}>احجز الآن</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => {
          setAvailability(null);
          setSelectedSvc(null);
        }}
        style={styles.back}
      >
        <Text style={styles.backt}> تغيير الخدمة</Text>
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
