import { Platform } from 'react-native';
import Constants from 'expo-constants';

// We use 'require' inside a variable to prevent Expo Go from crashing on boot
const Notifications = Constants.appOwnership !== 'expo' 
  ? require('expo-notifications') 
  : null;

export async function setupAllNotifications() {
  // 1. Safety Check: If we are in Expo Go, stop here so the app doesn't crash
  if (!Notifications) {
    console.log("🔔 Notifications: Standby Mode (Active only in APK/Dev Build)");
    return;
  }

  try {
    // 2. Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // 3. Clear old ones to prevent duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // --- A. EVERY 4 HOURS (Interval) ---
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Keep the Fire Burning! 🔥",
        body: "Take a moment to pray or read a verse. 'Anagkazo'!",
        data: { screen: 'Library' },
      },
      trigger: { 
        type: 'timeInterval', 
        seconds: 4 * 60 * 60, 
        repeats: true 
      },
    });

    // --- B. DAILY DEVOTIONS (7:00 AM) ---
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Morning Devotion 🙏",
        body: "Start your day with the Word. Open Anagkazo.",
      },
      trigger: { 
        type: 'daily',
        hour: 7, 
        minute: 0, 
        repeats: true 
      },
    });

    // --- C. SUNDAY SERVICE (Sunday 8:30 AM) ---
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sunday Service Today! ⛪",
        body: "Join us this morning for a powerful word and fellowship.",
      },
      trigger: { 
        type: 'weekly',
        weekday: 1, // Sunday
        hour: 8, 
        minute: 30, 
        repeats: true 
      },
    });

    // --- D. DONATION REMINDER (Saturday 6:00 PM) ---
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Invest in the Kingdom ✨",
        body: "Your support helps us reach more souls. Remember to set aside your donation today for the house.",
      },
      trigger: { 
        type: 'weekly',
        weekday: 7, // Saturday
        hour: 18, 
        minute: 0, 
        repeats: true 
      },
    });

    console.log("✅ All Anagkazo reminders scheduled successfully!");

  } catch (error) {
    console.error("❌ Notification Setup Error:", error);
  }
}