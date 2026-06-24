import React, { useContext } from "react";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from "../../components/ThemedContext";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DashboardLayout = () => {
  const { isDark } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
        screenOptions={{ 
            headerShown: false, 
            tabBarStyle: {
                backgroundColor: isDark ? '#121212' : '#FFFFFF', 
                borderTopWidth: 1, 
                borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                elevation: 8,
                height: 65 + insets.bottom,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
                paddingTop: 10,
            },
            tabBarActiveTintColor: 'gold', 
            tabBarInactiveTintColor: isDark ? '#888' : '#666',
            tabBarLabelStyle: { 
                fontWeight: '800', 
                fontSize: 10,
                textTransform: 'uppercase',
                marginBottom: insets.bottom > 0 ? 0 : 5,
            }
        }} 
     >
        <Tabs.Screen 
            name="Home" 
            options={{ 
                title: 'Home', 
                tabBarIcon: ({ focused }) => (
                    <Ionicons 
                        size={24}
                        name={focused ? 'home' : 'home-outline'}
                        color={focused ? 'gold' : (isDark ? '#888' : '#666')}
                    />
                ) 
            }} 
         />
         
        <Tabs.Screen 
            name="books" 
            options={{ 
                title: 'Watch', 
                tabBarIcon: ({ focused }) => (
                    <Ionicons
                        size={24}
                        name={focused ? 'tv' : 'tv-outline'}
                        color={focused ? 'gold' : (isDark ? '#888' : '#666')}
                    />
                ) 
            }} 
         />
        <Tabs.Screen 
            name="create" 
            options={{ 
                title: 'Devotions', 
                tabBarIcon: ({ focused }) => (
                    <Ionicons
                        size={24}
                        // 'book' is the standard Ionicons icon for Devotions
                        name={focused ? 'book' : 'book-outline'}
                        color={focused ? 'gold' : (isDark ? '#888' : '#666')}  
                    />
                ) 
            }} 
         />
        <Tabs.Screen 
            name="Bible" 
            options={{ 
                title: 'Bible', 
                tabBarIcon: ({ focused }) => (
                    <Ionicons
                        size={24}
                        name={focused ? 'library' : 'library-outline'}
                        color={focused ? 'gold' : (isDark ? '#888' : '#666')}  
                    />
                ) 
            }} 
         />
     </Tabs>
  );
};

export default DashboardLayout;