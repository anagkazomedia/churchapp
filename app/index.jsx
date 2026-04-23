import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications'; // ADD THIS IMPORT

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
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Run Youtube Logic
      try {
          await checkYoutube(); // Added await for stability
          await registerBackgroundCheck(); 
      } catch (e) {
          console.warn("Service initialization failed:", e);
      }

      // 2. CHECK LOGIN STATUS
      try {
        const user = await account.get(); 
        if (user) {
          // Go to Dashboard Home (or profile if you prefer)
          router.replace('/dashboard/Home'); 
        }
      } catch (error) {
        console.log("No active session found.");
        router.replace('/auth/login'); 
      } finally {
        setCheckingSession(false);
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
        backgroundColor: '#000' 
    },
    title: {
        fontWeight: '900', 
        fontSize: 22,
        letterSpacing: 2,
        textTransform: 'uppercase'
    }
});