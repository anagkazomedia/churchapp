import React, { useContext } from 'react';
import { 
  StyleSheet, View, ScrollView, TouchableOpacity, 
  Linking, Image, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import Spacer from '../components/Spacer';
import { ThemeContext } from '../components/ThemedContext';

export default function AboutPage() {
  const { isDark } = useContext(ThemeContext);

  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const openLink = (url) => {
    if (!url) return; // Guard against empty links
    Linking.openURL(url).catch((err) => console.error("URL Error", err));
  };

  const openMaps = () => {
    const address = "St. Julian High School Gayaza";
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });
    Linking.openURL(url);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerArea}>
            <ThemedText style={styles.mainTitle}>About Us</ThemedText>
            <View style={styles.goldUnderline} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BRANDING SECTION */}
        <View style={styles.brandSection}>
          <View style={[styles.logoContainer, { borderColor: 'gold' }]}>
             <Image 
                source={require('../assets/anagkazo-logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
             />
          </View>
          <ThemedText style={styles.appName}>ANAGKAZO</ThemedText>
          <ThemedText style={styles.versionText}>Version 1.0.4</ThemedText>
        </View>

        {/* MISSION CARD */}
        <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
          <ThemedText style={styles.cardHeading}>Our Mission</ThemedText>
          <ThemedText style={styles.cardBody}>
            Welcome to Anagkazo Eagles fellowship. Our mission is to reach the world 
            with the gospel through the intersection of technology and faith, 
            making the Word of God accessible to all, everywhere. Luke 14:23
          </ThemedText>
        </View>

        {/* LOCATION SECTION */}
        <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
          <View style={styles.rowTitle}>
            <Icon name="location-sharp" size={18} color="gold" />
            <ThemedText style={[styles.cardHeading, { marginLeft: 8, marginBottom: 0 }]}>Find Us</ThemedText>
          </View>
          <Spacer size={10} />
          <ThemedText style={styles.cardBody}>
            Anagkazo Eagles Fellowship{"\n"}
            St. Julian High School Gayaza{"\n"}
            Kampala, Uganda
          </ThemedText>
          <Spacer size={15} />
          <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
             <Icon name="map-outline" size={16} color="#000" />
             <ThemedText style={styles.mapButtonText}>GET DIRECTIONS</ThemedText>
          </TouchableOpacity>
        </View>

        {/* LINKS */}
        <View style={styles.linkSection}>
          <TouchableOpacity style={styles.linkRow} onPress={() => openLink('https://phaneroo.org')}>
            <Icon name="globe-outline" size={20} color="gold" />
            <ThemedText style={styles.linkText}>Official Website</ThemedText>
            <Icon name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          {/* FIX: Opens Gmail/Email App directly */}
          <TouchableOpacity style={styles.linkRow} onPress={() => openLink('mailto:anagkazomedia23@gmail.com')}>
            <Icon name="mail-outline" size={20} color="gold" />
            <ThemedText style={styles.linkText}>Contact Support</ThemedText>
            <Icon name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <Spacer size={40} />
        
        <ThemedText style={styles.copyrightText}>
          © 2026 Anagkazo Ministry. All rights reserved.
        </ThemedText>
        <Spacer size={100} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerSurface: { borderBottomWidth: 1, elevation: 4 },
  headerArea: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  mainTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textTransform: 'uppercase' },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 8, borderRadius: 2 },
  
  scrollContent: { padding: 25 },
  brandSection: { alignItems: 'center', marginVertical: 20 },
  
  logoContainer: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    borderWidth: 3, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff' 
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },

  appName: { fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  versionText: { fontSize: 13, opacity: 0.5, fontWeight: '700', marginTop: 5 },
  
  infoCard: { padding: 22, borderRadius: 12, borderWidth: 1, marginBottom: 25 },
  rowTitle: { flexDirection: 'row', alignItems: 'center' },
  cardHeading: { fontSize: 16, fontWeight: '900', color: 'gold', textTransform: 'uppercase', marginBottom: 10 },
  cardBody: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
  
  mapButton: { 
    backgroundColor: 'gold', 
    flexDirection: 'row', 
    padding: 12, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8
  },
  mapButtonText: { color: '#000', fontWeight: '900', fontSize: 12 },

  linkSection: { gap: 5 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)' },
  linkText: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '600' },
  copyrightText: { textAlign: 'center', fontSize: 11, opacity: 0.4, fontWeight: '700', textTransform: 'uppercase' }
});