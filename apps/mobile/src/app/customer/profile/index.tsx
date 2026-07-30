import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CustomerProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).users.me.query() as any).then((d: any) => { setUser(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;
  if (!user) return <Text style={styles.e}>لا يوجد ملف</Text>;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>👤 الملف الشخصي</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{user.name as string}</Text>
        <Text style={styles.email}>{user.email as string}</Text>
        {user.phone && <Text style={styles.phone}>📱 {user.phone as string}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' }, email: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  phone: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
