import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import type { TranslationKey } from '@galaxy/shared';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { setAuthToken, getAuthToken } from '@/lib/authToken';
import { setSocketToken } from '@/hooks/useSocket';
import { useLocale } from '@/components/LocaleProvider';
import { useTheme, type ThemeMode } from '@/components/ThemeProvider';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray50: '#faf5ff',
  gray400: '#6b7280',
  gray900: '#111827',
  danger: '#dc2626',
};

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];

// Mode labels are not in the i18n catalog (theme keys are web-only), so the
// current mode is shown as icon + short English label.
const MODE_DISPLAY: Record<ThemeMode, { icon: string; label: string }> = {
  light: { icon: '☀️', label: 'Light' },
  dark: { icon: '🌙', label: 'Dark' },
  system: { icon: '⚙️', label: 'System' },
};

const MENU_ITEMS: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: 'mobile.core.bookingsTitle', href: '/customer/bookings' },
  { labelKey: 'mobile.core.menuWishlist', href: '/customer/wishlist' },
  { labelKey: 'mobile.core.menuLoyalty', href: '/customer/loyalty' },
  { labelKey: 'tech.dashboard.edit-profile', href: '/customer/profile' },
  { labelKey: 'mobile.core.menuAddresses', href: '/customer/addresses' },
  { labelKey: 'mobile.core.menuSavedCards', href: '/customer/saved-cards' },
  { labelKey: 'mobile.core.menuReferrals', href: '/customer/referrals' },
  { labelKey: 'mobile.core.menuCommunity', href: '/customer/community' },
  { labelKey: 'mobile.core.menuAcademy', href: '/customer/beauty-academy' },
  { labelKey: 'wellness.title', href: '/customer/wellness' },
  { labelKey: 'mobile.core.menuNotifications', href: '/customer/notifications' },
  { labelKey: 'mobile.core.aiAssistantHelp', href: '/customer/ai-chat' },
];

interface ProfileUser {
  name?: string;
  email?: string;
}

export default function ProfileScreen(): JSX.Element {
  const router = useRouter();
  const { locale, t, setLocale } = useLocale();
  const { mode, setMode } = useTheme();
  const profile = trpc.users.getMe.useQuery() ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const loyalty = trpc.loyalty.myAccount.useQuery();
  // Auth-gated: the profile tab renders for guests too (pre-login state)
  // and must not fire the authenticated kindness query for them.
  const kindness = trpc.kindnessPoints.getStatus.useQuery(undefined, {
    enabled: !!getAuthToken(),
  });
  const p = profile.data as ProfileUser | null;

  const logout = trpc.auth.logout.useMutation({
    // Local logout always succeeds even if the server call fails
    onSettled: () => {
      void setAuthToken(null);
      setSocketToken(null);
      router.replace('/(auth)/login');
    },
  });

  return (
    <ScreenState
      isLoading={profile.isLoading}
      isError={profile.isError}
      isEmpty={false}
      errorMessage={t('profile.load-error')}
      onRetry={() => profile.refetch()}
    >
      <Text style={styles.title}>{t('mobile.core.profileTitle')}</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{p?.name?.[0] ?? ''}</Text>
        </View>
        <Text style={styles.userName}>{p?.name ?? t('mobile.core.beautyGalaxyUser')}</Text>
        <Text style={styles.userEmail}>{p?.email ?? ''}</Text>
        {/* Loyalty + Kindness Stats */}
        <View style={styles.statsRow}>
          {loyalty?.data && (
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{loyalty.data.points ?? 0}</Text>
              <Text style={styles.statLbl}>{t('mobile.core.pointsLabel')}</Text>
            </View>
          )}
          {kindness?.data && (
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{kindness.data.points ?? 0}</Text>
              <Text style={styles.statLbl}>{t('mobile.core.kindnessLabel')}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.langRow}
        onPress={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
        activeOpacity={0.6}
      >
        <Text style={styles.langLabel}>{t('profile.language')}</Text>
        <Text style={styles.langValue}>{locale === 'ar' ? t('profile.arabic') : 'English'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.langRow}
        onPress={() => setMode(THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length])}
        activeOpacity={0.6}
      >
        <Text style={styles.langLabel}>{t('mobile.nightMode.title')}</Text>
        <Text style={styles.langValue}>
          {MODE_DISPLAY[mode].icon} {MODE_DISPLAY[mode].label}
        </Text>
      </TouchableOpacity>
      <ScrollView style={styles.menuList}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.menuItem}
            onPress={() => router.push(item.href as never)}
            activeOpacity={0.6}
          >
            <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.logoutBtn} onPress={() => logout.mutate({})}>
        <Text style={styles.logoutText}>{t('mobile.core.logoutLabel')}</Text>
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
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  langLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  langValue: {
    fontSize: 14,
    color: COLORS.brand,
    fontWeight: '700',
  },
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
