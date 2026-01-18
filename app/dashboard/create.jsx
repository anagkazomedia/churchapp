import React from 'react';
import { 
  StyleSheet, View, ScrollView, 
  TouchableOpacity, Linking, Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from "react-native-youtube-iframe";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';

const { width } = Dimensions.get('window');

export default function DonationsPage() {
  const insets = useSafeAreaInsets();

  const openDialer = () => Linking.openURL('tel:+256123456789'); // Update with church number
  const openWhatsApp = () => Linking.openURL('whatsapp://send?phone=256123456789&text=I would like to support the outreach.');

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <ThemedText style={styles.title}>Anagkazo Outreach</ThemedText>
          <ThemedText style={styles.subtitle}>Changing lives through your support</ThemedText>
        </View>

        {/* SECTION 1: MAIN IMPACT VIDEO */}
        <View style={styles.videoCard}>
          <YoutubePlayer 
            height={210} 
            width={width - 40} 
            videoId="78OfEZR_zNI" // Replace with your organization's video ID
          />
          <View style={styles.cardPadding}>
            <ThemedText style={styles.cardHeading}>Our Mission</ThemedText>
            <ThemedText style={styles.descriptionText}>
              Anagkazo Eagles Scripture Union is dedicated to reaching out to the less privileged. 
              We focus on providing spiritual guidance, educational support, and basic necessities 
              to people in our community.
            </ThemedText>
          </View> 
        </View>

        <Spacer size={25} />

        {/* SECTION 2: WHY WE GIVE */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon name="school-outline" size={24} color="#ffd700" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Educational Support</ThemedText>
              <ThemedText style={styles.infoDesc}>We help cover tuition and school supplies for children who have lost hope of staying in school.</ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="heart-outline" size={24} color="#ffd700" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Feeding & Care</ThemedText>
              <ThemedText style={styles.infoDesc}>Your donations ensure that no child goes to bed hungry through our weekly nutrition programs.</ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="book-outline" size={24} color="#ffd700" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Spiritual Growth</ThemedText>
              <ThemedText style={styles.infoDesc}>We organize fellowships and Scripture Union camps to build a strong foundation of faith.</ThemedText>
            </View>
          </View>
        </View>

        <Spacer size={30} />

        {/* SECTION 3: CONTACT INFORMATION */}
        <View style={styles.sectionRow}>
          <ThemedText style={styles.sectionHeading}>How to Support Us</ThemedText>
        </View>
        
        <View style={styles.contactCard}>
          <TouchableOpacity style={styles.contactItem} onPress={openDialer}>
            <View style={[styles.iconBox, { backgroundColor: '#2ECC71' }]}>
              <Icon name="call" size={24} color="#FFF" />
            </View>
            <View>
              <ThemedText style={styles.contactLabel}>Direct Line</ThemedText>
              <ThemedText style={styles.contactValue}>+256 705 687 845</ThemedText>
            </View>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <View style={[styles.iconBox, { backgroundColor: '#3498DB' }]}>
              <Icon name="mail-outline" size={24} color="#FFF" />
            </View>
            <View>
              <ThemedText style={styles.contactLabel}>Email Inquiry</ThemedText>
              <ThemedText style={styles.contactValue}>anagkazomedia23@gmail.com</ThemedText>
            </View>
          </View>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 16, opacity: 0.7, marginTop: 4 },
  videoCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardPadding: { padding: 20 },
  cardHeading: { fontSize: 20, fontWeight: '800', marginBottom: 10, color: '#ffd700' },
  descriptionText: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
  infoSection: { paddingHorizontal: 25 },
  infoRow: { flexDirection: 'row', marginBottom: 25, gap: 15 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  infoDesc: { fontSize: 14, opacity: 0.6, lineHeight: 20 },
  sectionRow: { paddingHorizontal: 20, marginBottom: 15 },
  sectionHeading: { fontSize: 22, fontWeight: '800' },
  contactCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    gap: 20,
  },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { fontSize: 12, opacity: 0.6, textTransform: 'uppercase', fontWeight: '700' },
  contactValue: { fontSize: 16, fontWeight: '700' },
});