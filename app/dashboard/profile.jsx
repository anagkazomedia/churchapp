import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useUser } from '../../hooks/useUser'
// ✅ Using Expo Icons
import { Ionicons } from '@expo/vector-icons' 

import Spacer from '../../components/Spacer'
import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import ThemedButton from '../../components/ThemedButton'
import UserOnly from '../../components/UserOnly'

const Profile = () => {
    const { logout, user } = useUser()

    // Extract the name part of the email for a cleaner look if you want
    // e.g., "john.doe@gmail.com" becomes "John.doe"
    const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <UserOnly>
      <ThemedView style={styles.container} safe={true}>
          
          {/* SUCCESS TICK ICON */}
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={120} color="#ffd700" />
          </View>

          <Spacer height={10} />

          {/* 1. BIG ACCOUNT NAME (Primary Focus) */}
          <ThemedText title={true} style={styles.userName}>
              {displayName}
          </ThemedText>
          
          <Spacer height={5} />

          {/* 2. SMALLER STATUS (Secondary Focus) */}
          <View style={styles.statusRow}>
            <View style={styles.dot} />
            <ThemedText style={styles.statusText}>
                Account Active
            </ThemedText>
          </View>
          
          <Spacer height={30} />

          {/* Full email in smaller text below */}
          <ThemedText style={styles.emailSubtext}>
            {user?.email}
          </ThemedText>
          
          <Spacer height={40} />
          
          <ThemedButton onPress={logout}>
              <Text style={styles.logoutText}>Logout</Text>
          </ThemedButton>
      </ThemedView>
    </UserOnly>
  )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20
    },
    iconContainer: {
        marginBottom: 10,
    },
    userName: {
        fontSize: 32, // Large and bold
        fontWeight: "900",
        textAlign: "center",
        textTransform: 'capitalize', // Makes the name look formal
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)', // Very faint gold background
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2ecc71', // Green dot for "Active"
        marginRight: 8,
    },
    statusText: {
        color: '#ffd700',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    emailSubtext: {
        color: '#7f8c8d',
        fontSize: 14,
        fontStyle: 'italic'
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold'
    }
})