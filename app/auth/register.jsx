import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard, View, TouchableOpacity } from 'react-native' // Added View, TouchableOpacity
import { Link } from 'expo-router'
import { useState } from 'react'
import { Colors }  from '../../constants/Colors'
import { Ionicons } from '@expo/vector-icons' // Added Ionicons

//themed components
import ThemedView from '../../components/ThemedView'
import Spacer from '../../components/Spacer'
import ThemedText from '../../components/ThemedText'
import ThemedButton from '../../components/ThemedButton'
import ThemedTextInput from '../../components/ThemedTextInput'
import { useUser } from '../../hooks/useUser'

const Register = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const { register } = useUser()

    const handleSubmit = async() => {
        setError(null)
        try {
            // IMPROVEMENT: Added .trim() to email to prevent "poorly put info" errors
            await register(email.trim(), password)
        } catch (error) {
            const rawMessage = error.message.toLowerCase();
            let friendlyMessage = "Check email or password or email is already in use.";

            if (rawMessage.includes('email-already-in-use')) {
                friendlyMessage = "An account with this email already exists.";
            } else if (rawMessage.includes('invalid-email')) {
                friendlyMessage = "Please enter a valid email address.";
            } else if (rawMessage.includes('weak-password')) {
                friendlyMessage = "Password must be at least 6 characters.";
            } else if (rawMessage.includes('network')) {
                friendlyMessage = "Check your internet connection.";
            }

            setError(friendlyMessage)
        }
    }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ThemedView style={styles.container}>
        <Spacer />
        <ThemedText title={true} style={styles.title}>
            Register for an account
        </ThemedText>

        <ThemedTextInput 
            style={{ width: '80%', marginBottom: 20}}
            placeholder="email" 
            keyboardType="email-address"
            autoCapitalize="none" // FIX: Important for registration reliability
            onChangeText={setEmail}
            value={email}
        />

        {/* FIX: Wrapper View for the Password Toggle */}
        <View style={{ width: '80%', justifyContent: 'center' }}>
            <ThemedTextInput 
                style={{ width: '100%', marginBottom: 20}}
                placeholder="password" 
                onChangeText={setPassword}
                value={password}
                // FIX: State-driven visibility
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
            <Text style={{ color: '#f2f2f2' }}> Register </Text>
        </ThemedButton>

        <Spacer />
        {error && <Text style={styles.error}>{error}</Text>}

        <Spacer height={100} />
        <Link href='./login'>
            <ThemedText style={{ textAlign: 'center' }}>
                login instead
            </ThemedText>
        </Link>
      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    },
    title: {
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30
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