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

  const role = user?.role as string;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.name as string ?? '?').charAt(0)}</Text></View>
        <Text style={styles.name}>{user?.name as string}</Text>
        <Text style={styles.email}>{user?.email as string}</Text>
        <Text style={styles.role}>{role === 'CUSTOMER' ? 'عميلة' : role === 'TECHNICIAN' ? 'فنية' : 'مدير'}</Text>
      </View>

      {/* Customer features */}
      {role === 'CUSTOMER' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>خدماتي</Text>
          <MenuItem label="📅 حجوزاتي" onPress={() => router.push('/(tabs)/bookings')} />
          <MenuItem label="💰 المحفظة" onPress={() => router.push('/(tabs)/wallet')} />
          <MenuItem label="❤️ المفضلة" onPress={() => router.push('/customer/wishlist')} />
          <MenuItem label="⏳ قائمة الانتظار" onPress={() => router.push('/customer/waitlist')} />
          <MenuItem label="🔬 تحليل البشرة" onPress={() => router.push('/customer/skin-analysis')} />
          <MenuItem label="🤖 لايلى - مستشارة التجميل" onPress={() => router.push('/customer/ai-chat')} />
          <MenuItem label="⭐ تقييماتي" onPress={() => router.push('/customer/reviews')} />
          <MenuItem label="🎁 الإحالات" onPress={() => router.push('/customer/referrals')} />
          <MenuItem label="🔥 الاستمرارية" onPress={() => router.push('/customer/streaks')} />
          <MenuItem label="⚡ النزاعات" onPress={() => router.push('/customer/disputes')} />
          <MenuItem label="📬 الإشعارات" onPress={() => router.push('/customer/notifications')} />
          <MenuItem label="📍 العناوين" onPress={() => router.push('/customer/addresses')} />
          <MenuItem label="📦 الاشتراكات" onPress={() => router.push('/customer/subscriptions')} />
        </View>
      )}

      {/* Technician features */}
      {role === 'TECHNICIAN' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>أدوات الفنية</Text>
          <MenuItem label="📊 لوحة التحكم" onPress={() => router.push('/tech/dashboard')} />
          <MenuItem label="📅 حجوزاتي" onPress={() => router.push('/tech/bookings')} />
          <MenuItem label="⏰ المواعيد المتاحة" onPress={() => router.push('/tech/slots')} />
          <MenuItem label="💰 الأرباح" onPress={() => router.push('/tech/earnings')} />
          <MenuItem label="👤 ملفي الشخصي" onPress={() => router.push('/tech/profile')} />
          <MenuItem label="📆 تقويم قوقل" onPress={() => router.push('/tech/calendar')} />
        </View>
      )}

      {/* Admin features */}
      {role === 'ADMIN' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>أدوات الإدارة</Text>
          <MenuItem label="📊 لوحة الإدارة" onPress={() => router.push('/admin/dashboard')} />
          <MenuItem label="👥 المستخدمين" onPress={() => router.push('/admin/users')} />
          <MenuItem label="📅 الحجوزات" onPress={() => router.push('/admin/bookings')} />
          <MenuItem label="💰 الإدارة المالية" onPress={() => router.push('/admin/finance')} />
          <MenuItem label="📂 الأقسام" onPress={() => router.push('/admin/categories')} />
          <MenuItem label="💄 الخدمات" onPress={() => router.push('/admin/services')} />
          <MenuItem label="👩‍🎨 الفنيات" onPress={() => router.push('/admin/technicians')} />
          <MenuItem label="📈 التحليلات" onPress={() => router.push('/admin/analytics')} />
          <MenuItem label="⚡ النزاعات" onPress={() => router.push('/admin/disputes')} />
          <MenuItem label="🧾 زاتكا" onPress={() => router.push('/admin/zatca')} />
          <MenuItem label="⚙️ الإعدادات" onPress={() => router.push('/admin/settings')} />
        </View>
      )}

      <View style={styles.section}>
        <MenuItem label="تسجيل الخروج" onPress={() => router.replace('/(auth)/login')} danger />
      </View>
    </ScrollView>
  );
}

function MenuItem({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <Text style={[styles.menuText, danger && { color: '#ef4444' }]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
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
  role: { fontSize: 12, color: '#7c3aed', marginTop: 4, fontWeight: '600' },
  section: { paddingTop: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#9ca3af', paddingHorizontal: 20, marginBottom: 4, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  menuText: { fontSize: 15, color: '#374151' },
  menuArrow: { fontSize: 18, color: '#d1d5db' },
});
