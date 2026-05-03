import { StyleSheet, Pressable, Text, TextInput, Keyboard, TouchableWithoutFeedback, ActivityIndicator, View, TouchableOpacity } from 'react-native'
import { Link, useRouter } from 'expo-router' // Added useRouter
import { Colors } from '../../constants/Colors'
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'
import { Ionicons } from '@expo/vector-icons'

//themed components
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'

const Login = () => {
    const router = useRouter(); // Initialize router for the back button
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const { login } = useUser()

    const handleSubmit = async () => {
        setError(null)
        try {
            await login(email, password)
        } catch (error) {
            const rawMessage = error.message.toLowerCase();
            let friendlyMessage = "Incorrect email or password.";
            if (rawMessage.includes('invalid-credential') || rawMessage.includes('wrong-password')) {
                friendlyMessage = "Incorrect email or password.";
            } else if (rawMessage.includes('network')) {
                friendlyMessage = "Check your internet connection.";
            } else if (rawMessage.includes('too-many-requests')) {
                friendlyMessage = "Too many attempts. Try again later.";
            } else if (rawMessage.includes('user-not-found')) {
                friendlyMessage = "No account found with this email.";
            }
            setError(friendlyMessage)
        }
    }

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} >
            <ThemedView style={styles.container}>
                
                {/* BACK BUTTON */}
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={28} color="gold" />
                </TouchableOpacity>

                <Spacer />
                <ThemedText title={true} style={styles.title}>
                    Login to your account
                </ThemedText>

                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder="email"
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                />

                <View style={{ width: '80%', justifyContent: 'center' }}>
                    <ThemedTextInput
                        style={{ width: '100%', marginBottom: 20 }}
                        placeholder="password"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={!isPasswordVisible}
                    />
                    <TouchableOpacity
                        onPress={togglePasswordVisibility}
                        style={{ position: 'absolute', right: 15, top: 15 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                            size={22}
                            color={Colors.gray || '#888'}
                        />
                    </TouchableOpacity>
                </View>

                <ThemedButton onPress={handleSubmit}>
                    <Text style={{ color: '#f2f2f2' }}> log In</Text>
                </ThemedButton>

                <Spacer />
                {error && <Text style={styles.error}>{error}</Text>}

                <Spacer height={100} />
                <Link href='./register'>
                    <ThemedText style={{ textAlign: 'center' }}>
                        Register Account
                    </ThemedText>
                </Link>

            </ThemedView>
        </TouchableWithoutFeedback>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    },
    // New Style for Back Button
    backButton: {
        position: 'absolute',
        top: 60, // Safe area for most mobile devices
        left: 20,
        zIndex: 10,
        padding: 5
    },
    title: {
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30
    },
    btn: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 5,
    },
    pressed: {
        opacity: 0.8
    },
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    }
})