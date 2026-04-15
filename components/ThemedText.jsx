import React, { useContext } from 'react';
import { Text } from "react-native";
import { Colors } from '../constants/Colors';
import { ThemeContext } from './ThemedContext'; // The missing link

const ThemedText = ({ style, title = false, ...props }) => {
    // 1. Swap system hook for your custom context
    const { isDark } = useContext(ThemeContext);
    const theme = isDark ? Colors.dark : Colors.light;
    
    // 2. Determine color based on whether it's a title or regular text
    const textColor = title ? theme.title : theme.text;

    return (
        <Text
            style={[
                { color: textColor },
                title && { fontWeight: '900', fontSize: 24 }, // Stronger emphasis for titles
                style
            ]}
            {...props}
        />
    )
}

export default ThemedText;