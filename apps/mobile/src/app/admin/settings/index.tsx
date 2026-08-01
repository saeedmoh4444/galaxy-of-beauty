import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AdminSettingsScreen(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setTimeout(() => { setLoading(false); setRefreshing(false); }, 500);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <SkeletonList count={4} />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#6366f1']} />}>
      <Text style={styles.t}>⚙️ الإعدادات</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 رسوم المنصة</Text>
        <View style={styles.row}><Text style={styles.label}>نسبة المنصة</Text><Text style={styles.value}>10%</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 الكاش باك</Text>
        <View style={styles.row}><Text style={styles.label}>أول حجز</Text><Text style={styles.value}>50 ر.س</Text></View>
        <View style={styles.row}><Text style={styles.label}>حجوزات لاحقة</Text><Text style={styles.value}>5%</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 14, color: '#6b7280' }, value: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
