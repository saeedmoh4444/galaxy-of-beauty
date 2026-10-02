import type { JSX } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import type { TranslationKey } from '@galaxy/shared';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { setAuthToken } from '@/lib/authToken';
import { useAuthState } from '@/hooks/useAuthState';
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
  { labelKey: 'mobile.core.menuBeautyDashboard', href: '/customer/beauty-dashboard' },
  { labelKey: 'mobile.core.menuBeautyProfile', href: '/customer/beauty-profile' },
  { labelKey: 'mobile.core.menuCommunity', href: '/customer/community' },
  { labelKey: 'mobile.core.menuAcademy', href: '/customer/beauty-academy' },
  { labelKey: 'wellness.title', href: '/customer/wellness' },
  { labelKey: 'mobile.core.menuNotifications', href: '/customer/notifications' },
  { labelKey: 'nav.more', href: '/public/more' },
  { labelKey: 'mobile.core.aiAssistantHelp', href: '/customer/ai-chat' },
  // M7 nav-hub expansion: hub links for the customer screens that had no
  // inbound navigation. Labels reuse each destination screen's own title key.
  // --- overview & activity ---
  { labelKey: 'dashboard.title', href: '/customer/dashboard' },
  { labelKey: 'mobile.myJourney.title', href: '/customer/my-journey' },
  { labelKey: 'achievements.title', href: '/customer/achievements' },
  { labelKey: 'mobile.loyaltyPunchCard.title', href: '/customer/loyalty-punch-card' },
  { labelKey: 'mobile.streaks.title', href: '/customer/streaks' },
  { labelKey: 'mobile.streakCalendar.title', href: '/customer/streak-calendar' },
  { labelKey: 'birthdayRewards.title', href: '/customer/birthday-rewards' },
  { labelKey: 'favorites.title', href: '/customer/favorites' },
  { labelKey: 'following.title', href: '/customer/following' },
  { labelKey: 'mobile.myReviews', href: '/customer/reviews' },
  { labelKey: 'mobile.serviceHistory.title', href: '/customer/service-history' },
  { labelKey: 'bookingInsights.title', href: '/customer/booking-insights' },
  { labelKey: 'mobile.invoices.title', href: '/customer/invoices' },
  { labelKey: 'beautyEvents.title', href: '/customer/beauty-events' },
  { labelKey: 'mobile.payments.title', href: '/customer/payments' },
  { labelKey: 'cashback.title', href: '/customer/cashback' },
  { labelKey: 'mobile.promo.title', href: '/customer/promo' },
  { labelKey: 'mobile.waitlist.title', href: '/customer/waitlist' },
  // --- beauty profile & AI ---
  { labelKey: 'dnaBeauty.title', href: '/customer/dna-beauty' },
  { labelKey: 'beautyAnalytics.title', href: '/customer/beauty-analytics' },
  { labelKey: 'aiFeed.title', href: '/customer/ai-feed' },
  { labelKey: 'aiRoutine.title', href: '/customer/ai-routine' },
  { labelKey: 'mobile.personalizedFeed.title', href: '/customer/personalized-feed' },
  { labelKey: 'mobile.recommendations.title', href: '/customer/recommendations' },
  { labelKey: 'beautyAdvisor.title', href: '/customer/beauty-advisor' },
  { labelKey: 'beautyDiscovery.title', href: '/customer/beauty-discovery' },
  { labelKey: 'beautyGoals.title', href: '/customer/beauty-goals' },
  { labelKey: 'beautyJournal.title', href: '/customer/beauty-journal' },
  { labelKey: 'beautyDiary.title', href: '/customer/beauty-diary' },
  { labelKey: 'mobile.skinDiary.title', href: '/customer/skin-diary' },
  { labelKey: 'mobile.skinTimeline.title', href: '/customer/skin-timeline' },
  { labelKey: 'mobile.moodBoard.title', href: '/customer/mood-board' },
  { labelKey: 'colorAnalysis.title', href: '/customer/color-analysis' },
  { labelKey: 'mobile.styleMatch.title', href: '/customer/style-match' },
  // --- booking & services ---
  { labelKey: 'advancedBooking.recurringTitle', href: '/customer/advanced-booking' },
  { labelKey: 'mobile.recurring.title', href: '/customer/recurring' },
  { labelKey: 'mobile.reschedule.title', href: '/customer/reschedule' },
  { labelKey: 'emergencyBooking.title', href: '/customer/emergency-booking' },
  { labelKey: 'mobile.smartSchedule.title', href: '/customer/smart-schedule' },
  { labelKey: 'calendarSync.title', href: '/customer/calendar-sync' },
  { labelKey: 'bookingChecklist.title', href: '/customer/booking-checklist' },
  { labelKey: 'mobile.homeService.title', href: '/customer/home-service' },
  { labelKey: 'mobile.groupBookings.title', href: '/customer/group-bookings' },
  { labelKey: 'corporateWellness.title', href: '/customer/corporate-wellness' },
  { labelKey: 'marketing.compare.title', href: '/customer/service-compare' },
  { labelKey: 'mobile.serviceWishlist.title', href: '/customer/service-wishlist' },
  { labelKey: 'mobile.serviceMenuQr.title', href: '/customer/service-menu-qr' },
  { labelKey: 'mobile.serviceWarranty.title', href: '/customer/service-warranty' },
  { labelKey: 'mobile.salonManagement.title', href: '/customer/salon-management' },
  { labelKey: 'mobile.salonMembership.title', href: '/customer/salon-membership' },
  { labelKey: 'franchisePortal.title', href: '/customer/franchise-portal' },
  { labelKey: 'mobile.vendorPortal.title', href: '/customer/vendor-portal' },
  { labelKey: 'mobile.rideHailing.title', href: '/customer/ride-hailing' },
  { labelKey: 'mobile.lastMile.title', href: '/customer/last-mile' },
  { labelKey: 'disputes.title', href: '/customer/disputes' },
  // --- shop & money ---
  { labelKey: 'marketplace.title', href: '/customer/marketplace' },
  { labelKey: 'mobile.giftCardMarket.title', href: '/customer/gift-card-market' },
  { labelKey: 'mobile.giftRegistry.title', href: '/customer/gift-registry' },
  { labelKey: 'mobile.priceDropAlerts.title', href: '/customer/price-drop-alerts' },
  { labelKey: 'mobile.saleAlerts.title', href: '/customer/sale-alerts' },
  { labelKey: 'geofenceOffers.title', href: '/customer/geofence-offers' },
  { labelKey: 'mobile.restockReminder.title', href: '/customer/restock-reminder' },
  { labelKey: 'mobile.productScanner.title', href: '/customer/product-scanner' },
  { labelKey: 'mobile.savingsGoals.title', href: '/customer/savings-goals' },
  { labelKey: 'beautyBudget.title', href: '/customer/beauty-budget' },
  { labelKey: 'beautyBudgetPlanner.title', href: '/customer/beauty-budget-planner' },
  { labelKey: 'beautyExpenses.title', href: '/customer/beauty-expenses' },
  { labelKey: 'bnpl.title', href: '/customer/bnpl' },
  { labelKey: 'mobile.subscriptions.title', href: '/customer/subscriptions' },
  { labelKey: 'mobile.mySubscription.title', href: '/customer/my-subscription' },
  { labelKey: 'boxBuilder.title', href: '/customer/box-builder' },
  { labelKey: 'mobile.rewardsMarketplace.title', href: '/customer/rewards-marketplace' },
  { labelKey: 'beautyRewards.title', href: '/customer/beauty-rewards' },
  { labelKey: 'mobile.vipMembership.title', href: '/customer/vip-membership' },
  // --- guides & self-care ---
  { labelKey: 'mobile.skincareGuide.title', href: '/customer/skincare-guide' },
  { labelKey: 'mobile.hairCareGuide.title', href: '/customer/hair-care-guide' },
  { labelKey: 'mobile.nailCareGuide.title', href: '/customer/nail-care-guide' },
  { labelKey: 'mobile.makeupGuide.title', href: '/customer/makeup-guide' },
  { labelKey: 'mobile.perfumeGuide.title', href: '/customer/perfume-guide' },
  { labelKey: 'mobile.personalCare.title', href: '/customer/personal-care' },
  { labelKey: 'accessoriesGuide.title', href: '/customer/accessories-guide' },
  { labelKey: 'mobile.hairColorSim.title', href: '/customer/hair-color-sim' },
  { labelKey: 'mobile.selfCare.title', href: '/customer/self-care' },
  { labelKey: 'mobile.wellnessTracker.title', href: '/customer/wellness-tracker' },
  { labelKey: 'cycleTracker.title', href: '/customer/cycle-tracker' },
  { labelKey: 'mobile.spaPlanner.title', href: '/customer/spa-planner' },
  { labelKey: 'mobile.postCare.title', href: '/customer/post-care' },
  { labelKey: 'mobile.postTreatment.title', href: '/customer/post-treatment' },
  { labelKey: 'mobile.travelKit.title', href: '/customer/travel-kit' },
  { labelKey: 'mobile.travelKit.title', href: '/customer/travel-checklist' },
  { labelKey: 'familyBeauty.title', href: '/customer/family-beauty' },
  { labelKey: 'mobile.lifeEvents.title', href: '/customer/life-events' },
  { labelKey: 'beautyParty.title', href: '/customer/beauty-party' },
  { labelKey: 'beautyLifestyle.title', href: '/customer/beauty-lifestyle' },
  { labelKey: 'beautyRescue.title', href: '/customer/beauty-rescue' },
  { labelKey: 'allergenChecker.title', href: '/customer/allergen-checker' },
  { labelKey: 'beautyReminders.title', href: '/customer/beauty-reminders' },
  { labelKey: 'beautyRoutine.title', href: '/customer/beauty-routine' },
  { labelKey: 'expiryTracker.title', href: '/customer/expiry-tracker' },
  { labelKey: 'mobile.routineScheduler.title', href: '/customer/routine-scheduler' },
  // --- community, learning & extras ---
  { labelKey: 'beautyCommunity.title', href: '/customer/beauty-community' },
  { labelKey: 'mobile.social.title', href: '/customer/social' },
  { labelKey: 'mobile.socialChallenges.title', href: '/customer/social-challenges' },
  { labelKey: 'challenges.title', href: '/customer/challenges' },
  { labelKey: 'chat.title', href: '/customer/chat' },
  { labelKey: 'mobile.liveChat.title', href: '/customer/live-chat' },
  { labelKey: 'mobile.penPal.title', href: '/customer/pen-pal' },
  { labelKey: 'mobile.inspiration.title', href: '/customer/inspiration' },
  { labelKey: 'mobile.newsletter.title', href: '/customer/newsletter' },
  { labelKey: 'mobile.notificationSettings.title', href: '/customer/notification-settings' },
  { labelKey: 'mobile.nightMode.title', href: '/customer/night-mode' },
  { labelKey: 'mobile.safety.title', href: '/customer/safety' },
  { labelKey: 'mobile.sustainability.title', href: '/customer/sustainability' },
  { labelKey: 'mobile.leadership.title', href: '/customer/leadership' },
  { labelKey: 'beautyMentor.title', href: '/customer/beauty-mentor' },
  { labelKey: 'certificationQuiz.title', href: '/customer/certification-quiz' },
  { labelKey: 'beautyTips.title', href: '/customer/beauty-tips' },
  { labelKey: 'beautyCloset.title', href: '/customer/beauty-closet' },
  { labelKey: 'beautyExtras.title', href: '/customer/beauty-extras' },
  { labelKey: 'beautyServices.title', href: '/customer/beauty-services' },
  { labelKey: 'beautyInnovation.title', href: '/customer/beauty-innovation' },
  { labelKey: 'beautyMetaverse.title', href: '/customer/beauty-metaverse' },
  { labelKey: 'beautyCourses.title', href: '/customer/beauty-courses' },
  { labelKey: 'beautyBingo.title', href: '/customer/beauty-bingo' },
  { labelKey: 'beautyWishlistGifts.title', href: '/customer/beauty-wishlist-gifts' },
  { labelKey: 'mobile.iotSync.title', href: '/customer/iot-sync' },
  { labelKey: 'clinicConnect.title', href: '/customer/clinic-connect' },
  { labelKey: 'mobile.referralDashboard.title', href: '/customer/referral-dashboard' },
  { labelKey: 'mobile.virtualConsultation.title', href: '/customer/virtual-consultation' },
  { labelKey: 'mobile.virtualTryOn.title', href: '/customer/virtual-try-on' },
  { labelKey: 'mobile.techOnboarding.title', href: '/customer/tech-onboarding' },
  { labelKey: 'mobile.waitlist.title', href: '/customer/tech-waitlist' },
];

interface ProfileUser {
  name?: string;
  email?: string;
}

export default function ProfileScreen(): JSX.Element {
  const router = useRouter();
  const { locale, t, setLocale } = useLocale();
  const { mode, setMode } = useTheme();
  const isAuthed = useAuthState();
  const profile = trpc.users.getMe.useQuery(undefined, { enabled: isAuthed }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const loyalty = trpc.loyalty.myAccount.useQuery(undefined, { enabled: isAuthed });
  // Auth-gated: the profile tab renders for guests too (pre-login state)
  // and must not fire the authenticated kindness query for them.
  const kindness = trpc.kindnessPoints.getStatus.useQuery(undefined, {
    enabled: isAuthed,
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
        onPress={() => setMode(THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length]!)}
        activeOpacity={0.6}
      >
        <Text style={styles.langLabel}>{t('mobile.nightMode.title')}</Text>
        <Text style={styles.langValue}>
          {MODE_DISPLAY[mode].icon} {MODE_DISPLAY[mode].label}
        </Text>
      </TouchableOpacity>
      <ScrollView style={styles.menuList} testID="profile-menu">
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
