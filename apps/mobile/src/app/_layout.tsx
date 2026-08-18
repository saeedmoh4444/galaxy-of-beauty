import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import SocketProvider from '@/components/SocketProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/Toast';
import { TRPCProvider } from '@/lib/trpc-react';
import { loadAuthToken } from '@/lib/authToken';
import { LocaleProvider, useLocale } from '@/components/LocaleProvider';

function RootNavigator() {
  const { t } = useLocale();
  useEffect(() => {
    // Restore the persisted access token so authenticated screens work after restart
    void loadAuthToken();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <TRPCProvider>
          <SocketProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen
                name="(auth)/login/index"
                options={{ title: t('mobile.auth.loginTitle') }}
              />
              <Stack.Screen
                name="(auth)/register/index"
                options={{ title: t('mobile.auth.registerTitle') }}
              />
              <Stack.Screen
                name="(auth)/forgot-password/index"
                options={{ title: t('mobile.auth.forgotTitle') }}
              />
              <Stack.Screen
                name="(auth)/reset-password/index"
                options={{ title: t('mobile.auth.resetTitle') }}
              />
              <Stack.Screen
                name="(auth)/verify-email/index"
                options={{ title: t('mobile.auth.verifyTitle') }}
              />
              <Stack.Screen
                name="(auth)/2fa/index"
                options={{ title: t('mobile.auth.twoFactorTitle') }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="services/[id]" options={{ title: t('mobile.serviceDetails') }} />
              <Stack.Screen
                name="services/surprise-me/index"
                options={{ title: t('mobile.surpriseMe') }}
              />
              <Stack.Screen name="technicians/index" options={{ title: t('mobile.technicians') }} />
              <Stack.Screen
                name="technicians/[id]/index"
                options={{ title: t('mobile.technicianProfile') }}
              />
              <Stack.Screen
                name="gallery/[technicianId]/index"
                options={{ title: t('mobile.gallery') }}
              />
              <Stack.Screen name="marketplace/index" options={{ title: t('mobile.marketplace') }} />
              <Stack.Screen name="compare/index" options={{ title: t('mobile.compareServices') }} />
              <Stack.Screen
                name="subscription-boxes/index"
                options={{ title: t('mobile.monthlyBoxes') }}
              />
              <Stack.Screen
                name="customer/video/[bookingId]/index"
                options={{ title: t('mobile.videoConsult') }}
              />
              <Stack.Screen
                name="customer/video/[bookingId]/room/index"
                options={{ title: t('mobile.videoRoom') }}
              />

              {/* Customer screens */}
              <Stack.Screen
                name="customer/addresses/index"
                options={{ title: t('mobile.addresses') }}
              />
              <Stack.Screen
                name="customer/wishlist/index"
                options={{ title: t('mobile.wishlist') }}
              />
              <Stack.Screen
                name="customer/waitlist/index"
                options={{ title: t('mobile.waitlist') }}
              />
              <Stack.Screen
                name="customer/notifications/index"
                options={{ title: t('mobile.notifications') }}
              />
              <Stack.Screen
                name="customer/reviews/index"
                options={{ title: t('mobile.myReviews') }}
              />
              <Stack.Screen
                name="customer/referrals/index"
                options={{ title: t('mobile.referrals') }}
              />
              <Stack.Screen
                name="customer/streaks/index"
                options={{ title: t('mobile.streaks') }}
              />
              <Stack.Screen
                name="customer/disputes/index"
                options={{ title: t('mobile.disputes') }}
              />
              <Stack.Screen
                name="customer/ai-chat/index"
                options={{ title: t('mobile.beautyGalaxy') }}
              />
              <Stack.Screen
                name="customer/subscriptions/index"
                options={{ title: t('mobile.subscriptions') }}
              />
              <Stack.Screen
                name="customer/saved-cards/index"
                options={{ title: t('mobile.savedCards') }}
              />
              <Stack.Screen
                name="customer/bookings/create/index"
                options={{ title: t('mobile.newBooking') }}
              />
              <Stack.Screen
                name="customer/skin-analysis/index"
                options={{ title: t('mobile.skinAnalysis') }}
              />
              <Stack.Screen
                name="customer/loyalty/index"
                options={{ title: t('mobile.loyalty') }}
              />
              <Stack.Screen name="customer/promo/index" options={{ title: t('mobile.promo') }} />

              {/* Technician screens */}
              <Stack.Screen
                name="tech/dashboard/index"
                options={{ title: t('mobile.techDashboard') }}
              />
              <Stack.Screen name="tech/slots/index" options={{ title: t('mobile.slots') }} />
              <Stack.Screen
                name="tech/bookings/index"
                options={{ title: t('mobile.myBookings') }}
              />
              <Stack.Screen name="tech/earnings/index" options={{ title: t('mobile.earnings') }} />
              <Stack.Screen name="tech/profile/index" options={{ title: t('mobile.myProfile') }} />
              <Stack.Screen name="tech/calendar/index" options={{ title: t('mobile.calendar') }} />

              {/* Admin screens */}
              <Stack.Screen
                name="admin/dashboard/index"
                options={{ title: t('mobile.adminDashboard') }}
              />
              <Stack.Screen name="admin/users/index" options={{ title: t('mobile.users') }} />
              <Stack.Screen name="admin/bookings/index" options={{ title: t('mobile.bookings') }} />
              <Stack.Screen
                name="admin/finance/index"
                options={{ title: t('mobile.adminFinance') }}
              />
              <Stack.Screen
                name="admin/categories/index"
                options={{ title: t('mobile.categories') }}
              />
              <Stack.Screen name="admin/services/index" options={{ title: t('mobile.services') }} />
              <Stack.Screen
                name="admin/technicians/index"
                options={{ title: t('mobile.technicians') }}
              />
              <Stack.Screen
                name="admin/analytics/index"
                options={{ title: t('mobile.analytics') }}
              />
              <Stack.Screen name="admin/disputes/index" options={{ title: t('mobile.disputes') }} />
              <Stack.Screen name="admin/zatca/index" options={{ title: t('mobile.zatca') }} />
              <Stack.Screen name="admin/settings/index" options={{ title: t('mobile.settings') }} />
            </Stack>
          </SocketProvider>
        </TRPCProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <LocaleProvider>
      <RootNavigator />
    </LocaleProvider>
  );
}
