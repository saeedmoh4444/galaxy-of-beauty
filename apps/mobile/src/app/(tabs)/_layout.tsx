import { Tabs } from 'expo-router';
import { useLocale } from '@/components/LocaleProvider';

export default function TabLayout() {
  const { t } = useLocale();
  return (
    // 5.1 — smooth cross-fade between tabs (reduced-motion users can
    // disable animations at the OS level; RN respects that for native
    // driver animations).
    <Tabs screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Tabs.Screen name="home/index" options={{ title: t('nav.home') }} />
      <Tabs.Screen name="services/index" options={{ title: t('nav.services') }} />
      <Tabs.Screen name="bookings/index" options={{ title: t('nav.myBookings') }} />
      <Tabs.Screen name="wallet/index" options={{ title: t('nav.wallet') }} />
      <Tabs.Screen name="profile/index" options={{ title: t('mobile.core.myAccount') }} />
    </Tabs>
  );
}
