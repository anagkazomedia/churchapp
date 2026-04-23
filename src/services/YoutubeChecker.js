import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native'; 
import Constants from 'expo-constants'; 

// SAFE IMPORT: This prevents the SDK 53 crash in Expo Go
const Notifications = Constants.appOwnership !== 'expo' 
  ? require('expo-notifications') 
  : null;

const API_KEY = 'AIzaSyBaf4btLUotVuyjk90t0Mdhj8CYWq6zjf4';
const CHANNEL_ID = 'UUH9G4vzflQn7Ty4K12tR8WQ';

export const checkYoutube = async () => {
  const isExpoGo = Constants.appOwnership === 'expo';
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`
    );
    const data = await response.json();

    if (!data || !data.items || data.items.length === 0) {
      console.log("YouTube Check: No new videos or API error.");
      return;
    }

    const latestVideo = data.items[0];
    
    // Safety check for the video object structure
    if (!latestVideo.id || !latestVideo.id.videoId) return;

    const videoId = latestVideo.id.videoId;
    const videoTitle = latestVideo.snippet.title;

    const lastSeenId = await AsyncStorage.getItem('lastVideoId');

    if (videoId !== lastSeenId) {
      console.log("New video found:", videoTitle);
      
      // Use the 'Notifications' variable we defined at the top
      if (Notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "New Video Uploaded! 🎥",
            body: videoTitle,
            data: { url: `https://www.youtube.com/watch?v=${videoId}` },
          },
          trigger: null,
        });
      } else {
        // This will show in your VS Code terminal so you know it worked!
        console.log("LOG: New video found, but skipping notification in Expo Go.");
      }

      await AsyncStorage.setItem('lastVideoId', videoId);
    }
  } catch (error) {
    console.error("YouTube Check Failed:", error);
  }
};

const UBE_TASK_NAME = 'background-ube-check';

// This must stay at the top level of the file
TaskManager.defineTask(UBE_TASK_NAME, async () => {
  try {
    await checkYoutube();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundCheck = async () => {
  // Background fetch is also limited in Expo Go, so we skip registration there
  if (Constants.appOwnership === 'expo') return;

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(UBE_TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(UBE_TASK_NAME, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (err) {
    console.log("Background Fetch Registration failed", err);
  }
};