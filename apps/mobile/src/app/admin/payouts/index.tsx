import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'معلق', color: '#d97706', bg: '#fef3c7' },
  PROCESSING: { label: 'قيد المعالجة', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { label: 'مكتمل', color: '#059669', bg: '#dcfce7' },
  FAILED: { label: 'فشل', color: '#dc2626', bg: '#fee2e2' },
};

export default function AdminPayoutsScreen(): JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).payouts.listForAdmin.query({}) as any)
      .then((d: any) => {
        setData(d?.payouts || []);
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

  const process = (id: number) => {
    ((trpc as any).payouts.process.mutate({ payoutId: id }) as any).then(() => fetch());
  };

  if (loading) return <SkeletonList count={5} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}>💸 المدفوعات للفنيات</Text>
      {data.map((p: any, i: number) => {
        const s = STATUS_MAP[p.status as string] ?? {
          label: p.status,
          color: '#6b7280',
          bg: '#f3f4f6',
        };
        return (
          <View key={i} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tech}>👩‍🎨 {p.technicianName as string}</Text>
              <Text style={styles.amount}>{(p.amount as number)?.toLocaleString()} ر.س</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: s.bg }]}>
              <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
            </View>
            {p.status === 'PENDING' && (
              <TouchableOpacity onPress={() => process(p.id)} style={styles.btn}>
                <Text style={styles.btnText}>معالجة</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  tech: { fontSize: 14, fontWeight: '600', color: '#111827' },
  amount: { fontSize: 15, fontWeight: '700', color: '#0891b2', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  btn: { backgroundColor: '#0891b2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
