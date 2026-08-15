import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface HeatmapData {
  hours?: string[];
  days?: string[];
  grid?: number[][];
}

export default function BookingHeatmapScreen(): JSX.Element {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc()
      .bookingHeatmap.data.query()
      .then((d: HeatmapData) => {
        setData(d);
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
  const hours = data?.hours ?? [];
  const days = data?.days ?? [];
  const grid = data?.grid ?? [];
  const maxVal = Math.max(1, ...(grid.flat() ?? [1]));
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ef4444']}
        />
      }
    >
      <Text style={styles.t}> خريطة الحجوزات</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.hr}>
            {[
              <View key="l" style={styles.lc}>
                <Text style={styles.lt}>-</Text>
              </View>,
            ].concat(
              hours.map((h) => (
                <View key={h} style={styles.hc}>
                  <Text style={styles.ht}>{h}</Text>
                </View>
              )),
            )}
          </View>
          {days.map((day, di) => (
            <View key={day} style={styles.rr}>
              {[
                <View key="l" style={styles.lc}>
                  <Text style={styles.lt}>{day}</Text>
                </View>,
              ].concat(
                hours.map((_h, hi) => {
                  const val = grid?.[di]?.[hi] ?? 0;
                  const intensity = val / maxVal;
                  const bg =
                    intensity > 0.7
                      ? '#ef4444'
                      : intensity > 0.4
                        ? '#f59e0b'
                        : intensity > 0
                          ? '#86efac'
                          : '#f3f4f6';
                  return (
                    <View key={hi} style={[styles.cell, { backgroundColor: bg }]}>
                      <Text style={[styles.ct, intensity > 0.4 && { color: '#fff' }]}>
                        {val || ''}
                      </Text>
                    </View>
                  );
                }),
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legend}>
        <View style={styles.li}>
          <View style={[styles.ld, { backgroundColor: '#86efac' }]} />
          <Text style={styles.ltx}>هادئ</Text>
        </View>
        <View style={styles.li}>
          <View style={[styles.ld, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.ltx}>متوسط</Text>
        </View>
        <View style={styles.li}>
          <View style={[styles.ld, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.ltx}>ذروة</Text>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 20 },
  hr: { flexDirection: 'row' },
  rr: { flexDirection: 'row' },
  lc: { width: 50, height: 36, justifyContent: 'center', alignItems: 'center' },
  lt: { fontSize: 11, color: '#6b7280' },
  hc: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  ht: { fontSize: 10, color: '#9ca3af' },
  cell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 6,
  },
  ct: { fontSize: 11, fontWeight: '600', color: '#374151' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  li: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ld: { width: 12, height: 12, borderRadius: 4 },
  ltx: { fontSize: 11, color: '#6b7280' },
});
