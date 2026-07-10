import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login/index" options={{ title: 'تسجيل الدخول' }} />
        <Stack.Screen name="(auth)/register/index" options={{ title: 'إنشاء حساب' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="services/[id]" options={{ title: 'تفاصيل الخدمة' }} />
        <Stack.Screen name="tech/dashboard/index" options={{ title: 'لوحة الفنية' }} />
        <Stack.Screen name="tech/slots/index" options={{ title: 'المواعيد' }} />
        <Stack.Screen name="admin/dashboard/index" options={{ title: 'لوحة الإدارة' }} />
      </Stack>
    </QueryClientProvider>
  );
}
