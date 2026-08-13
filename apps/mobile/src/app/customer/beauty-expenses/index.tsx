import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function BeautyExpensesScreen(): JSX.Element {
  const { data, loading, error, refetch, refreshing, refresh } = useQuery(() =>
    typedTrpc().beautyExpenses.summary.query(),
  );

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل البيانات" onRetry={refetch} />;

  const d = data as any;
  const byCategory = (d?.byCategory ?? []) as any[];
  const monthlyTrend = (d?.monthlyTrend ?? []) as any[];
  const maxVal = Math.max(...monthlyTrend.map((m: any) => m.total ?? 0), 1);

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={s.t}> تحليل الإنفاق</Text>
      <Text style={s.sub}>تتبعي مصاريفكِ على خدمات التجميل</Text>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statNum}>{(d?.thisMonthTotal ?? 0).toLocaleString()} ر.س</Text>
          <Text style={s.statLabel}>هذا الشهر</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statNum}>{(d?.lastMonthTotal ?? 0).toLocaleString()} ر.س</Text>
          <Text style={s.statLabel}>الشهر الماضي</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          مقارنة بالشهر الماضي
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: (d?.monthOverMonth ?? 0) >= 0 ? '#ef4444' : '#059669',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {d?.monthOverMonth ?? 0}%
        </Text>
      </View>

      {byCategory.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={s.st}> توزيع الإنفاق</Text>
          {byCategory.map((c: any) => {
            const pct = Math.round((c.total / (d?.thisMonthTotal || 1)) * 100);
            return (
              <View key={c.categoryId} style={{ marginBottom: 10 }}>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
                >
                  <Text style={{ fontSize: 13 }}>{c.name}</Text>
                  <Text style={{ fontWeight: '700', fontSize: 13 }}>
                    {c.total.toLocaleString()} ر.س
                  </Text>
                </View>
                <View style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 }}>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: '#db2777',
                      borderRadius: 4,
                      width: `${pct}%`,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {monthlyTrend.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={s.st}> الاتجاه الشهري</Text>
          {monthlyTrend.map((m: any) => {
            const pct = Math.round((m.total / maxVal) * 100);
            return (
              <View key={m.month} style={{ marginBottom: 8 }}>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
                >
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{m.month}</Text>
                  <Text style={{ fontWeight: '700', fontSize: 12 }}>
                    {m.total.toLocaleString()} ر.س
                  </Text>
                </View>
                <View style={{ height: 10, backgroundColor: '#e5e7eb', borderRadius: 5 }}>
                  <View
                    style={{
                      height: 10,
                      backgroundColor: '#059669',
                      borderRadius: 5,
                      width: `${pct}%`,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
});
