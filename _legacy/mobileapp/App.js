import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { LogBox, Platform, Alert, View, Text, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import i18n from './src/i18n';
import api from './src/lib/api';
import { resolveDeepLink } from './src/utils/deepLinks';
import ChatbotWidget from './src/components/ChatbotWidget';
import { initializeOfflineSupport } from './src/utils/offlineQueue';

LogBox.ignoreLogs(['Non-serializable values', 'expo-notifications']);

// Detect if running in Expo Go (not a dev build)
const isExpoGo = Constants.appOwnership === 'expo';
const shouldSkipNotifications = isExpoGo;

// Error boundary to catch runtime crashes on device
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#DC2626', marginBottom: 12, textAlign: 'center' }}>عذراً، حدث خطأ</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>{this.state.error?.message || 'Unknown error'}</Text>
          <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>{this.state.error?.stack?.slice(0, 500)}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

// Configure notification handler (skip on Android Expo Go — FCM removed since SDK 53)
if (!shouldSkipNotifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }),
  });
}

async function registerPushToken() {
  if (shouldSkipNotifications) return;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas?.projectId })).data;
    await api.post('/notifications/register-push-token', { token, platform: Platform.OS });
  } catch { /* non-critical */ }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const { isAuthenticated } = useAuthStore();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => { initialize(); }, []);

  // Initialize offline support
  useEffect(() => {
    const unsubscribe = initializeOfflineSupport();
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  useEffect(() => {
    if (isAuthenticated) registerPushToken();
  }, [isAuthenticated]);

  useEffect(() => {
    if (shouldSkipNotifications) return;
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener((res) => {
      const notification = res.notification.request.content;
      const deepLink = resolveDeepLink({ data: notification.data, type: notification.data?.type });

      if (deepLink) {
        // Store the navigation target for AppNavigator to consume
        // The navigation ref will pick this up on next render
        global.__pendingDeepLink = deepLink;
      }
    });
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <AppNavigator />
            <ChatbotWidget />
            <StatusBar style="auto" />
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
