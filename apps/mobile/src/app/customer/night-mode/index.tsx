import { View, Text, ScrollView, StyleSheet, Switch, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

let _nightModeEnabled = false;

export function isNightModeEnabled(): boolean { return _nightModeEnabled; }

export default function NightModeScreen(): JSX.Element {
  const [enabled, setEnabled] = useState(_nightModeEnabled);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    // Load persisted preference (AsyncStorage in production)
    setTimeout(() => { setLoading(false); setRefreshing(false); }, 200);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const toggle = (val: boolean) => {
    setEnabled(val);
    _nightModeEnabled = val;
    // In production: AsyncStorage.setItem('nightMode', val ? '1' : '0')
  };

  if (loading) return <SkeletonList count={3} />;

  return (
    <ScrollView style={[styles.c, enabled && styles.cDark]} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetch(true)} colors={['#6366f1']} />}>
      <Text style={[styles.t, enabled && styles.tDark]}>🌙 الوضع الليلي</Text>

      <View style={[styles.row, enabled && styles.rowDark]}>
        <Text style={[styles.label, enabled && styles.labelDark]}>تفعيل الوضع الليلي</Text>
        <Switch value={enabled} onValueChange={toggle} trackColor={{false:'#e5e7eb',true:'#6366f1'}} />
      </View>

      <View style={[styles.section, enabled && styles.sectionDark]}>
        <Text style={[styles.st, enabled && styles.stDark]}>🎨 الألوان</Text>
        <Text style={[styles.desc, enabled && styles.descDark]}>خلفيات داكنة ونصوص فاتحة لتجربة مريحة للعين في الإضاءة المنخفضة</Text>
        <View style={styles.preview}>
          <View style={[styles.previewCard, enabled && styles.previewCardDark]}><Text style={[styles.previewText, enabled && styles.previewTextDark]}>معاينة للوضع الليلي</Text></View>
        </View>
      </View>

      <Text style={[styles.hint, enabled && styles.hintDark]}>💡 الوضع الليلي يقلل إجهاد العين ويوفر البطارية</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, cDark: { backgroundColor: '#111827' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 }, tDark: { color: '#818cf8' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  rowDark: { backgroundColor: '#1f2937' },
  label: { fontSize: 15, fontWeight: '600', color: '#111827' }, labelDark: { color: '#e5e7eb' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 }, sectionDark: { backgroundColor: '#1f2937' },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 }, stDark: { color: '#e5e7eb' },
  desc: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 }, descDark: { color: '#9ca3af' },
  preview: { alignItems: 'center' },
  previewCard: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 20, width: '100%', alignItems: 'center' },
  previewCardDark: { backgroundColor: '#374151' },
  previewText: { fontSize: 14, color: '#111827', fontWeight: '600' }, previewTextDark: { color: '#e5e7eb' },
  hint: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 20 }, hintDark: { color: '#6b7280' },
});
