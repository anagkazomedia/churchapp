import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Share, 
  FlatList, Dimensions, ScrollView, ActivityIndicator, Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from "react-native-youtube-iframe";
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";

import bibleData from '../../assets/kjv.json';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import CornerDropdown from '../../components/CornerDropdown';
import { Colors } from "../../constants/Colors"; 
import { ThemeContext } from '../../components/ThemedContext'; 

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width * 0.85;

const API_KEY = 'AIzaSyBaf4btLUotVuyjk90t0Mdhj8CYWq6zjf4'; 
const UPLOADS_PLAYLIST_ID = 'UUH9G4vzflQn7Ty4K12tR8WQ';

export default function Home() {
  const router = useRouter();
  const { isDark } = useContext(ThemeContext); 
  
  const [randomVerse, setRandomVerse] = useState(null);
  const [latestVideos, setLatestVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLatestVideos = async () => {
      try {
        setIsLoadingVideos(true);
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=5&key=${API_KEY}`
        );
        const data = await response.json();
        if (data && data.items) {
          const formatted = data.items.map((item) => ({
            id: item.contentDetails.videoId,
            videoId: item.contentDetails.videoId,
            title: item.snippet.title,
          }));
          setLatestVideos(formatted);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchLatestVideos();
  }, []);

  const pickRandomVerse = useCallback(() => {
    if (bibleData && bibleData.verses) {
      const allVerses = bibleData.verses;
      const randomIndex = Math.floor(Math.random() * allVerses.length);
      setRandomVerse(allVerses[randomIndex]);
    }
  }, []);

  useEffect(() => {
    pickRandomVerse();
  }, [pickRandomVerse]);

  const openSocial = (url) => {
    Linking.openURL(url).catch((err) => console.error(err));
  };

  if (!randomVerse) return (
    <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="gold" />
    </ThemedView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTopRow}>
              <View>
                <ThemedText style={styles.sectionTitle}>{`Anagkazo`}</ThemedText>
                <ThemedText style={styles.dateSubText}>{today}</ThemedText>
              </View>
              <CornerDropdown />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.cardContainer, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
          <View style={styles.topRow}>
            <ThemedText style={styles.reference}>
               {`${randomVerse.book_name} ${randomVerse.chapter}:${randomVerse.verse}`}
            </ThemedText>
            <TouchableOpacity onPress={pickRandomVerse} hitSlop={15}>
              <Icon name="refresh" size={20} color="gold" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.verseText}>{`"${randomVerse.text.replace('¶ ', '')}"`}</ThemedText>
        </View>

        <View style={styles.headerRow}>
          <ThemedText style={styles.heading}>{`Latest Videos`}</ThemedText>
          <View style={styles.goldUnderline} />
        </View>

        {isLoadingVideos ? (
          <ActivityIndicator size="small" color="gold" style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={latestVideos}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={VIDEO_WIDTH + 15}
            decelerationRate="fast"
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <View style={styles.videoCard}>
                <View style={styles.videoWrapper}>
                  {isOffline ? (
                    <View style={styles.offlinePlaceholder}>
                      <Icon name="cloud-offline-outline" size={36} color="gold" />
                      <ThemedText style={styles.offlinePlaceholderText}>{`Connect to watch sermon`}</ThemedText>
                    </View>
                  ) : (
                    <YoutubePlayer height={200} width={VIDEO_WIDTH} videoId={item.videoId} play={false} />
                  )}
                </View>
                <ThemedText style={styles.videoTitleText} numberOfLines={1}>{item.title}</ThemedText>
              </View>
            )}
          />
        )}

        <Spacer size={25} />

        <TouchableOpacity 
          style={[styles.devotionBtn, { 
            backgroundColor: isDark ? 'rgba(255, 215, 0, 0.05)' : '#FFF',
            borderColor: isDark ? 'rgba(255, 215, 0, 0.2)' : '#EEE'
          }]}
          onPress={() => router.push('/devotions')}
          activeOpacity={0.8}
        >
          <View style={styles.devotionContent}>
            <Icon name="book" size={24} color="gold" />
            <View>
              <ThemedText style={styles.devotionTitle}>{`Daily Devotion`}</ThemedText>
              <ThemedText style={styles.devotionSub}>{`Read today's word and prayer`}</ThemedText>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="gold" />
        </TouchableOpacity>

        <View style={styles.bannerRow}>
            <TouchableOpacity 
              style={[styles.bannerHalf, { backgroundColor: cardBg, borderColor: dynamicBorder }]} 
              onPress={() => router.push('/dashboard/create')}
            >
                <Icon name="heart" size={24} color="gold" />
                <ThemedText style={styles.bannerLabel}>{`Giving`}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bannerHalf, { backgroundColor: cardBg, borderColor: dynamicBorder }]} 
              onPress={() => router.push('../Library')}
            >
                <Icon name="library" size={24} color="gold" />
                <ThemedText style={styles.bannerLabel}>{`Library`}</ThemedText>
            </TouchableOpacity>
        </View>

        <View style={styles.socialSection}>
            <ThemedText style={styles.socialHeading}>{`Connect With Us`}</ThemedText>
            <View style={styles.socialRow}>
                <TouchableOpacity onPress={() => openSocial('https://www.tiktok.com/@stjulian.anagakazo.media?_r=1&_t=ZS-93y5DyUHv2Q')} style={[styles.socialIcon, {backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0'}]}>
                    <Icon name="logo-tiktok" size={24} color={isDark ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openSocial('https://www.instagram.com/anagkazomedia?igsh=bnVqbzh2ajc2Z2d1')} 
                  style={[styles.socialIcon, {backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0'}]}
                >
                  <Icon name="logo-instagram" size={24} color="gold" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSocial('https://www.facebook.com/@frankmutebi')} style={[styles.socialIcon, {backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0'}]}>
                    <Icon name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSocial('https://www.youtube.com/@AnagkazoEaglesFellowship')} style={[styles.socialIcon, {backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0'}]}>
                    <Icon name="logo-youtube" size={24} color="#FF0000" />
                </TouchableOpacity>
            </View>
        </View>

        <Spacer size={80} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerSurface: { borderBottomWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionHeader: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textTransform: 'uppercase' },
  dateSubText: { fontSize: 13, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase' },
  scrollContent: { paddingTop: 20 },
  cardContainer: { marginHorizontal: 20, borderRadius: 12, padding: 20, borderWidth: 1, marginBottom: 25, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  reference: { fontSize: 12, fontWeight: '900', color: 'gold', textTransform: 'uppercase' },
  verseText: { fontSize: 18, lineHeight: 28, fontStyle: 'italic', opacity: 0.9 },
  headerRow: { paddingHorizontal: 20, marginBottom: 15 },
  heading: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  goldUnderline: { height: 4, width: 35, backgroundColor: 'gold', marginTop: 5, borderRadius: 2 },
  videoCard: { marginRight: 15, width: VIDEO_WIDTH },
  videoWrapper: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', height: 200 },
  videoTitleText: { marginTop: 10, fontSize: 14, fontWeight: '800' },
  offlinePlaceholder: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  offlinePlaceholderText: {
    color: 'gold',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    opacity: 0.8
  },
  devotionBtn: { marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 12, borderWidth: 1, borderLeftWidth: 8, borderLeftColor: 'gold', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  devotionContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  devotionTitle: { fontSize: 17, fontWeight: '900', textTransform: 'uppercase' },
  devotionSub: { fontSize: 12, opacity: 0.6, fontWeight: '600' },
  bannerRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 10, marginBottom: 30 },
  bannerHalf: { width: '48%', height: 90, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1 },
  bannerLabel: { fontWeight: '900', fontSize: 14, textTransform: 'uppercase' },
  socialSection: { marginTop: 10, alignItems: 'center', paddingHorizontal: 20 },
  socialHeading: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', opacity: 0.5, letterSpacing: 1.5, marginBottom: 20 },
  socialRow: { flexDirection: 'row', gap: 15, justifyContent: 'center' },
  socialIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }
});