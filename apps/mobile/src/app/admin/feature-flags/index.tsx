import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function FeatureFlagsScreen(): JSX.Element {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    ((trpc as any).featureFlags.list.query() as any).then((d: any) => { setFlags(d || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const toggle = (key: string) => {
    ((trpc as any).featureFlags.toggle.mutate({ flagKey: key }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🚩 Feature Flags</Text>
      <Text style={styles.sub}>إدارة ميزات المنصة</Text>
      {flags.length === 0 ? <Text style={styles.e}>لا توجد ميزات</Text> :
        flags.map((f: any) => (
          <View key={f.key} style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.flagName}>{f.nameAr as string ?? f.key as string}</Text>
              <Text style={styles.flagMeta}>النسبة: {f.rolloutPercent as number}%</Text>
            </View>
            <TouchableOpacity onPress={() => toggle(f.key as string)} style={[styles.toggleBtn, f.enabled ? styles.toggleOn : styles.toggleOff]}>
              <Text style={[styles.toggleText, f.enabled ? {color:'#059669'} : {color:'#9ca3af'}]}>{f.enabled ? 'مفعل' : 'معطل'}</Text>
            </TouchableOpacity>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  flagName: { fontSize: 14, fontWeight: '600', color: '#111827' }, flagMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  toggleBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  toggleOn: { backgroundColor: '#dcfce7' }, toggleOff: { backgroundColor: '#f3f4f6' },
  toggleText: { fontSize: 12, fontWeight: '600' },
});
