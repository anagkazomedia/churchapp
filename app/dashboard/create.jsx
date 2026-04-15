import React, { useContext } from 'react';
import { 
  StyleSheet, View, ScrollView, 
  TouchableOpacity, Linking, Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from "react-native-youtube-iframe";
import { SafeAreaView } from 'react-native-safe-area-context';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import CornerDropdown from '../../components/CornerDropdown'; 
import { ThemeContext } from '../../components/ThemedContext';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function DonationsPage() {
  const { isDark } = useContext(ThemeContext);
  const theme = isDark ? Colors.dark : Colors.light;

  // Phaneroo-style dynamic colors
  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const openDialer = () => Linking.openURL('tel:+256705687845'); 
  const openEmail = () => Linking.openURL('mailto:anagkazomedia23@gmail.com');

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* 1. PHANEROO HEADER SURFACE */}
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.title}>OUTREACH</ThemedText>
                <ThemedText style={styles.subtitle}>Changing lives through your support</ThemedText>
              </View>
              <CornerDropdown />
            </View>
            <View style={styles.goldUnderline} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SECTION 1: MAIN IMPACT VIDEO */}
        <View style={[styles.videoCard, { 
            backgroundColor: cardBg,
            borderColor: dynamicBorder
        }]}>
          <View style={styles.videoWrapper}>
            <YoutubePlayer 
                height={210} 
                width={width - 40} 
                videoId="78OfEZR_zNI" 
            />
          </View>
          <View style={styles.cardPadding}>
            <ThemedText style={styles.cardHeading}>OUR MISSION</ThemedText>
            <ThemedText style={styles.descriptionText}>
              Anagkazo Eagles Scripture Union is dedicated to reaching out to the less privileged. 
              We focus on providing spiritual guidance, educational support, and basic necessities 
              to people in our community.
            </ThemedText>
          </View> 
        </View>

        <Spacer size={30} />

        {/* SECTION 2: WHY WE GIVE */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1A1A1A' : '#F9F9F9' }]}>
              <Icon name="school-outline" size={24} color="gold" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Educational Support</ThemedText>
              <ThemedText style={styles.infoDesc}>We help cover tuition and school supplies for children who have lost hope of staying in school.</ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1A1A1A' : '#F9F9F9' }]}>
              <Icon name="heart-outline" size={24} color="gold" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Feeding & Care</ThemedText>
              <ThemedText style={styles.infoDesc}>Your donations ensure that no child goes to bed hungry through our weekly nutrition programs.</ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: isDark ? '#1A1A1A' : '#F9F9F9' }]}>
              <Icon name="book-outline" size={24} color="gold" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Spiritual Growth</ThemedText>
              <ThemedText style={styles.infoDesc}>We organize fellowships and Scripture Union camps to build a strong foundation of faith.</ThemedText>
            </View>
          </View>
        </View>

        <Spacer size={20} />

        {/* SECTION 3: CONTACT INFORMATION */}
        <View style={styles.sectionRow}>
          <ThemedText style={styles.sectionHeading}>HOW TO SUPPORT US</ThemedText>
          <View style={styles.goldUnderline} />
        </View>
        
        {/* CONTACT CARD */}
        <View style={[styles.contactCard, { 
            backgroundColor: cardBg,
            borderColor: dynamicBorder
        }]}>
          <TouchableOpacity style={styles.contactItem} onPress={openDialer}>
            <View style={[styles.iconBox, { backgroundColor: '#2ECC71' }]}>
              <Icon name="call" size={20} color="#FFF" />
            </View>
            <View>
              <ThemedText style={styles.contactLabel}>Direct Line</ThemedText>
              <ThemedText style={styles.contactValue}>+256 705 687 845</ThemedText>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: dynamicBorder }]} />

          <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
            <View style={[styles.iconBox, { backgroundColor: '#3498DB' }]}>
              <Icon name="mail-outline" size={20} color="#FFF" />
            </View>
            <View>
              <ThemedText style={styles.contactLabel}>Email Inquiry</ThemedText>
              <ThemedText style={styles.contactValue}>anagkazomedia23@gmail.com</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <Spacer size={60} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerSurface: {
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textTransform: 'uppercase' },
  subtitle: { fontSize: 13, opacity: 0.6, marginTop: 2, fontWeight: '700' },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 8, borderRadius: 2 },

  scrollContent: { paddingBottom: 40, paddingTop: 20 },
  
  videoCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoWrapper: { backgroundColor: '#000' },
  cardPadding: { padding: 20 },
  cardHeading: { fontSize: 13, fontWeight: '900', marginBottom: 8, color: 'gold', letterSpacing: 1.5 },
  descriptionText: { fontSize: 15, lineHeight: 24, opacity: 0.85 },
  
  infoSection: { paddingHorizontal: 25 },
  infoRow: { flexDirection: 'row', marginBottom: 25, gap: 15, alignItems: 'center' },
  infoIconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  infoDesc: { fontSize: 14, opacity: 0.6, lineHeight: 20 },
  
  sectionRow: { paddingHorizontal: 20, marginBottom: 15 },
  sectionHeading: { fontSize: 18, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },

  contactCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  divider: { height: 1, marginVertical: 15, width: '100%' },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { fontSize: 10, opacity: 0.5, textTransform: 'uppercase', fontWeight: '900', letterSpacing: 1 },
  contactValue: { fontSize: 15, fontWeight: '800' },
});