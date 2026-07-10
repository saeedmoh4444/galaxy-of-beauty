import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home/index" options={{ title: 'الرئيسية' }} />
      <Tabs.Screen name="services/index" options={{ title: 'الخدمات' }} />
      <Tabs.Screen name="bookings/index" options={{ title: 'حجوزاتي' }} />
      <Tabs.Screen name="wallet/index" options={{ title: 'المحفظة' }} />
      <Tabs.Screen name="profile/index" options={{ title: 'حسابي' }} />
    </Tabs>
  );
}
