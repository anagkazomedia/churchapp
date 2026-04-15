import React, { useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { ThemeContext } from './ThemedContext';

function ThemedButton({ style, ...props }) {
    const { isDark } = useContext(ThemeContext);
    
    return (
        <Pressable
            style={({ pressed }) => [
                styles.btn, 
                // Adds a subtle border in dark mode to define the button shape
                { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                pressed && styles.pressed, 
                style
            ]}
            {...props}
        />
    )
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: 'gold', // Or Colors.primary if that is gold
        padding: 18,
        borderRadius: 12, // Updated to the sharper Phaneroo/Anagkazo radius
        marginVertical: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    pressed: {
        opacity: 0.7 // Slightly more visible press effect
    },
})

export default ThemedButton;