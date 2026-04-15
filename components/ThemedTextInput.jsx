import { TextInput, StyleSheet } from 'react-native'
import React, { useContext } from 'react'
import { Colors } from '../constants/Colors';
import { ThemeContext } from './ThemedContext'; // Hooking into your toggle

const ThemedTextInput = ({ style, ...props }) => {
  // 1. Get the theme state from context
  const { isDark } = useContext(ThemeContext);
  const theme = isDark ? Colors.dark : Colors.light;
  
  return (
    <TextInput
      style={[
        {
          backgroundColor: theme.uiBackground, // Uses the specific UI background from your Colors file
          color: theme.text,
          padding: 15,
          borderRadius: 8, // Sharp Phaneroo style
          fontSize: 16,
        },
        style
      ]} 
      // 2. Ensure the placeholder text is visible in both modes
      placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
      {...props}
    />
  )
}

export default ThemedTextInput;