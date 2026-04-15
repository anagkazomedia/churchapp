import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from '../constants/Colors';
import { ThemeContext } from './ThemedContext'; // The critical link
import ThemedView from "./ThemedView";

const ThemedLoader = () => {
    // 1. Pull the real-time theme state
    const { isDark } = useContext(ThemeContext);
    const theme = isDark ? Colors.dark : Colors.light;

    return (
        <ThemedView style={styles.container}>
            {/* 2. Using theme.text or 'gold' ensures visibility */}
            <ActivityIndicator size="large" color="gold" />
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default ThemedLoader;