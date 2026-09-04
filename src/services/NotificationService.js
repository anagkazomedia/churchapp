import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Require inside variable to prevent Expo Go crashes
const Notifications = Constants.appOwnership !== 'expo' 
  ? require('expo-notifications') 
  : null;

/**
 * Calculates the exact Easter Sunday Date for a given year (Meeus/Jones/Butcher algorithm)
 */
function getEasterDate(year) {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44); // 3 = March, 4 = April
  const day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day, 7, 0, 0); // 7:00 AM
}

export async function setupAllNotifications() {
  // 1. Safety Check: Standby mode in Expo Go
  if (!Notifications) {
    console.log("🔔 Notifications: Standby Mode (Active only in APK/Dev Build)");
    return;
  }

  try {
    // 2. Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // 3. Android Notification Channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFD700',
      });
    }

    // 4. Clear old scheduled notifications to prevent duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // --- A. EVERY 8 HOURS (Interval Updated) ---
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Keep the Fire Burning! 🔥",
        body: "Take a moment to pray or read a verse. 'Anagkazo'!",
        data: { screen: 'Library' },
      },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 8 * 60 * 60, // 8 hours
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
        weekday: 1, // Sunday
        hour: 8, 
        minute: 30, 
        repeats: true 
      },
    });

    // --- D. SATURDAY REMINDER (Saturday 6:00 PM) ---
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sunday Service Tomorrow ✨",
        body: "Get ready for Sunday service tomorrow! Join us for a powerful word and fellowship.",
      },
      trigger: { 
        weekday: 7, // Saturday
        hour: 18, 
        minute: 0, 
        repeats: true 
      },
    });

    // --- E. FIXED PENTECOSTAL HOLIDAYS ---
    
    // Christmas Day (Dec 25 @ 8:00 AM)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Merry Christmas! 🎄✨",
        body: "Unto us a Child is born! Celebrate the birth of our Savior Jesus Christ today.",
      },
      trigger: {
        month: 12,
        day: 25,
        hour: 8,
        minute: 0,
        repeats: true,
      },
    });

    // New Year's Eve / Watchnight Service (Dec 31 @ 7:00 PM)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Crossover & Watchnight Service 🎆🙏",
        body: "Prepare to cross over into the New Year in prayer and thanksgiving!",
      },
      trigger: {
        month: 12,
        day: 31,
        hour: 19,
        minute: 0,
        repeats: true,
      },
    });

    // --- F. MOVABLE PENTECOSTAL HOLIDAYS (Good Friday, Easter, Pentecost) ---
    const now = new Date();
    const currentYear = now.getFullYear();

    // Schedule for current year and next year to ensure continuity
    for (let year of [currentYear, currentYear + 1]) {
      const easterSunday = getEasterDate(year);

      // Good Friday (2 days before Easter @ 7:00 AM)
      const goodFriday = new Date(easterSunday);
      goodFriday.setDate(easterSunday.getDate() - 2);
      goodFriday.setHours(7, 0, 0, 0);

      // Pentecost Sunday (49 days / 7 weeks after Easter @ 7:00 AM)
      const pentecostSunday = new Date(easterSunday);
      pentecostSunday.setDate(easterSunday.getDate() + 49);
      pentecostSunday.setHours(7, 0, 0, 0);

      // Schedule Good Friday
      if (goodFriday > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Good Friday ✝️",
            body: "Remember the sacrifice of Jesus on the Cross for our redemption.",
          },
          trigger: { type: 'date', date: goodFriday },
        });
      }

      // Schedule Easter Sunday
      if (easterSunday > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "He Is Risen! Happy Easter! 🎺🌅",
            body: "Death is swallowed up in victory! Celebrate the resurrection of Jesus Christ!",
          },
          trigger: { type: 'date', date: easterSunday },
        });
      }

      // Schedule Pentecost Sunday
      if (pentecostSunday > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Pentecost Sunday! 🔥🕊️",
            body: "Celebrate the outpouring of the Holy Spirit and the power of the believer!",
          },
          trigger: { type: 'date', date: pentecostSunday },
        });
      }
    }

    console.log("✅ All Anagkazo reminders & Pentecostal holiday notifications scheduled successfully!");

  } catch (error) {
    console.error("❌ Notification Setup Error:", error);
  }
}