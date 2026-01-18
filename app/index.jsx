import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

// Components
import ThemedView from '../components/ThemedView';
import ThemedLogo from '../components/ThemedLogo';
import Spacer from '../components/Spacer';
import ThemedText from '../components/ThemedText';

// Logic - Ensure this path matches where you moved the folder!
import { checkYoutube, registerBackgroundCheck } from '../src/services/YoutubeChecker'; 

// This handler ensures the notification pops up even if the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    // 1. Run Youtube Logic
    checkYoutube();
    registerBackgroundCheck();

    // 2. Set the redirect timer
    const timer = setTimeout(() => {
      if (isMounted) {
        // IMPORTANT: Ensure the file app/dashboard/Home.jsx exists.
        // If it is lowercase in your folder (home.jsx), change this to '/dashboard/home'
        router.replace('/dashboard/profile');
      }
    }, 2000);

    // 3. Cleanup to prevent crashes on logout
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedLogo /> 
      <Spacer height={20} />    
      <ThemedText style={[styles.title, { color: 'gold'}]} title={true}>
        Welcome
      </ThemedText>
    </ThemedView>
  );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18
    }
});