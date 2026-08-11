import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';

const TE: Record<string, string> = {
  bridal: '👰',
  birthday: '🎂',
  girls_night: '🌙',
  family: '👨‍👩‍👧‍👦',
  other: '🎉',
};
const SM: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', color: '#d97706', bg: '#fef3c7' },
  CONFIRMED: { label: 'مؤكد', color: '#059669', bg: '#dcfce7' },
  IN_PROGRESS: { label: 'جاري', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { label: 'مكتمل', color: '#6b7280', bg: '#f3f4f6' },
  CANCELLED: { label: 'ملغي', color: '#dc2626', bg: '#fee2e2' },
};

export default function GroupBookingDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      ((trpc as any).groupBookings.get.query({ id: parseInt(id, 10) }) as any)
        .then((d: any) => {
          setData(d);
          setLoading(false);
          setRefreshing(false);
        })
        .catch(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [id],
  );
  useEffect(() => {
    fetch();
  }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  if (!data)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>تعذر تحميل التفاصيل</Text>
      </View>
    );
  const s = SM[data.status as string] ?? { label: 'غير معروف', color: '#6b7280', bg: '#f3f4f6' };
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
      <Text style={styles.t}>
        {TE[data.theme as string] ?? '🎉'} {data.name as string}
      </Text>
      <View style={[styles.sb, { backgroundColor: s.bg }]}>
        <Text style={[styles.sbt, { color: s.color }]}>{s.label}</Text>
      </View>
      <View style={styles.sec}>
        <Text style={styles.secT}>💰 المبلغ</Text>
        <Text style={styles.ta}>{(data.totalAmount as number)?.toLocaleString()} ر.س</Text>
        <Text style={styles.td}>خصم: {data.discountPercent as number}%</Text>
      </View>
      {(data.members as any[])?.map((m: any) => (
        <View key={m.id} style={styles.mr}>
          <Text style={styles.mn}>{m.name as string}</Text>
          <View style={[styles.mb, { backgroundColor: SM[m.status as string]?.bg ?? '#f3f4f6' }]}>
            <Text style={[styles.mbt, { color: SM[m.status as string]?.color ?? '#6b7280' }]}>
              {SM[m.status as string]?.label ?? '—'}
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
  t: { fontSize: 22, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 12 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  sb: {
    alignSelf: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  sbt: { fontSize: 14, fontWeight: '700' },
  sec: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  secT: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  ta: { fontSize: 28, fontWeight: '800', color: '#7c3aed' },
  td: { fontSize: 12, color: '#059669', marginTop: 4 },
  mr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  mb: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  mbt: { fontSize: 11, fontWeight: '600' },
});
