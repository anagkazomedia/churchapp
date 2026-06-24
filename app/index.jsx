import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Components
import ThemedView from '../components/ThemedView';
import ThemedLogo from '../components/ThemedLogo';
import Spacer from '../components/Spacer';
import ThemedText from '../components/ThemedText';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      // Logic for session check can happen silently here
      try {
        const token = await SecureStore.getItemAsync('access');
        if (token) {
          console.log("Welcome back, user found.");
        } else {
          console.log("Continuing as Guest.");
        }
      } catch (error) {
        console.log("Error checking session:", error);
      } finally {
        // Redirect to Home after timer
        router.replace('/dashboard/Home'); 
      }
    };

    // 5000ms = 5 seconds
    const timer = setTimeout(initializeApp, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedLogo /> 
      <Spacer size={20} />    
      <ThemedText style={styles.title}>
        Anagkazo
      </ThemedText>
      <ActivityIndicator size="small" color="gold" style={{ marginTop: 20 }} />
    </ThemedView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Ensuring it looks like a proper splash screen
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'gold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});