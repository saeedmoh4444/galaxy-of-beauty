/**
 * Push Notification Hook — Expo Notifications integration
 *
 * Usage:
 *   const { expoPushToken, scheduleReminder } = useNotifications();
 *   // Send expoPushToken to backend for push delivery
 *   // Call scheduleReminder(bookingId, date) for appointment reminders
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { notificationRoute } from '@/utils/vendorOrders';
import { trpc } from '@/lib/trpc-react';
import { useAuthState } from '@/hooks/useAuthState';
import { useLocale } from '@/components/LocaleProvider';

interface NotificationResponse {
  notification?: {
    request?: {
      content?: {
        data?: { bookingId?: number; type?: string; orderId?: string };
      };
    };
  };
}

interface NotificationsModule {
  setNotificationHandler(config: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }): void;
  addNotificationReceivedListener(callback: (notification: unknown) => void): { remove(): void };
  addNotificationResponseReceivedListener(callback: (response: NotificationResponse) => void): {
    remove(): void;
  };
  scheduleNotificationAsync(options: {
    content: {
      title: string;
      body: string;
      data: { bookingId: number; type: string };
    };
    trigger: { date: Date };
  }): Promise<void>;
  getPermissionsAsync(): Promise<{ status: string }>;
  requestPermissionsAsync(): Promise<{ status: string }>;
  setNotificationChannelAsync(
    channelId: string,
    options: { name: string; importance: number },
  ): Promise<void>;
  getExpoPushTokenAsync(options: { projectId: string }): Promise<{ data: string }>;
  AndroidImportance: { MAX: number };
}

let Notifications: NotificationsModule = null as unknown as NotificationsModule;
try {
  // expo-notifications is an optional dependency — require dynamically with fallback
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
} catch {
  /* expo-notifications not installed */
}

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // D3 — the token was fetched but NEVER sent to the backend, so push
  // could not reach the server. Register it once the session exists.
  const registerToken = trpc.notifications.registerPushToken.useMutation();

  useEffect(() => {
    if (!Notifications) return;
    registerForPushNotifications()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          setPermissionGranted(true);
          if (isAuthed) {
            registerToken.mutate({
              token,
              platform: Platform.OS === 'ios' ? 'ios' : 'android',
            });
          }
        }
      })
      .catch(() => {});

    const sub = Notifications.addNotificationReceivedListener(() => {});
    const tapSub = Notifications.addNotificationResponseReceivedListener(
      (response: NotificationResponse) => {
        // E2 — push deep links: store_order_placed opens the order detail.
        const data = response?.notification?.request?.content?.data;
        const route = notificationRoute(data);
        if (route) {
          router.push(route as never);
        }
      },
    );

    return () => {
      sub?.remove?.();
      tapSub?.remove?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- register on mount only
  }, [isAuthed]);

  const scheduleReminder = useCallback(
    async (bookingId: number, date: Date, title: string) => {
      if (!permissionGranted || !Notifications) return;
      const reminderTime = new Date(date.getTime() - 60 * 60 * 1000);
      if (reminderTime <= new Date()) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('mobile.notifications.reminder-title'),
          body: `${title} — ${t('mobile.notifications.reminder-body')}`,
          data: { bookingId, type: 'reminder' },
        },
        trigger: { date: reminderTime },
      });
    },
    [permissionGranted, t],
  );

  return { expoPushToken, permissionGranted, scheduleReminder };
}

async function registerForPushNotifications(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // Get Expo push token
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const token = await Notifications.getExpoPushTokenAsync({
    // D3 — must be the EAS project UUID from app.json (the old literal
    // 'galaxy-of-beauty' is not a valid projectId and breaks the call).
    projectId: 'fe529822-25a6-4c65-9bec-38fe925d1ae3',
  });
  return token.data;
}
