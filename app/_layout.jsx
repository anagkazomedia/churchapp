import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";

import { UserProvider, UserContext } from '../contexts/UserContext'; // Ensure UserContext is exported
import { BooksProvider } from '../contexts/BooksContext';
import { ThemeProvider, ThemeContext } from '../components/ThemedContext';
import ThemedText from '../components/ThemedText';

export default function RootLayout() {
  return (
    <UserProvider>
      <BooksProvider>
        <ThemeProvider> 
          <MainContent />
        </ThemeProvider>
      </BooksProvider>
    </UserProvider>
  );
}

function MainContent() {
  const { isDark } = useContext(ThemeContext);
  // Get loading state from your UserContext to know when it's safe to show the app
  const { isLoading } = useContext(UserContext) || { isLoading: false }; 
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // Logic: if isConnected is explicitly false, we are offline
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

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
        
        {isOffline && (
          <View style={[styles.offlineBanner, { backgroundColor: isDark ? '#8B0000' : '#E74C3C' }]}>
            <ThemedText style={styles.offlineText}>
              You are currently offline. Using cached data.
            </ThemedText>
          </View>
        )}

        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' } 
          }} 
        />
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40, 
    paddingBottom: 10,
    paddingHorizontal: 20,
    width: '100%',
    zIndex: 9999, 
    alignItems: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});