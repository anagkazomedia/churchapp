import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";

// Context Providers
import { UserProvider, UserContext } from '../contexts/UserContext';
import { BooksProvider } from '../contexts/BooksContext';
import { ThemeProvider, ThemeContext } from '../components/ThemedContext';
import ThemedText from '../components/ThemedText';
import { setupAllNotifications } from '../src/services/NotificationService';

export default function RootLayout() {
  useEffect(() => {
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
  // Using authChecked to ensure we've finished the session check
  const { isLoading, authChecked } = useContext(UserContext) || { isLoading: true, authChecked: false }; 
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isActuallyOffline = state.isConnected === false || state.isInternetReachable === false;
      
      if (!isOffline && isActuallyOffline) {
        setShowBanner(true);
        const timer = setTimeout(() => setShowBanner(false), 5000);
        return () => clearTimeout(timer);
      }

      if (!isActuallyOffline) {
        setShowBanner(false);
      }

      setIsOffline(isActuallyOffline);
    });
    return () => unsubscribe();
  }, [isOffline]);

  // If the context is still busy checking for a session, show the loader
  if (isLoading && !authChecked) {
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
        
        {isOffline ? (
          /* --- OFFLINE MODE: BIBLE ONLY --- */
          <View style={{ flex: 1 }}>
            {showBanner && (
              <View style={[styles.offlineBanner, { position: 'relative', backgroundColor: isDark ? '#8B0000' : '#E74C3C' }]}>
                <ThemedText style={styles.offlineText}>
                  Offline Mode: Bible Access Only
                </ThemedText>
              </View>
            )}
            
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="dashboard/Bible" options={{ title: 'Bible' }} />
            </Stack>
          </View>
        ) : (
          /* --- ONLINE MODE: FULL APP (Optional Login) --- */
          <Stack 
            screenOptions={{ 
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' } 
            }} 
          />
        )}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 45, 
    paddingBottom: 15,
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