import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { useHaptics } from '@/hooks/useHaptics';
import { BottomSheet } from '@/components/BottomSheet';
import { themeColors, useTheme } from '@/components/ThemeProvider';
import { trpc } from '@/lib/trpc-react';
import {
  TourStep,
  Walkthrough,
  WalkthroughProvider,
  type WalkthroughStep,
} from '@/components/Walkthrough';

/** §3.6 — first-run tour storage key (same gate as the web dashboard). */
const TOUR_STORAGE_KEY = 'gob_tour_v1';

// AsyncStorage is an optional dependency in this repo — loaded
// dynamically with a silent no-op fallback (ThemeProvider pattern).
function loadStored(key: string): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.getItem(key);
  } catch {
    return Promise.resolve(null);
  }
}

function storeStored(key: string, value: string): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.setItem(key, value).catch(() => {});
  } catch {
    // no storage — non-fatal (private/incognito style environments)
  }
}

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
  warning: '#f59e0b',
};

const QUICK_ACTIONS = [
  {
    name: 'book',
    icon: '💅',
    labelKey: 'beautyDashboard.quick-book',
    href: '/customer/bookings/create',
  },
  { name: 'wallet', icon: '💳', labelKey: 'beautyDashboard.quick-wallet', href: '/(tabs)/wallet' },
  { name: 'ai', icon: '🤖', labelKey: 'beautyDashboard.quick-ai', href: '/customer/ai-assistant' },
  {
    name: 'wellness',
    icon: '🌿',
    labelKey: 'beautyDashboard.quick-wellness',
    href: '/customer/wellness-hub',
  },
  {
    name: 'referrals',
    icon: '💝',
    labelKey: 'beautyDashboard.quick-referrals',
    href: '/customer/referrals',
  },
] as const;

export default function BeautyDashboardScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const isAuthed = useAuthState();
  const { trigger } = useHaptics();
  const { isDark } = useTheme();
  const sheetC = isDark ? themeColors.dark : themeColors.light;
  const [tourOpen, setTourOpen] = useState(false);
  // 5.5 Mobile polish — bottom sheet for secondary quick actions.
  const [moreOpen, setMoreOpen] = useState(false);
  const MORE_ACTIONS = [
    { icon: '👨‍👩‍👧', labelKey: 'beautyDashboard.more-family', href: '/customer/family-account' },
    { icon: '🎁', labelKey: 'beautyDashboard.more-gift-cards', href: '/customer/gift-cards' },
    { icon: '❤️', labelKey: 'beautyDashboard.more-wishlist', href: '/customer/wishlist' },
    { icon: '⚡', labelKey: 'beautyDashboard.more-flash-deals', href: '/public/flash-deals' },
    { icon: '🛍️', labelKey: 'beautyDashboard.more-stores', href: '/customer/stores' },
  ] as const;
  const loyalty = trpc.loyalty.myAccount.useQuery(undefined, { enabled: isAuthed });
  const insights = trpc.analytics.customerInsights.useQuery(undefined, { enabled: isAuthed });
  // 3.3 — proactive AI advisor (deterministic insights, same engine as
  // the daily sweep).
  const advisor = trpc.beautyInsights.advisor.useQuery(undefined, { enabled: isAuthed });
  const advisorInsights = (advisor.data as unknown as Array<Record<string, unknown>>) ?? [];
  const lData = loyalty.data as Record<string, unknown> | undefined;
  const iData = insights.data as Record<string, unknown> | undefined;

  // First-run auto-start: once per device, mirrors the web dashboard
  // gate (storage + settle delay + fire-time re-check).
  useEffect(() => {
    if (!isAuthed) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    void loadStored(TOUR_STORAGE_KEY).then((stored) => {
      if (stored === 'done') return;
      timer = setTimeout(() => {
        void loadStored(TOUR_STORAGE_KEY).then((storedAtFire) => {
          // Re-check at fire time: the user may have skipped/completed
          // during the settle delay — re-opening would yank them back
          // to step 1 mid-session.
          if (storedAtFire === 'done') return;
          setTourOpen(true);
        });
      }, 800);
    });
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthed]);

  // Stable identity so the Walkthrough never re-settles on parent
  // re-renders (same fix as the web kit).
  const closeTour = useCallback((_reason: 'complete' | 'skip') => {
    storeStored(TOUR_STORAGE_KEY, 'done');
    setTourOpen(false);
  }, []);

  const tourSteps: WalkthroughStep[] = useMemo(
    () => [
      { target: 'book', title: t('mobile.tour.bookTitle'), body: t('mobile.tour.bookBody') },
      { target: 'wallet', title: t('mobile.tour.walletTitle'), body: t('mobile.tour.walletBody') },
      { target: 'ai', title: t('mobile.tour.aiTitle'), body: t('mobile.tour.aiBody') },
      {
        target: 'wellness',
        title: t('mobile.tour.wellnessTitle'),
        body: t('mobile.tour.wellnessBody'),
      },
      {
        target: 'referrals',
        title: t('mobile.tour.referralsTitle'),
        body: t('mobile.tour.referralsBody'),
      },
    ],
    [t],
  );

  return (
    <WalkthroughProvider>
      <ScreenState
        isLoading={loyalty.isLoading}
        isError={loyalty.isError}
        isEmpty={!lData && !iData}
        errorMessage={t('beautyDashboard.load-error')}
        onRetry={() => {
          loyalty.refetch();
          insights.refetch();
        }}
      >
        <View testID="beauty-dashboard">
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t('beautyDashboard.title')}</Text>
            <TouchableOpacity
              testID="tour-replay"
              hitSlop={8}
              onPress={() => setTourOpen(true)}
              accessibilityRole="button"
            >
              <Text style={styles.replayText}>{t('beautyDashboard.replay-tour')}</Text>
            </TouchableOpacity>
          </View>

          {/* Quick actions — also the onboarding tour targets (§3.6) */}
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((qa) => (
              <TourStep key={qa.name} name={qa.name} style={styles.quickCell}>
                <TouchableOpacity
                  style={styles.quickBtn}
                  activeOpacity={0.7}
                  onPress={() => router.push(qa.href as never)}
                  accessibilityRole="button"
                >
                  <Text style={styles.quickIcon}>{qa.icon}</Text>
                  <Text style={styles.quickLabel}>{t(qa.labelKey)}</Text>
                </TouchableOpacity>
              </TourStep>
            ))}
            {/* 5.5 Mobile polish — "more" opens the secondary actions sheet. */}
            <View style={styles.quickCell}>
              <TouchableOpacity
                style={styles.quickBtn}
                activeOpacity={0.7}
                onPress={() => {
                  trigger('selection');
                  setMoreOpen(true);
                }}
                accessibilityRole="button"
              >
                <Text style={styles.quickIcon}>✨</Text>
                <Text style={styles.quickLabel}>{t('beautyDashboard.quick-more')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {[
            {
              label: t('beautyDashboard.loyalty-points'),
              value: `${String(lData?.points ?? 0)} `,
              color: COLORS.warning,
            },
            {
              label: t('beautyDashboard.tier'),
              value: (lData?.tier as string) ?? '—',
              color: COLORS.brand,
            },
            {
              label: t('beautyDashboard.bookings'),
              value: String(iData?.bookingCount ?? 0),
              color: COLORS.success,
            },
            {
              label: t('beautyDashboard.spending'),
              value: t('beautyDashboard.sar', { value: String(iData?.totalSpent ?? 0) }),
              color: COLORS.gray900,
            },
          ].map((item, i) => (
            <View key={i} style={styles.card}>
              <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          ))}

          {/* 3.3 — proactive AI advisor insights */}
          {advisorInsights.length > 0 && (
            <View style={styles.advisorCard}>
              <Text style={styles.advisorTitle}>✨ {t('beautyDashboard.advisor-title')}</Text>
              {advisorInsights.slice(0, 3).map((insight, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.advisorRow}
                  onPress={() => {
                    if (insight.link) {
                      router.push(insight.link as never);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.advisorEmoji}>{String(insight.emoji ?? '✨')}</Text>
                  <View style={styles.advisorBody}>
                    <Text style={styles.advisorHead} numberOfLines={1}>
                      {String(insight.titleAr ?? insight.titleEn ?? '')}
                    </Text>
                    <Text style={styles.advisorText} numberOfLines={2}>
                      {String(insight.bodyAr ?? insight.bodyEn ?? '')}
                    </Text>
                  </View>
                  <Text style={styles.advisorArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScreenState>

      <Walkthrough
        open={tourOpen}
        steps={tourSteps}
        onClose={closeTour}
        labels={{
          next: t('mobile.tour.next'),
          back: t('mobile.tour.back'),
          skip: t('mobile.tour.skip'),
          done: t('mobile.tour.done'),
          progress: (current, total) => t('mobile.tour.progress', { current, total }),
        }}
      />

      {/* 5.5 Mobile polish — secondary quick actions bottom sheet. */}
      <BottomSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={t('beautyDashboard.more-title')}
      >
        {MORE_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.labelKey}
            style={styles.moreRow}
            activeOpacity={0.7}
            onPress={() => {
              setMoreOpen(false);
              trigger('light');
              router.push(a.href as never);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.moreIcon}>{a.icon}</Text>
            <Text style={[styles.moreLabel, { color: sheetC.text }]}>{t(a.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </WalkthroughProvider>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
  },
  replayText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brand,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  quickCell: {
    width: '47%',
  },
  quickBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickIcon: {
    fontSize: 20,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray900,
    flexShrink: 1,
  },
  // 5.5 Mobile polish — bottom sheet rows.
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  moreIcon: { fontSize: 20 },
  moreLabel: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  value: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, color: COLORS.gray400 },
  // 3.3 — proactive AI advisor insights
  advisorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.brand,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  advisorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.brand,
    marginBottom: 8,
  },
  advisorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  advisorEmoji: { fontSize: 18 },
  advisorBody: { flex: 1 },
  advisorHead: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
  advisorText: { fontSize: 12, color: COLORS.gray400, marginTop: 1 },
  advisorArrow: { fontSize: 18, color: '#d1d5db' },
});
