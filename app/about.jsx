import React, { useContext } from 'react';
import { 
  StyleSheet, View, ScrollView, TouchableOpacity, 
  Linking, Image, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import Spacer from '../components/Spacer';
import { ThemeContext } from '../components/ThemedContext';

// Mission Data (No icons)
const CORE_VALUES = [
  { title: "Bible-Centred", desc: "Scripture is the foundation of everything we do — shaping how we live, lead and love." },
  { title: "Christ-like Love", desc: "We meet people with grace, compassion and dignity, just as Jesus did." },
  { title: "Community", desc: "We grow stronger together, walking alongside one another in faith and friendship." },
  { title: "Servant Leadership", desc: "We lead by serving — humbly, faithfully and with the next generation in mind." },
  { title: "Integrity", desc: "We do what is right when no one is watching, honouring God in word and deed." },
  { title: "Mission-Minded", desc: "We carry the hope of the Gospel beyond walls — into homes, schools and streets." },
];

export default function AboutPage() {
  const router = useRouter();
  const { isDark } = useContext(ThemeContext);

  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const openLink = (url) => Linking.openURL(url).catch((err) => console.error(err));
  const openMaps = () => {
    const address = "St. Julian High School Gayaza";
    const url = Platform.select({ ios: `maps:0,0?q=${address}`, android: `geo:0,0?q=${address}` });
    Linking.openURL(url);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerArea}>
            <TouchableOpacity onPress={() => router.back()} style={{marginBottom: 10}}><Icon name="arrow-back" size={24} color="gold" /></TouchableOpacity>
            <ThemedText style={styles.mainTitle}>About Us</ThemedText>
            <View style={styles.goldUnderline} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Branding */}
        <View style={styles.brandSection}>
          <View style={[styles.logoContainer, { borderColor: 'gold' }]}>
             <Image source={require('../assets/anagkazo-logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <ThemedText style={styles.appName}>ANAGKAZO</ThemedText>
        </View>

        {/* Mission/Vision */}
        <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
          <ThemedText style={styles.cardHeading}>Our Mission & Vision</ThemedText>
          <ThemedText style={styles.cardBody}>
            Ministering Mercy, Compelling Souls, Growing them Into Winners. Reaching out to nations with God’s message of Love and influence transforming communities.
          </ThemedText>
        </View>

        {/* Core Values */}
        <ThemedText style={styles.sectionHeading}>Core Values</ThemedText>
        {CORE_VALUES.map((v, i) => (
          <View key={i} style={[styles.infoCard, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
            <ThemedText style={styles.cardHeading}>{v.title}</ThemedText>
            <ThemedText style={styles.cardBody}>{v.desc}</ThemedText>
          </View>
        ))}

        {/* Location Section */}
        <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
          <ThemedText style={styles.cardHeading}>Find Us</ThemedText>
          <ThemedText style={styles.cardBody}>Anagkazo Eagles Fellowship, St. Julian High School Gayaza, Kampala, Uganda</ThemedText>
          <Spacer size={15} />
          <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
             <ThemedText style={styles.mapButtonText}>GET DIRECTIONS</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Links */}
        <TouchableOpacity style={styles.linkRow} onPress={() => openLink('http://anagkazobackend-production.up.railway.app')}>
          <ThemedText style={styles.linkText}>Official Website</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => openLink('mailto:anagkazomedia23@gmail.com')}>
          <ThemedText style={styles.linkText}>Contact Support</ThemedText>
        </TouchableOpacity>

        {/* Legal Links */}
       {/* Legal Links */}
        <TouchableOpacity 
          style={styles.linkRow} 
          onPress={() => openLink('https://raw.githubusercontent.com/markxstar2-wq/Anagkazo-Legal-Docs/refs/heads/main/Disclaimer.md')}
        >
          <ThemedText style={styles.linkText}>Disclaimer</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkRow} 
          onPress={() => openLink('https://raw.githubusercontent.com/markxstar2-wq/Anagkazo-Legal-Docs/refs/heads/main/PRIVACY_POLICY.md')}
        >
          <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkRow} 
          onPress={() => openLink('https://raw.githubusercontent.com/markxstar2-wq/Anagkazo-Legal-Docs/refs/heads/main/Terms%20of%20use.md')}
        >
          <ThemedText style={styles.linkText}>Terms of Use</ThemedText>
        </TouchableOpacity>

        <Spacer size={100} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerSurface: { borderBottomWidth: 1, elevation: 4 },
  headerArea: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  mainTitle: { fontSize: 32, fontWeight: '900', textTransform: 'uppercase' },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 8, borderRadius: 2 },
  scrollContent: { padding: 25 },
  brandSection: { alignItems: 'center', marginVertical: 20 },
  logoContainer: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: '#fff', overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  appName: { fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  sectionHeading: { fontSize: 20, fontWeight: '900', color: 'gold', marginVertical: 15 },
  infoCard: { padding: 22, borderRadius: 12, borderWidth: 1, marginBottom: 25 },
  cardHeading: { fontSize: 16, fontWeight: '900', color: 'gold', marginBottom: 8 },
  cardBody: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
  mapButton: { backgroundColor: 'gold', padding: 12, borderRadius: 12, alignItems: 'center' },
  mapButtonText: { color: '#000', fontWeight: '900' },
  linkRow: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)' },
  linkText: { fontSize: 15, fontWeight: '600' }
});