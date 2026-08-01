import { View, Text, ScrollView, StyleSheet, Switch, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function NightModeScreen(): JSX.Element {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setTimeout(() => { setLoading(false); setRefreshing(false); }, 300);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={3} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#6366f1']} />}>
      <Text style={styles.t}>🌙 الوضع الليلي</Text>
      <View style={styles.row}>
        <Text style={styles.label}>تفعيل الوضع الليلي</Text>
        <Switch value={enabled} onValueChange={setEnabled} trackColor={{false:'#e5e7eb',true:'#6366f1'}} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  label: { fontSize: 15, fontWeight: '600', color: '#111827' },
});
