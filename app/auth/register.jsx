import React, { useState } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../hooks/useUser';
import ThemedView from '../../components/ThemedView';
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import ThemedTextInput from '../../components/ThemedTextInput';

const Register = () => {
    const router = useRouter();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [username, setUsername] = useState(''); // Added username
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { register } = useUser();

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        try {
            await register(username.trim(), email.trim(), password);
            router.replace('/dashboard/Home');
        } catch (error) {
            // Logs exact server error for easier debugging
            console.log("Registration Error:", error.response?.data);
            setError("Registration failed. Please check your username and email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ThemedView style={styles.container}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="gold" />
                </TouchableOpacity>

                <ThemedText title={true} style={styles.title}>Register Account</ThemedText>

                <ThemedTextInput 
                    style={styles.input}
                    placeholder="username" 
                    autoCapitalize="none" 
                    onChangeText={setUsername}
                    value={username}
                />

                <ThemedTextInput 
                    style={styles.input}
                    placeholder="email" 
                    keyboardType="email-address"
                    autoCapitalize="none" 
                    onChangeText={setEmail}
                    value={email}
                />

                <ThemedTextInput 
                    style={styles.input}
                    placeholder="password" 
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={!isPasswordVisible}
                />

                <ThemedButton onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="#f2f2f2" /> : <Text style={{ color: '#f2f2f2' }}> Register </Text>}
                </ThemedButton>

                {error && <Text style={styles.error}>{error}</Text>}
            </ThemedView>
        </TouchableWithoutFeedback>
    );
};

export default Register;
// Keep your existing styles constant...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        paddingHorizontal: 20 // Added for better mobile responsiveness
    },
    backButton: {
        position: 'absolute',
        top: 60, 
        left: 20,
        zIndex: 10,
        padding: 5
    },
    title: {
        textAlign: "center",
        fontSize: 22, // Slightly larger for better hierarchy
        fontWeight: 'bold',
        marginBottom: 30
    },
    input: {
        width: '80%', 
        marginBottom: 20
    },
    error: {
        color: '#721c24', // Standard warning red
        padding: 12,
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb',
        borderWidth: 1,
        borderRadius: 8,
        marginHorizontal: 20,
        textAlign: 'center',
        marginTop: 10
    }
});