import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Logic & Storage
import { account } from '../lib/appwrite'; // Import your Appwrite config
import { checkYoutube, registerBackgroundCheck } from '../src/services/YoutubeChecker'; 

// Components
import ThemedView from '../components/ThemedView';
import ThemedLogo from '../components/ThemedLogo';
import Spacer from '../components/Spacer';
import ThemedText from '../components/ThemedText';

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
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Run Youtube Logic
      try {
          checkYoutube();
          registerBackgroundCheck();
      } catch (e) {
          console.warn("Service initialization failed:", e);
      }

      // 2. CHECK LOGIN STATUS (Persistence Logic)
      try {
        const user = await account.get(); // Try to get the current session
        if (user) {
          // USER FOUND: Go to Profile as you requested
          router.replace('/dashboard/profile');
        }
      } catch (error) {
        // NO USER FOUND: Go to Login/Welcome screen
        console.log("No active session found, redirecting to login.");
        router.replace('/auth/login'); // Change this to your login path
      } finally {
        setCheckingSession(false);
      }
    };

    // Delay slightly so the logo is actually seen (approx 1.5s)
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
      
      {/* Optional: Show a small loader while checking session */}
      {checkingSession && (
        <ActivityIndicator size="small" color="gold" style={{ marginTop: 20 }} />
      )}
    </ThemedView>
  );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000' // Matches the Phaneroo dark theme
    },
    title: {
        fontWeight: '900', // Changed to match your church's bold branding
        fontSize: 22,
        letterSpacing: 2,
        textTransform: 'uppercase'
    }
});