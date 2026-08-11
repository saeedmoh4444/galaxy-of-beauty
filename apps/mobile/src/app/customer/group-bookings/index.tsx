import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

const TE: Record<string, string> = {
  bridal: '👰',
  birthday: '🎂',
  girls_night: '🌙',
  family: '👨‍👩‍👧‍👦',
  other: '🎉',
};

export default function GroupBookingsScreen(): JSX.Element {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).groupBookings.list.query() as any)
      .then((d: any) => {
        setGroups(d || []);
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
  if (loading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>👯‍♀️ الحجوزات الجماعية</Text>
      {groups.map((g: any) => (
        <View key={g.id} style={styles.card}>
          <Text style={styles.ge}>{TE[g.theme as string] ?? '🎉'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.gn}>{g.name as string}</Text>
            <Text style={styles.gm}>
              {g.members?.length ?? 0} أفراد · {(g.totalAmount as number)?.toLocaleString()} ر.س
            </Text>
          </View>
          <View
            style={[
              styles.sb,
              g.status === 'CONFIRMED' ? styles.sc : g.status === 'PENDING' ? styles.sp : {},
            ]}
          >
            <Text style={styles.st}>
              {g.status === 'CONFIRMED'
                ? 'مؤكد'
                : g.status === 'PENDING'
                  ? 'قيد الانتظار'
                  : g.status === 'COMPLETED'
                    ? 'مكتمل'
                    : 'ملغي'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  ge: { fontSize: 32 },
  gn: { fontSize: 16, fontWeight: '700', color: '#111827' },
  gm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sb: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#f3f4f6' },
  sc: { backgroundColor: '#dcfce7' },
  sp: { backgroundColor: '#fef3c7' },
  st: { fontSize: 11, fontWeight: '600', color: '#111827' },
});
