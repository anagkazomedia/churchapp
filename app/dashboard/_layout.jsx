import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons} from '@expo/vector-icons'
import UserOnly from "../../components/UserOnly"
import { StatusBar } from "expo-status-bar"

const DashboardLayout = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  return (
    <Tabs
        screenOptions={{ headerShown: false, tabBarStyle: {
            backgroundColor: theme.navBackground,
            paddingTop: 5,
            paddingBottom: 10,
            height: 90
        },
        tabBarActiveTintColor: theme.iconColorFocused,
        tabBarInactiveTintColor: theme.iconColor
    }} 
     >
        <Tabs.Screen 
            name="Home" 
            options={{ title: 'Home', tabBarIcon: ({ focused }) => (
                <Ionicons 
                    size={24}
                    name={focused ? 'home' : 'home-outline'}
                    color={focused ? theme.iconColorFocused : theme.iconColor}
                />
            ) }} 
         />
         
        <Tabs.Screen 
            name="books" 
            options={{ title: 'Videos', tabBarIcon: ({ focused }) => (
                <Ionicons
                    size={24}
                    name={focused ? 'tv' : 'tv-outline'}
                    color={focused ? theme.iconColorFocused: theme.iconColor}
                
                />
            ) }} 
         />
        <Tabs.Screen 
            name="create" 
            options={{ title: 'Donate', tabBarIcon: ({ focused }) => (
                <Ionicons
                    size={24}
                    name={focused ? 'gift' : 'gift-outline'}
                    color={focused ? theme.iconColorFocused : theme.iconColor}  
                />
            ) }} 
         />
        <Tabs.Screen 
            name="Bible" 
            options={{ title: 'Bible', tabBarIcon: ({ focused }) => (
                <Ionicons
                    size={24}
                    name={focused ? 'book' : 'book-outline'}
                    color={focused ? theme.iconColorFocused : theme.iconColor}  
                />
            ) }} 
         />
          <Tabs.Screen 
            name="profile" 
            options={{ title: 'Profile', tabBarIcon: ({ focused }) => (
                <Ionicons 
                    size={24}
                    name={focused ? 'person' : 'person-outline'}
                    color={focused ? theme.iconColorFocused : theme.iconColor}
                />
            ) }} 
         />
     </Tabs>
    
  )
}

export default DashboardLayout

