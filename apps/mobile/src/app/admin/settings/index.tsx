import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AdminSettingsScreen(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [config, setConfig] = useState<any>({});

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    Promise.all([
      (trpc as any).admin.getPlatformConfig.query().catch(() => ({})) as any,
      (trpc as any).cashback.info.query().catch(() => ({})) as any,
    ])
      .then(([cfg, cb]: any[]) => {
        setConfig({ ...cfg, cashbackRate: cb?.rate });
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
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>️ الإعدادات</Text>

      <View style={styles.section}>
        <Text style={styles.st}> رسوم المنصة</Text>
        <View style={styles.row}>
          <Text style={styles.l}>نسبة المنصة</Text>
          <Text style={styles.v}>{(config.platformFee as string) ?? '10%'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.l}>الحد الأدنى للسحب</Text>
          <Text style={styles.v}>
            {((config.minPayout as number) ?? 100)?.toLocaleString()} ر.س
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.st}> الكاش باك</Text>
        <View style={styles.row}>
          <Text style={styles.l}>نسبة الاسترداد</Text>
          <Text style={styles.v}>{(config.cashbackRate as number) ?? 5}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.l}>مكافأة أول حجز</Text>
          <Text style={styles.v}>50 ر.س</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.st}> الصيانة</Text>
        <View style={styles.row}>
          <Text style={styles.l}>وضع الصيانة</Text>
          <View style={[styles.badge, config.maintenanceMode ? styles.bon : styles.boff]}>
            <Text
              style={[
                styles.bt,
                config.maintenanceMode ? { color: '#dc2626' } : { color: '#059669' },
              ]}
            >
              {config.maintenanceMode ? 'مفعل' : 'معطل'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  l: { fontSize: 14, color: '#6b7280' },
  v: { fontSize: 14, fontWeight: '600', color: '#111827' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  bon: { backgroundColor: '#fee2e2' },
  boff: { backgroundColor: '#dcfce7' },
  bt: { fontSize: 12, fontWeight: '600' },
});
