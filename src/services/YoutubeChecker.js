import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';


const API_KEY = 'AIzaSyBaf4btLUotVuyjk90t0Mdhj8CYWq6zjf4';
const CHANNEL_ID = 'UUH9G4vzflQn7Ty4K12tR8WQ';

export const checkYoutube = async () => {
  try {
    // 1. Ask YouTube for the latest video
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`
    );
    const data = await response.json();
    const latestVideo = data.items[0];
    const videoId = latestVideo.id.videoId;
    const videoTitle = latestVideo.snippet.title;

    // 2. Check if we have seen this video before
    const lastSeenId = await AsyncStorage.getItem('lastVideoId');

    if (videoId !== lastSeenId) {
      // 3. It is a NEW video! Show the notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "New Video Uploaded!",
          body: videoTitle,
          data: { url: `https://www.youtube.com/watch?v=${videoId}` },
        },
        trigger: null, // Show immediately
      });

      // 4. Save this ID so we don't notify again for the same video
      await AsyncStorage.setItem('lastVideoId', videoId);
    }
  } catch (error) {
    console.error("Youtube Check Failed", error);
  }
};

const YOUTUBE_TASK_NAME = 'background-youtube-check';

// 1. Define the task
TaskManager.defineTask(YOUTUBE_TASK_NAME, async () => {
  try {
    console.log('Checking YouTube in background...');
    await checkYoutube(); // This runs your existing logic
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 2. Register the task
export const registerBackgroundCheck = async () => {
  return BackgroundFetch.registerTaskAsync(YOUTUBE_TASK_NAME, {
    minimumInterval: 15 * 60, // Check every 15 minutes
    stopOnTerminate: false,   // Continue after app is closed
    startOnBoot: true,        // Start after phone restarts
  });
};