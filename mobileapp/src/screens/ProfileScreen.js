import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useStreak } from '../hooks/useWallet';
import api from '../lib/api';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();
  const { data: streak } = useStreak();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => { const { data } = await api.get('/me'); return data.user; },
    enabled: !!user,
  });

  const handleLogout = async () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
      { text: 'لا', style: 'cancel' },
      {
        text: 'نعم', style: 'destructive',
        onPress: async () => {
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          api.post('/auth/logout', { refreshToken: refreshToken || '' }).finally(() => logout());
        },
      },
    ]);
  };

  if (isLoading) return <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 60 }} />;

  const isTechnician = user?.role === 'TECHNICIAN';
  const roleLabel = isTechnician ? 'مقدمة خدمة' : user?.role === 'ADMIN' ? 'مدير' : 'عميلة';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Avatar + Name */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>{isTechnician ? '👩‍🎨' : '👩'}</Text>
        </View>
        <Text style={styles.name}>{profile?.name || user?.name}</Text>
        <Text style={styles.role}>{roleLabel}</Text>
        <Text style={styles.email}>{profile?.email || user?.email}</Text>
      </View>

      {/* Streak Badge */}
      {user?.role === 'CUSTOMER' && streak && streak.currentStreak > 0 && (
        <View style={styles.streakBanner}>
          <Text style={{ fontSize: 16 }}>🔥</Text>
          <View>
            <Text style={styles.streakTitle}>مواظبة {streak.currentStreak} أسابيع</Text>
            <Text style={styles.streakSub}>الأطول: {streak.longestStreak} أسبوع</Text>
          </View>
        </View>
      )}

      {/* Wallet Quick View */}
      {profile?.wallet && (
        <View style={styles.walletCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.walletLabel}>الرصيد</Text>
            <Text style={styles.walletAmount}>{Number(profile.wallet.balance).toLocaleString('ar-SA')} ر.س</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.walletLabel}>المكافآت</Text>
            <Text style={[styles.walletAmount, { color: '#7C3AED' }]}>{Number(profile.wallet.bonusBalance).toLocaleString('ar-SA')} ر.س</Text>
          </View>
        </View>
      )}

      {/* Technician Stats */}
      {profile?.technician && (
        <View style={styles.techStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {Number(profile.technician.ratingAvg || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>التقييم</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.technician.totalReviews || 0}</Text>
            <Text style={styles.statLabel}>تقييم</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.technician.completedBookings || 0}</Text>
            <Text style={styles.statLabel}>حجز مكتمل</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: profile.technician.kycStatus === 'VERIFIED' ? '#10B981' : '#F59E0B' }]}>
              {profile.technician.kycStatus === 'VERIFIED' ? '✅' : '⏳'}
            </Text>
            <Text style={styles.statLabel}>التوثيق</Text>
          </View>
        </View>
      )}

      {/* Menu */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>الإشعارات</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Wishlist')}>
          <Text style={styles.menuIcon}>❤️</Text>
          <Text style={styles.menuText}>المفضلة</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        {isTechnician && (
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('قريباً', 'المزامنة مع تقويم قوقل ستتوفر قريباً')}>
            <Text style={styles.menuIcon}>📅</Text>
            <Text style={styles.menuText}>ربط تقويم قوقل</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('قريباً', 'تصدير البيانات سيتوفر قريباً')}>
          <Text style={styles.menuIcon}>📤</Text>
          <Text style={styles.menuText}>تصدير بياناتي</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Referral */}
      {user?.role === 'CUSTOMER' && (
        <TouchableOpacity style={styles.referralBanner} onPress={() => Alert.alert('برنامج الإحالة', 'شاركي رمز الإحالة الخاص بكِ واربحِي ٢٠ ر.س لكل صديقة تكمل حجزها الأول!')}>
          <Text style={{ fontSize: 18 }}>👥</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: '#7C3AED' }}>برنامج الإحالة</Text>
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>اربحِي ٢٠ ر.س لكل صديقة تنضم</Text>
          </View>
          <Text style={{ color: '#7C3AED', fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#fff', padding: 28, borderRadius: 20, alignItems: 'center', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  role: { fontSize: 13, color: '#7C3AED', marginTop: 4, fontWeight: '600' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  streakBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFBEB', padding: 14, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
  streakTitle: { fontWeight: '700', color: '#92400E', fontSize: 14 },
  streakSub: { fontSize: 12, color: '#A16207', marginTop: 2 },
  walletCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 18, borderRadius: 14, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  walletLabel: { fontSize: 12, color: '#9CA3AF' },
  walletAmount: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 4 },
  techStats: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  menu: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, color: '#374151' },
  menuArrow: { fontSize: 20, color: '#D1D5DB' },
  referralBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5F3FF', padding: 14, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#EDE9FE' },
  logoutBtn: { backgroundColor: '#FEE2E2', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
});
