import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ExpenseCategory {
  categoryId?: number;
  name?: string;
  total?: number;
}

interface MonthlyTrendPoint {
  month?: string;
  total?: number;
}

interface ExpensesSummary {
  thisMonthTotal?: number;
  lastMonthTotal?: number;
  monthOverMonth?: number;
  byCategory?: ExpenseCategory[];
  monthlyTrend?: MonthlyTrendPoint[];
}

export default function BeautyExpensesScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.beautyExpenses.summary.useQuery();

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return <ErrorAlert message={t('beautyExpenses.load-error')} onRetry={() => q.refetch()} />;

  const d = q.data as ExpensesSummary | null;
  const byCategory = d?.byCategory ?? [];
  const monthlyTrend = d?.monthlyTrend ?? [];
  const maxVal = Math.max(...monthlyTrend.map((m) => m.total ?? 0), 1);

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={s.t}>{t('beautyExpenses.title')}</Text>
      <Text style={s.sub}>{t('beautyExpenses.subtitle')}</Text>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statNum}>
            {t('beautyExpenses.amount', { value: (d?.thisMonthTotal ?? 0).toLocaleString() })}
          </Text>
          <Text style={s.statLabel}>{t('beautyExpenses.this-month')}</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statNum}>
            {t('beautyExpenses.amount', { value: (d?.lastMonthTotal ?? 0).toLocaleString() })}
          </Text>
          <Text style={s.statLabel}>{t('beautyExpenses.last-month')}</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          {t('beautyExpenses.compare')}
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
          <Text style={s.st}>{t('beautyExpenses.by-category')}</Text>
          {byCategory.map((c) => {
            const pct = Math.round(((c.total ?? 0) / (d?.thisMonthTotal || 1)) * 100);
            return (
              <View key={c.categoryId} style={{ marginBottom: 10 }}>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
                >
                  <Text style={{ fontSize: 13 }}>{c.name}</Text>
                  <Text style={{ fontWeight: '700', fontSize: 13 }}>
                    {t('beautyExpenses.amount', { value: (c.total ?? 0).toLocaleString() })}
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
          <Text style={s.st}>{t('beautyExpenses.monthly-trend')}</Text>
          {monthlyTrend.map((m) => {
            const pct = Math.round(((m.total ?? 0) / maxVal) * 100);
            return (
              <View key={m.month} style={{ marginBottom: 8 }}>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
                >
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{m.month}</Text>
                  <Text style={{ fontWeight: '700', fontSize: 12 }}>
                    {t('beautyExpenses.amount', { value: (m.total ?? 0).toLocaleString() })}
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
