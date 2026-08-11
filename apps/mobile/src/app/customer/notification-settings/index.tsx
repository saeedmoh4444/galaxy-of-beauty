import { View, Text, ScrollView, Switch, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function NotificationSettingsScreen(): JSX.Element {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).notificationPrefs.get.query() as any)
      .then((d: any) => {
        setData(d || {});
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

  if (loading) return <SkeletonList count={3} />;

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
      <Text style={styles.t}>🔔 إعدادات الإشعارات</Text>
      {['bookings', 'promo', 'chat', 'reviews'].map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>
            {key === 'bookings'
              ? '📅 الحجوزات'
              : key === 'promo'
                ? '📢 العروض'
                : key === 'chat'
                  ? '💬 المحادثة'
                  : '⭐ التقييمات'}
          </Text>
          <Switch
            value={(data as any)[key] ?? true}
            onValueChange={() => {}}
            trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 6,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
