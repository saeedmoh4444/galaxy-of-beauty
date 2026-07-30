import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function EmergencyBookingScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSvc, setSelectedSvc] = useState<number | null>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    ((trpc as any).services.list.query({}) as any).then((d: any) => { setServices(d?.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const check = (serviceId: number) => {
    setSelectedSvc(serviceId);
    setChecking(true);
    ((trpc as any).emergencyBooking.checkAvailability.query({ serviceId }) as any)
      .then((d: any) => { setAvailability(d); setChecking(false); })
      .catch(() => setChecking(false));
  };

  const book = (technicianId: number, slotId: number) => {
    ((trpc as any).emergencyBooking.create.mutate({ serviceId: selectedSvc!, technicianId, addressId: 1 /* TODO: from address book */, slotId }) as any)
      .then((d: any) => setResult(d));
  };

  if (loading) return <ActivityIndicator color="#ef4444" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>🚨 حجز طارئ</Text>
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultEmoji}>✅</Text>
          <Text style={styles.resultTitle}>تم الحجز الطارئ!</Text>
          <Text style={styles.resultCode}>رمز الحجز: {result.bookingCode as string ?? '—'}</Text>
          <Text style={styles.resultPrice}>{(result.totalAmount as number)?.toLocaleString()} ر.س</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🚨 حجز طارئ</Text>
      <Text style={styles.sub}>حجز فوري خلال ٣ ساعات — رسوم إضافية ٥٠ ر.س</Text>

      {!availability ? (
        <>
          <Text style={styles.sectionTitle}>اختاري الخدمة</Text>
          {services.slice(0, 10).map((s: any) => (
            <TouchableOpacity key={s.id} onPress={() => check(s.id as number)} style={styles.svcCard}>
              <Text style={styles.svcEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
              <View style={{flex:1}}>
                <Text style={styles.svcName}>{(s.titleJson as any)?.ar as string ?? s.nameAr as string}</Text>
                <Text style={styles.svcPrice}>{(s.basePrice as number)?.toLocaleString()} ر.س</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : checking ? (
        <ActivityIndicator color="#ef4444" style={{ marginTop: 40 }} size="large" />
      ) : (
        <>
          <View style={styles.estCard}>
            <Text style={styles.estTitle}>💰 التكلفة التقديرية</Text>
            <View style={styles.estRow}><Text style={styles.estLabel}>سعر الخدمة</Text><Text style={styles.estVal}>{(availability.basePrice as number)?.toLocaleString()} ر.س</Text></View>
            <View style={styles.estRow}><Text style={styles.estLabel}>رسوم الطوارئ</Text><Text style={[styles.estVal, {color:'#ef4444'}]}>+{(availability.emergencySurcharge as number)?.toLocaleString()} ر.س</Text></View>
            <View style={styles.estDivider} />
            <View style={styles.estRow}><Text style={[styles.estLabel, {fontWeight:'700'}]}>الإجمالي</Text><Text style={[styles.estVal, {fontWeight:'800', fontSize:18}]}>{(availability.totalEstimate as number)?.toLocaleString()} ر.س</Text></View>
          </View>
          <Text style={styles.sectionTitle}>👩‍🎨 فنيات متاحات</Text>
          {(availability.available as any[])?.length === 0 ? <Text style={styles.e}>لا توجد فنيات متاحات</Text> :
            (availability.available as any[]).map((t: any) => (
              <View key={t.technicianId} style={styles.techCard}>
                <Text style={styles.techEmoji}>👩‍🎨</Text>
                <View style={{flex:1}}>
                  <Text style={styles.techName}>{t.name as string}</Text>
                  <Text style={styles.techMeta}>📍 {t.city as string} · ⭐ {t.rating as number} · ⏱️ {new Date(t.nextSlot as string).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}</Text>
                </View>
                <TouchableOpacity onPress={() => book(t.technicianId as number, 1)} style={styles.bookBtn}><Text style={styles.bookBtnText}>احجز الآن</Text></TouchableOpacity>
              </View>
            ))
          }
          <TouchableOpacity onPress={() => { setAvailability(null); setSelectedSvc(null); }} style={styles.backBtn}><Text style={styles.backBtnText}>🔄 تغيير الخدمة</Text></TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  resultCard: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  resultEmoji: { fontSize: 48 }, resultTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  resultCode: { fontSize: 14, fontWeight: '600', color: '#dc2626', marginTop: 4, fontFamily: 'monospace' },
  resultPrice: { fontSize: 22, fontWeight: '800', color: '#059669', marginTop: 8 },
  svcCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  svcEmoji: { fontSize: 28 }, svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  svcPrice: { fontSize: 13, fontWeight: '700', color: '#dc2626', marginTop: 2 },
  arrow: { fontSize: 18, color: '#dc2626' },
  estCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: '#fecaca' },
  estTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  estRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  estLabel: { fontSize: 13, color: '#6b7280' }, estVal: { fontSize: 14, fontWeight: '600', color: '#111827' },
  estDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 6 },
  techCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  techEmoji: { fontSize: 32 }, techName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  techMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  bookBtn: { backgroundColor: '#dc2626', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  backBtn: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12 },
  backBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
