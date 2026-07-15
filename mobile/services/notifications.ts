import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DAILY_REMINDER_ID = "daily-expense-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

/**
 * Schedules (or reschedules) the daily "did you log today's expenses?" ping.
 * This is a local, on-device trigger — it works fully offline and never
 * touches a server.
 */
export async function scheduleDailyReminder(hour: number, minute: number) {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reminder", {
      name: "Daily expense reminder",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "Manan, what expenses did you have today? 💸",
      body: "Tap to log today's spending in under 10 seconds.",
      data: { screen: "/expenses/add" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});
}

/**
 * Routes notification taps to the screen carried in the payload
 * (`data.screen`, e.g. "/expenses/add"). Handles both the cold-start case
 * (app launched by the tap) and the warm case (app already running).
 * Returns an unsubscribe function.
 */
export function listenForNotificationTaps(navigate: (screen: string) => void): () => void {
  Notifications.getLastNotificationResponseAsync().then((response) => {
    const screen = response?.notification.request.content.data?.screen;
    if (typeof screen === "string") navigate(screen);
  });

  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const screen = response.notification.request.content.data?.screen;
    if (typeof screen === "string") navigate(screen);
  });
  return () => sub.remove();
}
