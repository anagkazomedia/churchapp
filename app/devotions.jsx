import React, { useState, useEffect, useContext } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API & Components
import api from '../src/services/api';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import Spacer from '../components/Spacer';
import { ThemeContext } from '../components/ThemedContext';

export default function DevotionsPage() {
  const router = useRouter();
  const { isDark } = useContext(ThemeContext);
  const [devotions, setDevotions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('api/devotions/');
        setDevotions(response.data);
        
        const savedIndex = await AsyncStorage.getItem('last_devotion_index');
        if (savedIndex !== null) {
          const index = parseInt(savedIndex);
          if (index < response.data.length) setCurrentIndex(index);
        }
      } catch (e) {
        console.error("Failed to fetch devotions:", e);
      } finally {
        setIsReady(true);
      }
    };
    fetchData();
  }, []);

  const handlePageChange = async (newIndex) => {
    setCurrentIndex(newIndex);
    await AsyncStorage.setItem('last_devotion_index', newIndex.toString());
  };

  const nextDevotion = () => {
    if (currentIndex < devotions.length - 1) handlePageChange(currentIndex + 1);
  };

  const prevDevotion = () => {
    if (currentIndex > 0) handlePageChange(currentIndex - 1);
  };

  const goToLatest = () => {
    handlePageChange(devotions.length - 1);
  };

  const devotion = devotions[currentIndex];

  if (!isReady || !devotion) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="gold" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
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
        <ThemedText style={styles.pageCounter}>
          DEVOTION {currentIndex + 1} OF {devotions.length}
        </ThemedText>

        {/* Updated to match API Case: Title */}
        <ThemedText style={styles.devotionTitle}>{devotion.Title}</ThemedText>
        
        <ThemedText style={styles.authorText}>By {devotion.author}</ThemedText>
        
        {/* Updated to match API Case: Scripture */}
        <ThemedText style={styles.mainScripture}>{devotion.Scripture}</ThemedText>

        <View style={styles.goldDivider} />

        {/* Updated to match API Case: Body */}
        <ThemedText style={styles.bodyText}>{devotion.Body}</ThemedText>

        <View style={[styles.sectionDivider, { backgroundColor: isDark ? '#333' : '#EEE' }]} />

        <ThemedText style={styles.subHeading}>Scripture for Further Study</ThemedText>
        <View style={styles.studyContainer}>
          {/* Updated to match API Case: Morescriptures */}
          <ThemedText style={styles.studyItem}>{devotion.Morescriptures}</ThemedText>
        </View>

        <View style={[styles.sectionDivider, { backgroundColor: isDark ? '#333' : '#EEE' }]} />

        <View style={[styles.prayerContainer, { backgroundColor: isDark ? 'rgba(255, 215, 0, 0.05)' : '#FDFDFD' }]}>
          <ThemedText style={styles.prayerHeading}>Prayer</ThemedText>
          {/* Updated to match API Case: Prayer */}
          <ThemedText style={styles.prayerText}>{devotion.Prayer}</ThemedText>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={prevDevotion} disabled={currentIndex === 0} style={[styles.navButton, { opacity: currentIndex === 0 ? 0.2 : 1 }]}>
            <Icon name="arrow-back-circle" size={50} color="gold" />
            <ThemedText style={styles.navLabel}>PREV</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextDevotion} disabled={currentIndex === devotions.length - 1} style={[styles.navButton, { opacity: currentIndex === devotions.length - 1 ? 0.2 : 1 }]}>
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
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
  headerMainTitle: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  latestBtn: { backgroundColor: 'gold', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  latestBtnText: { color: '#000', fontSize: 11, fontWeight: '900' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 20 },
  pageCounter: { fontSize: 11, fontWeight: '700', color: 'gold', marginBottom: 10, letterSpacing: 1 },
  devotionTitle: { fontSize: 28, fontWeight: '900', color: '#B8860B', marginBottom: 4 },
  authorText: { fontSize: 16, fontWeight: '700', color: '#888', marginBottom: 12, fontStyle: 'italic' },
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