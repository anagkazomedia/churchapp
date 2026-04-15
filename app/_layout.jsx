import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import React, { useContext, useState, useEffect } from 'react'; // Added useState, useEffect
import { View, StyleSheet, Platform } from 'react-native'; // Added View, StyleSheet
import { StatusBar } from 'expo-status-bar';
import NetInfo from "@react-native-community/netinfo";

import { UserProvider } from '../contexts/UserContext';
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
  const [isOffline, setIsOffline] = useState(false);

  // Network listener logic moved here
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // isConnected can be null initially, we want to know if it's explicitly false
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} animated={true} />
        
        {/* The Offline Banner - Sits on top of the Stack */}
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
            contentStyle: { backgroundColor: isDark ? '#000' : '#FFF' } 
          }} 
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    // Adjusts for iPhone Notch/Android Status Bar
    paddingTop: Platform.OS === 'ios' ? 50 : 35, 
    paddingBottom: 10,
    paddingHorizontal: 20,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999, // Keep it above everything
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