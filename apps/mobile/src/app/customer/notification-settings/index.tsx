import { View, Text, ScrollView, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const TOGGLES = [
  { key: 'bookingReminders', label: 'تذكير بالمواعيد' },
  { key: 'promotions', label: 'العروض والتخفيضات' },
  { key: 'tips', label: 'نصائح جمالية' },
  { key: 'community', label: 'المجتمع' },
];

export default function NotificationSettingsScreen() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).notificationPrefs.get.query() as any).then((d: any) => { setPrefs(d || {}); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const toggle = (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    ((trpc as any).notificationPrefs.update.mutate({ [key]: updated[key] }) as any);
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🔔 الإشعارات</Text>
      {TOGGLES.map((t) => (
        <View key={t.key} style={styles.row}>
          <Text style={styles.label}>{t.label}</Text>
          <Switch value={!!prefs[t.key]} onValueChange={() => toggle(t.key)} trackColor={{ false: '#e5e7eb', true: '#c4b5fd' }} thumbColor={prefs[t.key] ? '#7c3aed' : '#9ca3af'} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 15, color: '#374151', textAlign: 'right' },
});
