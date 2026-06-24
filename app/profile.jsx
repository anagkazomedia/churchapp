import React, { useContext } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native'
import { useUser } from '../hooks/useUser'
import { Ionicons } from '@expo/vector-icons' 
import { useRouter } from 'expo-router'
import Spacer from '../components/Spacer'
import ThemedText from '../components/ThemedText'
import ThemedView from '../components/ThemedView'
import CornerDropdown from '../components/CornerDropdown' 
import { ThemeContext } from '../components/ThemedContext'

const Profile = () => {
    const { logout, user } = useUser()
    const { isDark } = useContext(ThemeContext)
    const router = useRouter()

    const displayName = user?.email?.split('@')[0] || 'User';

    const handleOpenPrivacyPolicy = () => {
        Linking.openURL('https://gist.githubusercontent.com/anagkazomedia/e44803f12982b72b4161bc0d4c745bc0/raw/9c3a3dc6cc2b9f2251679f54c55d35963362e860/privacy_policy.md');
    };

    const handleDeleteAccount = () => {
        Alert.alert("Logout", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: async () => { await logout(); router.replace('/auth/login'); } }
        ]);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.headerRight}><CornerDropdown /></View>

            {user ? (
                <View style={styles.contentCenter}>
                    <Ionicons name="person-circle-outline" size={120} color="gold" />
                    <ThemedText style={styles.userName}>{displayName}</ThemedText>
                    <ThemedText style={styles.emailSubtext}>{user?.email}</ThemedText>
                    <Spacer height={40} />
                    <TouchableOpacity style={[styles.customLogoutBtn, { backgroundColor: isDark ? '#FFF' : '#000' }]} onPress={logout}>
                        <Text style={[styles.logoutText, { color: isDark ? '#000' : '#FFF' }]}>LOGOUT</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.contentCenter}>
                    <Ionicons name="person-outline" size={120} color="gray" />
                    <ThemedText style={styles.userName}>GUEST</ThemedText>
                    <ThemedText style={styles.emailSubtext}>Sign in to sync your library.</ThemedText>
                    <Spacer height={40} />
                    <TouchableOpacity 
                        style={[styles.customLogoutBtn, { backgroundColor: 'gold' }]} 
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={styles.logoutText}>GO TO LOGIN</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ThemedView>
    )
}

export default Profile

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
    headerRight: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
    contentCenter: { width: '100%', alignItems: 'center' },
    userName: { fontSize: 34, fontWeight: "900", color: 'gold', textTransform: 'uppercase' },
    emailSubtext: { opacity: 0.5, fontSize: 14, fontWeight: '700', textAlign: 'center' },
    customLogoutBtn: { width: '100%', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    logoutText: { fontWeight: '900', fontSize: 13, letterSpacing: 1 }
})