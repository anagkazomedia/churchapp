import React, { useContext } from 'react';
import { Image } from 'react-native';
import { ThemeContext } from './ThemedContext'; // Hooking into your switch

// images
import DarkLogo from '../assets/anagkazo-start.png';
import LightLogo from '../assets/anagkazo-start.png';

const ThemedLogo = ({ style, ...props }) => {
    // 1. Get the current theme state
    const { isDark } = useContext(ThemeContext);

    // 2. Switch logo based on your app's internal toggle
    const logo = isDark ? DarkLogo : LightLogo;

    return (
        <Image 
            source={logo} 
            style={style}
            resizeMode="contain" // Keeps branding proportions perfect
            {...props} 
        />
    );
};

export default ThemedLogo;