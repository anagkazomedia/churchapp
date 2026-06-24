import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../hooks/useUser';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import ThemedTextInput from '../../components/ThemedTextInput';
import { Colors } from '../../constants/Colors';

const Login = () => {
    const router = useRouter();
    const { login } = useUser();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        
        setError(null);
        setLoading(true);
        try {
            await login(email.trim(), password);
            router.replace('/dashboard/Home');
        } catch (err) {
            console.log("Login Error Details:", err.response?.data);
            setError(err.response?.data?.detail || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="gold" />
                </TouchableOpacity>

                <ThemedText title={true} style={styles.title}>Login</ThemedText>

                <ThemedTextInput
                    placeholder="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    value={email}
                    style={styles.input}
                />

                <ThemedTextInput
                    placeholder="password"
                    secureTextEntry
                    onChangeText={setPassword}
                    value={password}
                    style={styles.input}
                />

                <ThemedButton onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={{color: '#fff'}}>Log In</Text>}
                </ThemedButton>

                {error && <Text style={styles.error}>{error}</Text>}

                <Link href='/auth/register' style={{marginTop: 20}}>
                    <ThemedText>Need an account? Register</ThemedText>
                </Link>
            </ThemedView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButton: { position: 'absolute', top: 60, left: 20 },
    title: { fontSize: 22, marginBottom: 30 },
    input: { width: '80%', marginBottom: 20 },
    error: { color: 'red', marginTop: 10, textAlign: 'center' }
});

export default Login;