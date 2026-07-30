import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SmartScheduleScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSvc, setSelectedSvc] = useState<number | null>(null);
  const [slots, setSlots] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    ((trpc as any).services.list.query({}) as any).then((d: any) => { setServices(d?.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const findSlots = (serviceId: number) => {
    setSelectedSvc(serviceId);
    setSearching(true);
    ((trpc as any).aiFeatures.smartSchedule.query({ serviceId }) as any)
      .then((d: any) => { setSlots(d); setSearching(false); })
      .catch(() => setSearching(false));
  };

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📅 جدولة ذكية</Text>
      <Text style={styles.sub}>أفضل الأوقات المتاحة بناءً على تقييمات الفنيات</Text>

      {!slots ? (
        <>
          <Text style={styles.sectionTitle}>💆‍♀️ اختاري الخدمة</Text>
          {services.slice(0, 10).map((s: any) => (
            <TouchableOpacity key={s.id} onPress={() => findSlots(s.id as number)} style={[styles.svcCard, selectedSvc === s.id && styles.svcCardActive]}>
              <Text style={styles.svcEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
              <Text style={styles.svcName}>{(s.titleJson as any)?.ar as string ?? s.nameAr as string}</Text>
              <Text style={styles.svcPrice}>{(s.basePrice as number)?.toLocaleString()} ر.س</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : searching ? (
        <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>📅 أفضل المواعيد</Text>
          {(slots.suggestions as any[])?.length === 0 ? <Text style={styles.e}>لا توجد مواعيد متاحة</Text> :
            (slots.suggestions as any[]).map((s: any, i: number) => (
              <View key={i} style={styles.card}>
                <View style={styles.rank}><Text style={styles.rankText}>#{i + 1}</Text></View>
                <View style={{flex:1}}>
                  <Text style={styles.slotDate}>{new Date(s.startAt as string).toLocaleDateString('ar-SA', { weekday:'long', month:'long', day:'numeric' })}</Text>
                  <Text style={styles.slotTime}>{new Date(s.startAt as string).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})} — {new Date(s.endAt as string).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}</Text>
                  <Text style={styles.slotRating}>👩‍🎨 فنية #{s.technicianId as number} · ⭐ {s.rating as number}</Text>
                </View>
                <TouchableOpacity style={styles.bookBtn}><Text style={styles.bookBtnText}>احجز</Text></TouchableOpacity>
              </View>
            ))
          }
          <TouchableOpacity onPress={() => { setSlots(null); setSelectedSvc(null); }} style={styles.backBtn}><Text style={styles.backBtnText}>🔄 تغيير الخدمة</Text></TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  svcCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 2, borderColor: '#e5e7eb' },
  svcCardActive: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  svcEmoji: { fontSize: 26 }, svcName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  svcPrice: { fontSize: 13, fontWeight: '700', color: '#059669' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  rank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  slotDate: { fontSize: 13, fontWeight: '600', color: '#111827' }, slotTime: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  slotRating: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  bookBtn: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  backBtn: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12 },
  backBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
