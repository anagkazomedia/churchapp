import { StatusBar, useColorScheme, ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Colors } from "../constants/Colors";
import { UserProvider, UserContext } from '../contexts/UserContext'; // Added UserContext
import { BooksProvider } from '../contexts/BooksContext';
import { useContext, useEffect } from 'react';

// 1. This component handles the actual "Where do I go?" logic
const RootLayoutNav = () => {
  const { user, isLoading, authChecked } = useContext(UserContext);
  const segments = useSegments();
  const router = useRouter();
  
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  useEffect(() => {
    // If we haven't finished checking Appwrite yet, do nothing
    if (isLoading || !authChecked) return;

    // Check if the user is currently in the "auth" folder
    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // ❌ Not logged in? Go to Login
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // ✅ Logged in but trying to see Login screen? Go to Dashboard
      router.replace('/dashboard');
    }
  }, [user, isLoading, segments, authChecked]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: theme.navBackground },
      headerTintColor: theme.title,
    }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
};

// 2. This is the main export that wraps everything in Providers
const RootLayout = () => {
  return (
    <UserProvider>
      <BooksProvider>
        <StatusBar barStyle="auto" />
        <RootLayoutNav />
      </BooksProvider>
    </UserProvider>
  );
};

export default RootLayout;