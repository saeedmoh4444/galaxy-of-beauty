import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (trpc.auth.me.query() as unknown as Promise<Record<string, unknown>>).then((u: Record<string, unknown>) => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.name as string ?? '?').charAt(0)}</Text></View>
        <Text style={styles.name}>{user?.name as string}</Text>
        <Text style={styles.email}>{user?.email as string}</Text>
      </View>

      <View style={styles.menu}>
        <MenuItem label="حجوزاتي" onPress={() => router.push('/(tabs)/bookings')} />
        <MenuItem label="المحفظة" onPress={() => router.push('/(tabs)/wallet')} />
        <MenuItem label="لوحة تحكم الفنية" onPress={() => router.push('/tech/dashboard')} />
        <MenuItem label="لوحة الإدارة" onPress={() => router.push('/admin/dashboard')} />
        <MenuItem label="تسجيل الخروج" onPress={() => router.replace('/(auth)/login')} danger />
      </View>
    </ScrollView>
  );
}

function MenuItem({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={[styles.menuText, danger && { color: '#ef4444' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  menu: { padding: 16 },
  menuItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuText: { fontSize: 16, color: '#374151' },
});
