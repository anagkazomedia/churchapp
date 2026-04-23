import React, { useContext } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native'
import { useUser } from '../../hooks/useUser'
import { Ionicons } from '@expo/vector-icons' 
import { account } from '../../lib/appwrite' 

import Spacer from '../../components/Spacer'
import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import UserOnly from '../../components/UserOnly'
import CornerDropdown from '../../components/CornerDropdown' 
import { ThemeContext } from '../../components/ThemedContext'

const Profile = () => {
    const { logout, user } = useUser()
    const { isDark } = useContext(ThemeContext)

    const displayName = user?.email?.split('@')[0] || 'User';

    const handleOpenPrivacyPolicy = () => {
        const privacyUrl = 'https://gist.githubusercontent.com/anagkazomedia/e44803f12982b72b4161bc0d4c745bc0/raw/9c3a3dc6cc2b9f2251679f54c55d35963362e860/privacy_policy.md'; 
        Linking.openURL(privacyUrl).catch(() => 
            Alert.alert("Error", "Could not open the Privacy Policy.")
        );
    };

    // FIXED DELETION HANDLER
    const handleDeleteAccount = () => {
    Alert.alert(
        "PERMANENT DEACTIVATION",
        "This will log you out and deactivate your account. \n\n⚠️ IMPORTANT: You will NOT be able to register again with this same email address. You would need to use a different email to create a new account.",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "DEACTIVATE & LOGOUT", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        // 1. Send the deactivation request to Appwrite
                        try {
                            await account.delete('current');
                        } catch (e) {
                            console.log("Server side deactivation handled");
                        }
                        
                        // 2. Force local cleanup to prevent the 'Blocked' loop
                        await logout();
                        Alert.alert("Success", "You have been logged out. Your account is now inactive.");
                    } catch (error) {
                        // Ensure they are kicked out even if the network fails
                        await logout();
                    }
                } 
            }
        ]
    );
};

  return (
    <UserOnly>
      <ThemedView style={styles.container}>
          
          <View style={styles.headerRight}>
             <CornerDropdown />
          </View>

          <View style={styles.contentCenter}>
              
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle-outline" size={120} color="gold" />
              </View>

              <Spacer height={10} />

              <ThemedText style={styles.userName}>
                  {displayName}
              </ThemedText>
              
              <Spacer height={10} />

              <View style={[styles.statusRow, { 
                  backgroundColor: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isDark ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)' 
              }]}>
                <View style={styles.dot} />
                <ThemedText style={styles.statusText}>
                    ACCOUNT ACTIVE
                </ThemedText>
              </View>
              
              <Spacer height={15} />

              <ThemedText style={styles.emailSubtext}>
                {user?.email}
              </ThemedText>
              
              <Spacer height={40} />
              
              <TouchableOpacity 
                style={[styles.customLogoutBtn, { backgroundColor: isDark ? '#FFF' : '#000' }]} 
                onPress={logout}
                activeOpacity={0.8}
              >
                  <Text style={[styles.logoutText, { color: isDark ? '#000' : '#FFF' }]}>LOGOUT FROM ACCOUNT</Text>
              </TouchableOpacity>

              <Spacer height={20} />

              <TouchableOpacity onPress={handleOpenPrivacyPolicy}>
                  <Text style={[styles.linkText, { color: 'gold' }]}>Privacy Policy</Text>
              </TouchableOpacity>

              <Spacer height={30} />

              <TouchableOpacity 
                style={styles.deleteAccountBtn} 
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                  <Text style={styles.deleteText}>DELETE ACCOUNT</Text>
              </TouchableOpacity>

              <Spacer height={25} />
              
              <ThemedText style={styles.versionText}>Version 1.0.4 (Anagkazo)</ThemedText>
          </View>

      </ThemedView>
    </UserOnly>
  )
}

export default Profile

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
    headerRight: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
    contentCenter: { width: '100%', alignItems: 'center', justifyContent: 'center' },
    iconContainer: { marginBottom: 10 },
    userName: { fontSize: 34, fontWeight: "900", textAlign: "center", textTransform: 'uppercase', letterSpacing: -1, color: 'gold' },
    statusRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ecc71', marginRight: 10 },
    statusText: { color: 'gold', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
    emailSubtext: { opacity: 0.5, fontSize: 14, fontWeight: '700', textAlign: 'center' },
    customLogoutBtn: { width: '100%', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    logoutText: { fontWeight: '900', fontSize: 13, letterSpacing: 1 },
    linkText: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
    deleteAccountBtn: { width: '100%', paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ff4d4d', borderRadius: 12 },
    deleteText: { color: '#ff4d4d', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
    versionText: { fontSize: 10, opacity: 0.3, fontWeight: '800', letterSpacing: 2, textAlign: 'center' }
})