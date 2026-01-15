/**
 * Push Notifications Service
 * Handles scheduling and managing push notifications for Pre-Flight Check
 *
 * SETUP REQUIRED:
 * 1. Run: npx expo install expo-notifications expo-device
 * 2. Add notification permissions to app.json
 * 3. Configure push notification credentials in EAS
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and get push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Must be a physical device
  if (!Device.isDevice) {
    console.log("[Notifications] Push notifications require a physical device");
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Notifications] Permission not granted");
    return null;
  }

  // Get the Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const pushToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    token = pushToken.data;
    console.log("[Notifications] Push token:", token);
  } catch (error) {
    console.error("[Notifications] Error getting push token:", error);
  }

  // Configure Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("preflight", {
      name: "Pre-Flight Check",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#007AFF",
    });
  }

  return token;
}

/**
 * Save push token to user profile
 */
export async function savePushToken(token: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ push_token: token })
      .eq("id", user.id);

    console.log("[Notifications] Push token saved to profile");
  } catch (error) {
    console.error("[Notifications] Error saving push token:", error);
  }
}

/**
 * Schedule daily Pre-Flight Check notification
 * Default: 9 AM local time
 */
export async function schedulePreflightNotification(
  hour: number = 9,
  minute: number = 0
): Promise<string | null> {
  try {
    // Cancel any existing preflight notifications first
    await cancelPreflightNotifications();

    // Schedule new daily notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🛡️ Bad Cop Pre-Flight Check",
        body: "Review today's reminders before they go out",
        data: { type: "preflight", action: "review" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log(`[Notifications] Pre-flight scheduled for ${hour}:${minute.toString().padStart(2, "0")}`);
    return identifier;
  } catch (error) {
    console.error("[Notifications] Error scheduling preflight:", error);
    return null;
  }
}

/**
 * Cancel all Pre-Flight notifications
 */
export async function cancelPreflightNotifications(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduled) {
      if (notification.content.data?.type === "preflight") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    console.log("[Notifications] Pre-flight notifications cancelled");
  } catch (error) {
    console.error("[Notifications] Error cancelling notifications:", error);
  }
}

/**
 * Send immediate Pre-Flight notification (for testing or manual trigger)
 */
export async function sendImmediatePreflightNotification(
  clientCount: number,
  totalAmount: number
): Promise<void> {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(totalAmount / 100);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🛡️ Bad Cop Ready",
      body: `${clientCount} reminder${clientCount !== 1 ? "s" : ""} pending (${formattedAmount}). Tap to review.`,
      data: { type: "preflight", action: "review" },
      sound: true,
    },
    trigger: null, // Immediate
  });
}

/**
 * Add listener for notification responses (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add listener for received notifications (when notification arrives)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
