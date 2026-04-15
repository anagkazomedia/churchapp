import React, { useContext } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useUser } from '../../hooks/useUser'
import { Ionicons } from '@expo/vector-icons' 

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

  return (
    <UserOnly>
      <ThemedView style={styles.container}>
          
          {/* ABSOLUTE POSITIONED DROPDOWN: Stays top right regardless of centering */}
          <View style={styles.headerRight}>
             <CornerDropdown />
          </View>

          {/* CENTERED CONTENT WRAPPER */}
          <View style={styles.contentCenter}>
              
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle-outline" size={120} color="gold" />
              </View>

              <Spacer height={10} />

              <ThemedText style={styles.userName}>
                  {displayName}
              </ThemedText>
              
              <Spacer height={10} />

              {/* STATUS ROW */}
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
              
              <Spacer height={60} />
              
              <TouchableOpacity 
                style={[styles.customLogoutBtn, { backgroundColor: isDark ? '#FFF' : '#000' }]} 
                onPress={logout}
                activeOpacity={0.8}
              >
                  <Text style={[styles.logoutText, { color: isDark ? '#000' : '#FFF' }]}>LOGOUT FROM ACCOUNT</Text>
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
    container: {
        flex: 1,
        // Centering logic
        justifyContent: "center", 
        alignItems: "center",
        paddingHorizontal: 30
    },
    headerRight: {
        position: 'absolute',
        top: 60, // Adjust based on your status bar height
        right: 20,
        zIndex: 10
    },
    contentCenter: {
        width: '100%',
        alignItems: 'center', // Horizontal center
        justifyContent: 'center', // Vertical center
    },
    iconContainer: {
        marginBottom: 10,
    },
    userName: {
        fontSize: 34,
        fontWeight: "900",
        textAlign: "center",
        textTransform: 'uppercase',
        letterSpacing: -1,
        color: 'gold'
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2ecc71',
        marginRight: 10,
    },
    statusText: {
        color: 'gold',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    emailSubtext: {
        opacity: 0.5,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center'
    },
    customLogoutBtn: {
        width: '100%',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5
    },
    logoutText: {
        fontWeight: '900',
        fontSize: 13,
        letterSpacing: 1
    },
    versionText: {
        fontSize: 10,
        opacity: 0.3,
        fontWeight: '800',
        letterSpacing: 2,
        textAlign: 'center'
    }
})