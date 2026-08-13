import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function IoTSyncScreen(): JSX.Element {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().iotSync.devices.query() as any)
      .then((d: any) => {
        setDevices(d || []);
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
  const connect = (dk: string) => {
    typedTrpc().iotSync.connect.mutate({ deviceKey: dk }) as any;
  };
  if (loading) return <SkeletonList count={4} />;
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
      <Text style={styles.t}> الأجهزة الذكية</Text>
      <View style={styles.grid}>
        {devices.map((d) => (
          <View key={d.key} style={styles.card}>
            <Text style={styles.de}>{d.emoji as string}</Text>
            <Text style={styles.dn}>{d.nameAr as string}</Text>
            <Text
              style={[
                styles.ds,
                d.status === 'connected' ? { color: '#059669' } : { color: '#9ca3af' },
              ]}
            >
              {d.status === 'connected' ? ' متصل' : ' غير متصل'}
            </Text>
            <TouchableOpacity onPress={() => connect(d.key as string)} style={styles.db}>
              <Text style={styles.dbt}>{d.status === 'connected' ? 'مزامنة' : 'ربط'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  de: { fontSize: 40 },
  dn: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 },
  ds: { fontSize: 11, marginTop: 4 },
  db: {
    backgroundColor: '#0891b2',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 10,
  },
  dbt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
