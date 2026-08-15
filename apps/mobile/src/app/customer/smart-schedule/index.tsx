import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface ServiceRow {
  id: number;
  emoji?: string;
  titleJson?: { ar?: string; en?: string };
  nameAr?: string;
}

interface ServiceListData {
  items?: ServiceRow[];
}

interface SlotSuggestion {
  startAt: string;
  technicianId?: number;
  rating?: number;
}

interface SmartScheduleData {
  suggestions?: SlotSuggestion[];
}

export default function SmartScheduleScreen(): JSX.Element {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSvc, setSelectedSvc] = useState<number | null>(null);
  const [slots, setSlots] = useState<SmartScheduleData | null>(null);
  const [searching, setSearching] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().services.list.query({}) as Promise<ServiceListData>)
      .then((d: ServiceListData) => {
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
  const findSlots = (serviceId: number) => {
    setSelectedSvc(serviceId);
    setSearching(true);
    (typedTrpc().aiFeatures.smartSchedule.query({ serviceId }) as unknown as Promise<SmartScheduleData>)
      .then((d: SmartScheduleData) => {
        setSlots(d);
        setSearching(false);
      })
      .catch(() => setSearching(false));
  };
  if (loading) return <SkeletonList count={5} />;
  if (!slots)
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
        <Text style={styles.t}> جدولة ذكية</Text>
        {services.slice(0, 10).map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => findSlots(s.id)}
            style={[styles.sc, selectedSvc === s.id && styles.sca]}
          >
            <Text style={styles.se}>{s.emoji ?? '‍️'}</Text>
            <Text style={styles.sn}>
              {s.titleJson?.ar ?? s.nameAr}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  if (searching) return <SkeletonList count={4} />;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> جدولة ذكية</Text>
      {(slots.suggestions ?? []).map((s, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.rk}>
            <Text style={styles.rtx}>#{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sd}>
              {new Date(s.startAt).toLocaleDateString('ar-SA', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.stm}>
              {new Date(s.startAt).toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Text style={styles.sr}>
              ‍ #{s.technicianId} ·  {s.rating}
            </Text>
          </View>
          <TouchableOpacity style={styles.bb}>
            <Text style={styles.bt}>احجز</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => {
          setSlots(null);
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
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
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
  sn: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  rk: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rtx: { fontSize: 11, fontWeight: '700', color: '#059669' },
  sd: { fontSize: 13, fontWeight: '600', color: '#111827' },
  stm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sr: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  bb: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  bt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  back: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  backt: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
