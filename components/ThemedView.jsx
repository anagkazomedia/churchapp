import React, { useContext } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar'; // Ensure this is expo-status-bar
import { Colors } from '../constants/Colors';
import { ThemeContext } from './ThemedContext';

const ThemedView = ({ style, safe = false, ...props }) => {
    const { isDark } = useContext(ThemeContext);
    const theme = isDark ? Colors.dark : Colors.light;
    const insets = useSafeAreaInsets();

    return (
        <View 
            style={[
              { backgroundColor: theme.background, flex: 1 }, 
              safe && { paddingTop: insets.top, paddingBottom: insets.bottom },
              style
            ]}
            {...props}
        >
            {/* ADD THESE PROPS TO FORCE THE CHANGE */}
            <StatusBar 
                style={isDark ? 'light' : 'dark'} 
                backgroundColor={theme.background} // Forces background to match
                translucent={true}                 // Ensures it blends with the header
                animated={true}
            />
            
            {props.children}
        </View>
    );
}

export default ThemedView;