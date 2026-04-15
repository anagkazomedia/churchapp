import React, { useContext } from "react";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from "../../components/ThemedContext";

const DashboardLayout = () => {
  const { isDark } = useContext(ThemeContext);
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Tabs
        screenOptions={{ 
            headerShown: false, 
            tabBarStyle: {
                // 1. Matches the "Phaneroo Header" greyish feel or pure white/black
                backgroundColor: isDark ? '#121212' : '#FFFFFF', 
                paddingTop: 5,
                paddingBottom: 25, // Increased for modern iPhone/Android gesture bars
                height: 85,
                borderTopWidth: 1, 
                // 2. A very subtle border to separate the content from the nav
                borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                elevation: 0,
            },
            tabBarActiveTintColor: 'gold', // Direct gold for that branding
            tabBarInactiveTintColor: theme.iconColor,
            tabBarLabelStyle: { 
                fontWeight: '800', 
                fontSize: 10,
                textTransform: 'uppercase', // Matches ministry app branding
                marginTop: -5 
            }
        }} 
     >
        <Tabs.Screen 
            name="Home" 
            options={{ title: 'Home', tabBarIcon: ({ focused }) => (
                <Ionicons 
                    size={22}
                    name={focused ? 'home' : 'home-outline'}
                    color={focused ? 'gold' : theme.iconColor}
                />
            ) }} 
         />
         
        <Tabs.Screen 
            name="books" 
            options={{ title: 'Videos', tabBarIcon: ({ focused }) => (
                <Ionicons
                    size={22}
                    name={focused ? 'tv' : 'tv-outline'}
                    color={focused ? 'gold' : theme.iconColor}
                />
            ) }} 
         />
        <Tabs.Screen 
            name="create" 
            options={{ title: 'Donate', tabBarIcon: ({ focused }) => (
                <Ionicons
                    size={22}
                    name={focused ? 'gift' : 'gift-outline'}
                    color={focused ? 'gold' : theme.iconColor}  
                />
            ) }} 
         />
        <Tabs.Screen 
            name="Bible" 
            options={{ title: 'Bible', tabBarIcon: ({ focused }) => (
                <Ionicons
                    size={22}
                    name={focused ? 'book' : 'book-outline'}
                    color={focused ? 'gold' : theme.iconColor}  
                />
            ) }} 
         />
          <Tabs.Screen 
            name="profile" 
            options={{ title: 'Profile', tabBarIcon: ({ focused }) => (
                <Ionicons 
                    size={22}
                    name={focused ? 'person' : 'person-outline'}
                    color={focused ? 'gold' : theme.iconColor}
                />
            ) }} 
         />
     </Tabs>
  )
}

export default DashboardLayout;