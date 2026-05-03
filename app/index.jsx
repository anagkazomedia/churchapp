import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

// Logic & Storage
import { account } from '../lib/appwrite'; 
import { checkYoutube, registerBackgroundCheck } from '../src/services/YoutubeChecker'; 

// Components
import ThemedView from '../components/ThemedView';
import ThemedLogo from '../components/ThemedLogo';
import Spacer from '../components/Spacer';
import ThemedText from '../components/ThemedText';

// Notification Handler setup
if (Constants.appOwnership !== 'expo') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
}

const Index = () => {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("Initializing...");

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Run Youtube Logic
      try {
          await checkYoutube();
          await registerBackgroundCheck(); 
      } catch (e) {
          console.warn("Service initialization failed:", e);
      }

      // 2. ENTRY LOGIC (Modified for Optional Login)
      try {
        // We still check for a user to see if a session exists
        const user = await account.get(); 
        console.log("Welcome back,", user.name);
      } catch (error) {
        // If this fails, it's fine! It just means they are a guest.
        console.log("Continuing as Guest Mode.");
      } finally {
        // FIXED: Instead of redirecting to /auth/login on error, 
        // we send EVERYONE to the Home dashboard.
        router.replace('/dashboard/Home'); 
      }
    };

    // 1.5s delay to show the Anagkazo Logo
    const timer = setTimeout(initializeApp, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedLogo /> 
      <Spacer size={20} />    
      <ThemedText style={[styles.title, { color: 'gold'}]} title={true}>
        Anagkazo
      </ThemedText>
      
      {/* Visual feedback that the app is loading */}
      <ActivityIndicator size="small" color="gold" style={{ marginTop: 20 }} />
    </ThemedView>
  );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000' 
    },
    title: {
        fontWeight: '900', 
        fontSize: 22,
        letterSpacing: 2,
        textTransform: 'uppercase'
    }
});