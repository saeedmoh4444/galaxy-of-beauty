import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import SocketProvider from '@/components/SocketProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/Toast';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login/index" options={{ title: 'تسجيل الدخول' }} />
        <Stack.Screen name="(auth)/register/index" options={{ title: 'إنشاء حساب' }} />
        <Stack.Screen name="(auth)/forgot-password/index" options={{ title: 'نسيت كلمة المرور' }} />
        <Stack.Screen name="(auth)/reset-password/index" options={{ title: 'إعادة تعيين كلمة المرور' }} />
        <Stack.Screen name="(auth)/verify-email/index" options={{ title: 'توثيق البريد الإلكتروني' }} />
        <Stack.Screen name="(auth)/2fa/index" options={{ title: 'المصادقة الثنائية' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="services/[id]" options={{ title: 'تفاصيل الخدمة' }} />
        <Stack.Screen name="services/surprise-me/index" options={{ title: 'فاجئيني' }} />
        <Stack.Screen name="technicians/index" options={{ title: 'الفنيات' }} />
        <Stack.Screen name="technicians/[id]/index" options={{ title: 'ملف الفنية' }} />
        <Stack.Screen name="gallery/[technicianId]/index" options={{ title: 'معرض الأعمال' }} />
        <Stack.Screen name="marketplace/index" options={{ title: 'متجر المنتجات' }} />
        <Stack.Screen name="compare/index" options={{ title: 'مقارنة الخدمات' }} />
        <Stack.Screen name="subscription-boxes/index" options={{ title: 'الصناديق الشهرية' }} />
        <Stack.Screen name="customer/video/[bookingId]/index" options={{ title: 'استشارة فيديو' }} />
        <Stack.Screen name="customer/video/[bookingId]/room/index" options={{ title: 'غرفة الفيديو' }} />

        {/* Customer screens */}
        <Stack.Screen name="customer/addresses/index" options={{ title: 'العناوين' }} />
        <Stack.Screen name="customer/wishlist/index" options={{ title: 'المفضلة' }} />
        <Stack.Screen name="customer/waitlist/index" options={{ title: 'قائمة الانتظار' }} />
        <Stack.Screen name="customer/notifications/index" options={{ title: 'الإشعارات' }} />
        <Stack.Screen name="customer/reviews/index" options={{ title: 'تقييماتي' }} />
        <Stack.Screen name="customer/referrals/index" options={{ title: 'الإحالات' }} />
        <Stack.Screen name="customer/streaks/index" options={{ title: 'الاستمرارية' }} />
        <Stack.Screen name="customer/disputes/index" options={{ title: 'النزاعات' }} />
        <Stack.Screen name="customer/ai-chat/index" options={{ title: 'لايلى' }} />
        <Stack.Screen name="customer/subscriptions/index" options={{ title: 'الاشتراكات' }} />
        <Stack.Screen name="customer/saved-cards/index" options={{ title: 'البطاقات المحفوظة' }} />
        <Stack.Screen name="customer/bookings/create/index" options={{ title: 'حجز جديد' }} />
        <Stack.Screen name="customer/skin-analysis/index" options={{ title: 'تحليل البشرة' }} />
        <Stack.Screen name="customer/loyalty/index" options={{ title: 'الولاء' }} />
        <Stack.Screen name="customer/promo/index" options={{ title: 'كود الخصم' }} />

        {/* Technician screens */}
        <Stack.Screen name="tech/dashboard/index" options={{ title: 'لوحة الفنية' }} />
        <Stack.Screen name="tech/slots/index" options={{ title: 'المواعيد' }} />
        <Stack.Screen name="tech/bookings/index" options={{ title: 'حجوزاتي' }} />
        <Stack.Screen name="tech/earnings/index" options={{ title: 'الأرباح' }} />
        <Stack.Screen name="tech/profile/index" options={{ title: 'ملفي الشخصي' }} />
        <Stack.Screen name="tech/calendar/index" options={{ title: 'التقويم' }} />

        {/* Admin screens */}
        <Stack.Screen name="admin/dashboard/index" options={{ title: 'لوحة الإدارة' }} />
        <Stack.Screen name="admin/users/index" options={{ title: 'المستخدمين' }} />
        <Stack.Screen name="admin/bookings/index" options={{ title: 'الحجوزات' }} />
        <Stack.Screen name="admin/finance/index" options={{ title: 'الإدارة المالية' }} />
        <Stack.Screen name="admin/categories/index" options={{ title: 'الأقسام' }} />
        <Stack.Screen name="admin/services/index" options={{ title: 'الخدمات' }} />
        <Stack.Screen name="admin/technicians/index" options={{ title: 'الفنيات' }} />
        <Stack.Screen name="admin/analytics/index" options={{ title: 'التحليلات' }} />
        <Stack.Screen name="admin/disputes/index" options={{ title: 'النزاعات' }} />
        <Stack.Screen name="admin/zatca/index" options={{ title: 'زاتكا' }} />
        <Stack.Screen name="admin/settings/index" options={{ title: 'الإعدادات' }} />
      </Stack>
        </SocketProvider>
      </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
