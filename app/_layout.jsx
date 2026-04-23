import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import React, { useContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";

import { UserProvider, UserContext } from '../contexts/UserContext'; // Ensure UserContext is exported
=======
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";

// 1. Importing the service we created
import { setupAllNotifications } from '../src/services/NotificationService';

// 2. Context Providers
import { UserProvider } from '../contexts/UserContext';
>>>>>>> 87d1ea2 (additional fix)
import { BooksProvider } from '../contexts/BooksContext';
import { ThemeProvider, ThemeContext } from '../components/ThemedContext';
import ThemedText from '../components/ThemedText';

export default function RootLayout() {
  useEffect(() => {
    // Schedules notifications and reminders
    setupAllNotifications();
  }, []);

  return (
    <ThemeProvider> 
      <UserProvider>
        <BooksProvider>
          <MainContent />
        </BooksProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

function MainContent() {
  const { isDark } = useContext(ThemeContext);
  // Get loading state from your UserContext to know when it's safe to show the app
  const { isLoading } = useContext(UserContext) || { isLoading: false }; 
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false); // New state for the timer

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
<<<<<<< HEAD
      // Logic: if isConnected is explicitly false, we are offline
      setIsOffline(state.isConnected === false);
=======
      const isActuallyOffline = state.isConnected === false || state.isInternetReachable === false;
      
      // If we are changing from ONLINE to OFFLINE, trigger the banner
      if (!isOffline && isActuallyOffline) {
        setShowBanner(true);
        // Hide banner after 5 seconds
        const timer = setTimeout(() => {
          setShowBanner(false);
        }, 5000);
        
        // Cleanup timer if component unmounts
        return () => clearTimeout(timer);
      }

      // If we go back online, hide banner and restore full app
      if (!isActuallyOffline) {
        setShowBanner(false);
      }

      setIsOffline(isActuallyOffline);
>>>>>>> 87d1ea2 (additional fix)
    });
    return () => unsubscribe();
  }, [isOffline]); // Dependency on isOffline ensures we detect the transition

  // PREVENT HANG: If the app is still fetching user data, show a spinner
  // This prevents the "Logo Hang" by giving the UI something to do
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#FFF' }]}>
        <ActivityIndicator size="large" color="#E74C3C" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FFF' }}>
        <StatusBar style={isDark ? 'light' : 'dark'} animated={true} />
        
<<<<<<< HEAD
        {isOffline && (
          <View style={[styles.offlineBanner, { backgroundColor: isDark ? '#8B0000' : '#E74C3C' }]}>
            <ThemedText style={styles.offlineText}>
              You are currently offline. Using cached data.
            </ThemedText>
=======
        {isOffline ? (
          /* --- OFFLINE MODE: BIBLE ONLY --- */
          <View style={{ flex: 1 }}>
            {/* Banner appears only when showBanner is true (the first 5 seconds) */}
            {showBanner && (
              <View style={[styles.offlineBanner, { position: 'relative', backgroundColor: isDark ? '#8B0000' : '#E74C3C' }]}>
                <ThemedText style={styles.offlineText}>
                  Offline Mode: Bible Access Only
                </ThemedText>
              </View>
            )}
            
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen 
                name="dashboard/Bible" 
                options={{ 
                  title: 'Bible',
                }} 
              />
            </Stack>
>>>>>>> 87d1ea2 (additional fix)
          </View>
        ) : (
          /* --- ONLINE MODE: FULL APP --- */
          <Stack 
            screenOptions={{ 
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' } 
            }} 
          />
        )}
<<<<<<< HEAD

        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' } 
          }} 
        />
=======
>>>>>>> 87d1ea2 (additional fix)
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBanner: {
<<<<<<< HEAD
    paddingTop: Platform.OS === 'ios' ? 50 : 40, 
    paddingBottom: 10,
=======
    paddingTop: Platform.OS === 'ios' ? 60 : 45, 
    paddingBottom: 15,
>>>>>>> 87d1ea2 (additional fix)
    paddingHorizontal: 20,
    width: '100%',
    zIndex: 9999, 
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center'
  }
});