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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Notifications: any = null;
try {
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
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!Notifications) return;
    registerForPushNotifications()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          setPermissionGranted(true);
        }
      })
      .catch(() => {});

    const sub = Notifications.addNotificationReceivedListener(() => {});
    const tapSub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response?.notification?.request?.content?.data;
      if (data?.bookingId) {
        /* navigate to booking detail */
      }
    });

    return () => {
      sub?.remove?.();
      tapSub?.remove?.();
    };
  }, []);

  const scheduleReminder = useCallback(
    async (bookingId: number, date: Date, title: string) => {
      if (!permissionGranted || !Notifications) return;
      const reminderTime = new Date(date.getTime() - 60 * 60 * 1000);
      if (reminderTime <= new Date()) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: ' تذكير بالموعد',
          body: `${title} - بعد ساعة من الآن`,
          data: { bookingId, type: 'reminder' },
        },
        trigger: { date: reminderTime },
      });
    },
    [permissionGranted],
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
    projectId: 'galaxy-of-beauty',
  });
  return token.data;
}
