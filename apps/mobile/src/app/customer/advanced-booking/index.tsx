import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

const REC = [
  { key: 'WEEKLY', emoji: '', label: 'أسبوعي' },
  { key: 'BIWEEKLY', emoji: '', label: 'كل أسبوعين' },
  { key: 'MONTHLY', emoji: '️', label: 'شهري' },
];

export default function AdvancedBookingScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSvc, setSelectedSvc] = useState<number | null>(null);
  const [recurrence, setRecurrence] = useState('WEEKLY');
  const [occurrences, setOccurrences] = useState(4);
  const [result, setResult] = useState<any>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().services.list.query({}) as any)
      .then((d: any) => {
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
  const create = () => {
    if (!selectedSvc) return;
    const s = new Date(Date.now() + 86400000).toISOString();
    const e = new Date(Date.now() + 86400000 + 3600000).toISOString();
    (
      typedTrpc().advancedBooking.createRecurring.mutate({
        technicianId: 1 /* TODO */,
        serviceId: selectedSvc,
        addressId: 1 /* TODO */,
        slotId: 1 /* TODO */,
        startAt: s,
        endAt: e,
        recurrence,
        occurrences,
      }) as any
    ).then((d: any) => setResult(d));
  };
  if (loading) return <SkeletonList count={5} />;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}> حجز متكرر</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rtt}>تم!</Text>
          <Text style={styles.rcnt}>
            {(result.bookings as any[])?.length ?? occurrences} حجوزات
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
          onRefresh={() => fetch(true)}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> حجز متكرر</Text>
      {services.slice(0, 10).map((s: any) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => setSelectedSvc(s.id)}
          style={[styles.sc, selectedSvc === s.id && styles.sca]}
        >
          <Text style={styles.se}>{(s.emoji as string) ?? '‍️'}</Text>
          <Text style={styles.sn}>
            {((s.titleJson as any)?.ar as string) ?? (s.nameAr as string)}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.st}> التكرار</Text>
      <View style={styles.rg}>
        {REC.map((r) => (
          <TouchableOpacity
            key={r.key}
            onPress={() => setRecurrence(r.key)}
            style={[styles.rcrd, recurrence === r.key && styles.rca]}
          >
            <Text style={styles.rce}>{r.emoji}</Text>
            <Text style={[styles.rcl, recurrence === r.key && styles.rcla]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.st}> عدد المرات: {occurrences}</Text>
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
        <Text style={styles.cbt}> إنشاء {occurrences} حجوزات</Text>
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
