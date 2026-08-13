import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function TechCalendarScreen(): JSX.Element {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().techCalendar.availability.query() as any)
      .then((d: any) => {
        setSlots(d || []);
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
  if (loading) return <SkeletonList count={5} />;
  const days = slots.reduce((acc: any[], s: any) => {
    const day = new Date(s.date as string).toLocaleDateString('ar-SA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const ex = acc.find((x) => x.day === day);
    if (ex) ex.slots.push(s);
    else acc.push({ day, slots: [s] });
    return acc;
  }, []);
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
      <Text style={styles.t}> تقويم الفنيات</Text>
      {days.map((d: any, di: number) => (
        <View key={di} style={styles.dg}>
          <Text style={styles.dl}>{d.day}</Text>
          {d.slots.map((s: any) => (
            <View key={s.id} style={styles.slot}>
              <Text style={styles.stm}>
                {new Date(s.date as string).toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.st}>‍ {s.technician as string}</Text>
              <View style={[styles.sb, s.available ? styles.sf : styles.su]}>
                <Text style={styles.sbt}>{s.available ? 'متاح' : 'محجوز'}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  dg: { marginBottom: 16 },
  dl: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 8 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  stm: { fontSize: 13, fontWeight: '600', color: '#111827' },
  st: { flex: 1, fontSize: 13, color: '#6b7280' },
  sb: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  sf: { backgroundColor: '#dcfce7' },
  su: { backgroundColor: '#fee2e2' },
  sbt: { fontSize: 11, fontWeight: '600' },
});
