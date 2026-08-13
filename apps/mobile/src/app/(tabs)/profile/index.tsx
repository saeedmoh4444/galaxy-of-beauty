import { useHaptics } from '@/hooks/useHaptics';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc, typedTrpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray50: '#faf5ff',
  gray400: '#6b7280',
  gray900: '#111827',
  danger: '#dc2626',
};

const MENU_ITEMS = [
  { label: ' حجوزاتي', href: '/customer/bookings' },
  { label: '️ المفضلة', href: '/customer/wishlist' },
  { label: ' الولاء', href: '/customer/loyalty' },
  { label: ' تعديل الملف', href: '/customer/profile' },
  { label: ' العناوين', href: '/customer/addresses' },
  { label: ' البطاقات المحفوظة', href: '/customer/saved-cards' },
  { label: ' الإحالات', href: '/customer/referrals' },
  { label: '‍️ مجتمع الجمال', href: '/customer/community' },
  { label: ' أكاديمية الجمال', href: '/customer/beauty-academy' },
  { label: ' الصحة والعافية', href: '/customer/wellness' },
  { label: ' الإشعارات', href: '/customer/notifications' },
  { label: ' لايلى - المساعدة الذكية', href: '/customer/ai-chat' },
];

export default function ProfileScreen(): JSX.Element {
  const { trigger } = useHaptics();
  const router = useRouter();
  const profile = typedTrpc().users?.me?.useQuery?.() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const loyalty = typedTrpc().loyalty?.getAccount?.useQuery?.();
  const kindness = typedTrpc().kindnessPoints?.getStatus?.useQuery?.();

  return (
    <ScreenState
      isLoading={profile.isLoading}
      isError={profile.isError}
      isEmpty={false}
      errorMessage="فشل تحميل الملف الشخصي"
      onRetry={() => profile.refetch()}
    >
      <Text style={styles.title}> حسابي</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(profile.data as any)?.name?.[0] ?? ''}</Text>
        </View>
        <Text style={styles.userName}>{(profile.data as any)?.name ?? 'مستخدمة جالكسي بيوتي'}</Text>
        <Text style={styles.userEmail}>{(profile.data as any)?.email ?? ''}</Text>
        {/* Loyalty + Kindness Stats */}
        <View style={styles.statsRow}>
          {loyalty?.data && (
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{loyalty.data.points ?? 0}</Text>
              <Text style={styles.statLbl}> نقاط</Text>
            </View>
          )}
          {kindness?.data && (
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{kindness.data.points ?? 0}</Text>
              <Text style={styles.statLbl}> لطف</Text>
            </View>
          )}
        </View>
      </View>
      <ScrollView style={styles.menuList}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuItem}
            onPress={() => router.push(item.href as never)}
            activeOpacity={0.6}
          >
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}> تسجيل الخروج</Text>
      </TouchableOpacity>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, color: COLORS.white, fontWeight: '700' },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  userEmail: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },
  menuList: { marginBottom: 16 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
  },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
  menuArrow: { fontSize: 20, color: COLORS.gray400 },
  logoutBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
  logoutText: { fontSize: 15, fontWeight: '600', color: COLORS.danger },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700', color: COLORS.brand },
  statLbl: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
});
