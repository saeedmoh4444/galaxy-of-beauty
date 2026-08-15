import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

const TYPES: Record<string, string> = {
  workshop: ' ورشة',
  masterclass: ' ماستر كلاس',
  launch: ' إطلاق',
  seasonal: ' موسمي',
};

interface EventNameJson {
  ar?: string;
  en?: string;
}

interface BeautyEvent {
  id: number;
  eventType: string;
  nameJson?: EventNameJson;
  location?: string;
  startsAt: string;
  price?: number;
}

interface EventRegistration {
  id: number;
  eventId?: number;
  event?: { nameJson?: EventNameJson };
}

export default function BeautyEventsScreen(): JSX.Element {
  const {
    data: events,
    loading,
    error,
    refetch,
    refreshing,
    refresh,
  } = useQuery(() => typedTrpc().beautyEvents.upcoming.query());
  const { data: myRegsData } = useQuery(() => typedTrpc().beautyEvents.myRegistrations.query());
  const myRegs = (myRegsData ?? []) as EventRegistration[];
  const registeredIds = new Set(myRegs.map((r) => r.eventId));

  const handleRegister = async (id: number) => {
    try {
      await typedTrpc().beautyEvents.register.mutate({ eventId: id });
      refetch();
    } catch { /* noop */ }
  };
  const handleCancel = async (id: number) => {
    try {
      await typedTrpc().beautyEvents.cancelRegistration.mutate({ eventId: id });
      refetch();
    } catch { /* noop */ }
  };

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل الفعاليات" onRetry={refetch} />;

  const items: BeautyEvent[] = Array.isArray(events) ? events : [];

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={s.t}> فعاليات وورش</Text>
      <Text style={s.sub}>سجلي في ورش العمل والفعاليات الحصرية</Text>

      {myRegs.length > 0 && (
        <View
          style={{ backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12, marginBottom: 16 }}
        >
          <Text style={{ fontWeight: '700', color: '#059669', marginBottom: 4 }}>
             مسجلة في {myRegs.length} فعاليات
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {myRegs.map((r) => (
              <View
                key={r.id}
                style={{
                  backgroundColor: '#d1fae5',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 11, color: '#047857' }}>{r.event?.nameJson?.ar}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {items.length === 0 && (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40 }}></Text>
          <Text style={{ color: '#6b7280', marginTop: 8 }}>لا توجد فعاليات قادمة</Text>
        </View>
      )}

      {items.map((e) => {
        const isReg = registeredIds.has(e.id);
        return (
          <View key={e.id} style={s.card}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 36 }}>{TYPES[e.eventType]?.split(' ')[0] ?? ''}</Text>
              <Text style={{ fontWeight: '800', fontSize: 16, marginTop: 8 }}>
                {e.nameJson?.ar}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {TYPES[e.eventType]}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {e.location} · {new Date(e.startsAt).toLocaleDateString('ar-SA')}
              </Text>
              <Text style={{ fontWeight: '800', fontSize: 20, color: '#db2777', marginTop: 6 }}>
                {e.price ? `${e.price} ر.س` : 'مجانية'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => (isReg ? handleCancel(e.id) : handleRegister(e.id))}
              style={[s.btn, isReg && { backgroundColor: '#e5e7eb' }]}
            >
              <Text style={[s.btnText, isReg && { color: '#374151' }]}>
                {isReg ? ' مسجلة — إلغاء' : ' سجلي الآن'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12 },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
