import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Share, 
  FlatList, Dimensions, ScrollView, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from "react-native-youtube-iframe";
import { useRouter } from 'expo-router';

// Components & Data
import bibleData from '../../assets/kjv.json';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width * 0.85;

// API CONFIG
const API_KEY = 'AIzaSyBaf4btLUotVuyjk90t0Mdhj8CYWq6zjf4'; 
const UPLOADS_PLAYLIST_ID = 'UUH9G4vzflQn7Ty4K12tR8WQ';

export default function Home() {
  const router = useRouter();
  const [randomVerse, setRandomVerse] = useState(null);
  const [latestVideos, setLatestVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  });

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
        console.error("Home Video Fetch Error:", error);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchLatestVideos();
  }, []);

  const pickRandomVerse = useCallback(() => {
    const allVerses = bibleData.verses;
    const randomIndex = Math.floor(Math.random() * allVerses.length);
    setRandomVerse(allVerses[randomIndex]);
  }, []);

  useEffect(() => {
    pickRandomVerse();
  }, [pickRandomVerse]);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${randomVerse.text} - ${randomVerse.book_name} ${randomVerse.chapter}:${randomVerse.verse} (KJV)`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!randomVerse) return (
    <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="gold" />
    </ThemedView>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1: HEADER */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Anagkazo</ThemedText>
          <ThemedText style={styles.dateSubText}>{today}</ThemedText>
        </View>

        {/* SECTION 2: SCRIPTURE CARD */}
        <View style={styles.cardContainer}>
          <View style={styles.topRow}>
            <View style={styles.refBadge}>
               <ThemedText style={styles.reference}>
                {randomVerse.book_name} {randomVerse.chapter}:{randomVerse.verse}
              </ThemedText>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={onShare} style={styles.iconButton} hitSlop={15}>
                <Icon name="share-outline" size={20} color="#7F8C8D" />
              </TouchableOpacity>
              <TouchableOpacity onPress={pickRandomVerse} style={styles.iconButton} hitSlop={15}>
                <Icon name="refresh" size={20} color="#ffd700" />
              </TouchableOpacity>
            </View>
          </View>
          <ThemedText style={styles.verseText}>
            "{randomVerse.text.replace('¶ ', '')}"
          </ThemedText>
        </View>

        {/* SECTION 3: SUPPORT BANNER */}
        <TouchableOpacity 
          style={styles.bannerContainer} 
          onPress={() => router.push('/dashboard/create')} 
          activeOpacity={0.9}
        >
            <View style={styles.bannerOverlay}>
              <View>
                <ThemedText style={styles.bannerTitle}>Support Our Ministry</ThemedText>
                <ThemedText style={styles.bannerSubTitle}>Partner with us today</ThemedText>
              </View>
              <View style={styles.actionBtn}>
                <ThemedText style={styles.actionBtnText}>Give</ThemedText>
                <Icon name="heart" size={16} color="#000" />
              </View>
            </View>
        </TouchableOpacity>

        {/* SECTION 4: LIBRARY BANNER (Newly Added in the same style) */}
        <TouchableOpacity 
          style={[styles.bannerContainer, { marginTop: 15 }]} 
          onPress={() => router.push('../Library')} 
          activeOpacity={0.9}
        >
            <View style={[styles.bannerOverlay, { borderColor: 'rgba(255, 215, 0, 0.3)' }]}>
              <View>
                <ThemedText style={styles.bannerTitle}>Digital Library</ThemedText>
                <ThemedText style={styles.bannerSubTitle}>Download PDF Books & Resources</ThemedText>
              </View>
              <View style={styles.actionBtn}>
                <ThemedText style={styles.actionBtnText}>Read</ThemedText>
                <Icon name="library" size={16} color="#000" />
              </View>
            </View>
        </TouchableOpacity>

        <Spacer size={35} />

        {/* SECTION 5: LATEST VIDEOS */}
        <View style={styles.headerRow}>
          <View>
            <ThemedText style={styles.heading}>Latest Videos</ThemedText>
            <View style={styles.goldUnderline} />
          </View>
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
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.videoCard}>
                <View style={styles.videoWrapper}>
                  <YoutubePlayer height={200} width={VIDEO_WIDTH} videoId={item.videoId} play={false} />
                </View>
                <ThemedText style={styles.videoTitleText} numberOfLines={1}>{item.title}</ThemedText>
              </View>
            )}
          />
        )}

        <Spacer size={30} />
        
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { paddingHorizontal: 20, marginTop: 60, marginBottom: 15 },
  sectionTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  dateSubText: { fontSize: 14, opacity: 0.6, fontWeight: '600', marginTop: 4 },
  cardContainer: { marginHorizontal: 20, borderRadius: 24, padding: 22, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  reference: { fontSize: 13, fontWeight: '800', color: '#ffd700', textTransform: 'uppercase' },
  verseText: { fontSize: 18, lineHeight: 28, fontStyle: 'italic', opacity: 0.9 },
  bannerContainer: { marginHorizontal: 20, height: 100, marginTop: 25 },
  bannerOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 24, 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)' 
  },
  bannerTitle: { fontSize: 20, fontWeight: '800' },
  bannerSubTitle: { fontSize: 13, opacity: 0.7, marginTop: 2 },
  actionBtn: { backgroundColor: '#ffd700', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  headerRow: { paddingHorizontal: 20, marginBottom: 15 },
  heading: { fontSize: 22, fontWeight: '800' },
  goldUnderline: { height: 3, width: 30, backgroundColor: '#ffd700', marginTop: 4, borderRadius: 2 },
  videoCard: { marginRight: 15, width: VIDEO_WIDTH },
  videoWrapper: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  videoTitleText: { marginTop: 12, fontSize: 16, fontWeight: '700', paddingHorizontal: 5 },
  iconButton: { padding: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10 },
});