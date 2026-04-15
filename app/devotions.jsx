import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import Spacer from '../components/Spacer';
import { ThemeContext } from '../components/ThemedContext';

// Data
import devotionsData from '../assets/devotions.json';

export default function DevotionsPage() {
  const router = useRouter();
  const { isDark } = useContext(ThemeContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // 1. IMPROVEMENT: Load last saved position on startup
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem('last_devotion_index');
        if (savedIndex !== null) {
          const index = parseInt(savedIndex);
          // Safety check to ensure index is still valid within the data array
          if (index < devotionsData.length) {
            setCurrentIndex(index);
          }
        }
      } catch (e) {
        console.error("Failed to load devotion progress", e);
      } finally {
        setIsReady(true);
      }
    };
    loadProgress();
  }, []);

  // 2. LOGIC: Save progress whenever the user changes pages
  const handlePageChange = async (newIndex) => {
    setCurrentIndex(newIndex);
    try {
      await AsyncStorage.setItem('last_devotion_index', newIndex.toString());
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const nextDevotion = () => {
    if (currentIndex < devotionsData.length - 1) {
      handlePageChange(currentIndex + 1);
    }
  };

  const prevDevotion = () => {
    if (currentIndex > 0) {
      handlePageChange(currentIndex - 1);
    }
  };

  const goToLatest = () => {
    handlePageChange(devotionsData.length - 1);
  };

  const devotion = devotionsData[currentIndex];

  if (!isReady || !devotion) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="gold" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* HEADER WITH LATEST BUTTON */}
      <View style={[styles.customHeader, { borderBottomColor: isDark ? '#333' : '#F0F0F0' }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={20}>
          <Icon name="chevron-back" size={28} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerMainTitle}>Devotions</ThemedText>

        <TouchableOpacity onPress={goToLatest} style={styles.latestBtn} activeOpacity={0.7}>
          <ThemedText style={styles.latestBtnText}>LATEST</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PAGE COUNTER */}
        <ThemedText style={styles.pageCounter}>
          DEVOTION {currentIndex + 1} OF {devotionsData.length}
        </ThemedText>

        <ThemedText style={styles.devotionTitle}>{devotion.title}</ThemedText>
        <ThemedText style={styles.mainScripture}>{devotion.mainScripture}</ThemedText>

        <View style={styles.goldDivider} />

        {/* BODY TEXT */}
        <ThemedText style={styles.bodyText}>
          {devotion.content}
        </ThemedText>

        <View style={[styles.sectionDivider, { backgroundColor: isDark ? '#333' : '#EEE' }]} />

        {/* FURTHER STUDY */}
        <ThemedText style={styles.subHeading}>Scripture for Further Study</ThemedText>
        <View style={styles.studyContainer}>
          {devotion.furtherStudy.map((ref, index) => (
            <ThemedText key={index} style={styles.studyItem}>• {ref}</ThemedText>
          ))}
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: isDark ? '#333' : '#EEE' }]} />

        {/* LONG PRAYER BOX */}
        <View style={[styles.prayerContainer, { backgroundColor: isDark ? 'rgba(255, 215, 0, 0.05)' : '#FDFDFD' }]}>
          <ThemedText style={styles.prayerHeading}>Prayer</ThemedText>
          <ThemedText style={styles.prayerText}>{devotion.prayer}</ThemedText>
        </View>

        {/* NAVIGATION BUTTONS */}
        <View style={styles.navRow}>
          <TouchableOpacity 
            onPress={prevDevotion} 
            disabled={currentIndex === 0}
            style={[styles.navButton, { opacity: currentIndex === 0 ? 0.2 : 1 }]}
          >
            <Icon name="arrow-back-circle" size={50} color="gold" />
            <ThemedText style={styles.navLabel}>PREV</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={nextDevotion} 
            disabled={currentIndex === devotionsData.length - 1}
            style={[styles.navButton, { opacity: currentIndex === devotionsData.length - 1 ? 0.2 : 1 }]}
          >
            <ThemedText style={styles.navLabel}>NEXT</ThemedText>
            <Icon name="arrow-forward-circle" size={50} color="gold" />
          </TouchableOpacity>
        </View>

        <Spacer size={80} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerMainTitle: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  latestBtn: { backgroundColor: 'gold', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  latestBtnText: { color: '#000', fontSize: 11, fontWeight: '900' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 20 },
  pageCounter: { fontSize: 11, fontWeight: '700', color: 'gold', marginBottom: 10, letterSpacing: 1 },
  devotionTitle: { fontSize: 28, fontWeight: '900', color: '#B8860B', marginBottom: 8 },
  mainScripture: { fontSize: 18, fontWeight: '600', fontStyle: 'italic', marginBottom: 15, opacity: 0.7 },
  goldDivider: { height: 4, width: 40, backgroundColor: '#FFD700', marginBottom: 25, borderRadius: 2 },
  bodyText: { fontSize: 17, lineHeight: 28, textAlign: 'left' },
  sectionDivider: { height: 1, marginVertical: 30 },
  subHeading: { fontSize: 18, fontWeight: '800', marginBottom: 15 },
  studyItem: { fontSize: 16, color: '#B8860B', fontWeight: '700', marginBottom: 10 },
  prayerContainer: { padding: 25, borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#FFD700', marginBottom: 20 },
  prayerHeading: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  prayerText: { fontSize: 16, lineHeight: 26, fontStyle: 'italic', opacity: 0.8 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, paddingBottom: 20 },
  navButton: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  navLabel: { fontWeight: '900', color: 'gold', fontSize: 12 }
});