/**
 * useNotifications Hook
 * Initializes push notifications and handles notification responses
 */

import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  savePushToken,
  schedulePreflightNotification,
  addNotificationResponseListener,
} from "@/services/notifications";
import { usePreflightStore } from "@/store/usePreflightStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useReminderStore } from "@/store/useReminderStore";

export function useNotifications() {
  const router = useRouter();
  const notificationResponseListener = useRef<Notifications.Subscription>();

  const { showPreflightModal } = usePreflightStore();
  const { isPro } = useSubscriptionStore();
  const { settings: reminderSettings } = useReminderStore();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        savePushToken(token);
      }
    });

    // Handle notification taps
    notificationResponseListener.current = addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === "preflight" && data?.action === "review") {
          // Open the Pre-Flight Check modal
          showPreflightModal();
        }
      }
    );

    return () => {
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(
          notificationResponseListener.current
        );
      }
    };
  }, []);

  // Schedule Pre-Flight notifications when auto-reminders are enabled
  useEffect(() => {
    if (isPro && reminderSettings?.enabled) {
      // Schedule daily at 9 AM (could be user-configurable)
      schedulePreflightNotification(9, 0);
    }
  }, [isPro, reminderSettings?.enabled]);

  return null;
}
