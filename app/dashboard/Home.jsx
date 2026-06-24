import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, FlatList, Dimensions, 
  ScrollView, ActivityIndicator, Linking, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../src/services/api'; 
import bibleData from '../../assets/kjv.json';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import CornerDropdown from '../../components/CornerDropdown';
import { ThemeContext } from '../../components/ThemedContext'; 
import CachedImage from '../../components/CachedImage'; 

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width * 0.85;

export default function Home() {
  const router = useRouter();
  const { isDark } = useContext(ThemeContext); 
  
  const [randomVerse, setRandomVerse] = useState(null);
  const [latestVideos, setLatestVideos] = useState([]);
  const [latestDevotions, setLatestDevotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Helper to ensure valid video URL is passed to detail page
  const getVideoSource = (item) => {
    return item.get_video_url || item.video_file || item.video_file_key || "";
  };

  useEffect(() => {
    const init = async () => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setIsOffline(true);
        const vids = await AsyncStorage.getItem('cache_videos');
        const devs = await AsyncStorage.getItem('cache_devs');
        if (vids) setLatestVideos(JSON.parse(vids));
        if (devs) setLatestDevotions(JSON.parse(devs));
      } else {
        try {
          const [vidRes, devRes] = await Promise.all([api.get('api/videos/'), api.get('api/devotions/')]);
          setLatestVideos(vidRes.data.reverse().slice(0, 5));
          setLatestDevotions(devRes.data.reverse().slice(0, 5));
          await AsyncStorage.setItem('cache_videos', JSON.stringify(vidRes.data.reverse().slice(0, 5)));
          await AsyncStorage.setItem('cache_devs', JSON.stringify(devRes.data.reverse().slice(0, 5)));
        } catch (e) { console.error(e); }
      }
      setIsLoading(false);
      pickRandomVerse();
    };
    init();
  }, []);

  const pickRandomVerse = () => {
    const all = bibleData.verses;
    setRandomVerse(all[Math.floor(Math.random() * all.length)]);
  };

  const openSocial = (url) => Linking.openURL(url).catch((err) => console.error(err));

  if (isLoading) return <ThemedView style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator color="gold" /></ThemedView>;

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTopRow}>
              <View>
                <ThemedText style={styles.sectionTitle}>Anagkazo</ThemedText>
                <ThemedText style={styles.dateSubText}>{today}</ThemedText>
              </View>
              <CornerDropdown />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isOffline && <ThemedText style={{textAlign:'center', color:'gold', marginBottom:10, fontWeight:'bold'}}>YOU ARE OFFLINE</ThemedText>}
        
        <View style={[styles.cardContainer, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
          <View style={styles.topRow}>
            <ThemedText style={styles.reference}>{randomVerse ? `${randomVerse.book_name} ${randomVerse.chapter}:${randomVerse.verse}` : ""}</ThemedText>
            <TouchableOpacity onPress={pickRandomVerse}><Icon name="refresh" size={20} color="gold" /></TouchableOpacity>
          </View>
          <ThemedText style={styles.verseText}>{randomVerse ? `"${randomVerse.text.replace('¶ ', '')}"` : ""}</ThemedText>
        </View>

        <View style={styles.headerRow}>
          <ThemedText style={styles.heading}>Latest Videos</ThemedText>
          <TouchableOpacity onPress={() => router.push('/dashboard/books')}><ThemedText style={styles.viewAll}>View All</ThemedText></TouchableOpacity>
        </View>
        <FlatList
          horizontal data={latestVideos} showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
                style={styles.videoCard} 
                onPress={() => router.push({ 
                    pathname: '../video-detail', 
                    params: { 
                        title: item.title, 
                        video_url: getVideoSource(item), // Fixed URL resolution
                        description: item.description, 
                        thumbnail: item.thumbnail, 
                        date: item.created_at 
                    } 
                })}
            >
              <View style={styles.videoWrapper}><CachedImage uri={item.thumbnail} style={{flex:1}} /></View>
              <ThemedText style={styles.videoTitleText} numberOfLines={1}>{item.title}</ThemedText>
            </TouchableOpacity>
          )}
        />

        <Spacer size={25} />

        <View style={styles.headerRow}>
          <ThemedText style={styles.heading}>Latest Devotions</ThemedText>
          <TouchableOpacity onPress={() => router.push('./create')}><ThemedText style={styles.viewAll}>View All</ThemedText></TouchableOpacity>
        </View>
        <FlatList
          horizontal data={latestDevotions} showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.videoCard} onPress={() => router.push({ pathname: '../devotions-detail', params: { title: item.Title, author: item.author, scripture: item.Scripture, body: item.Body, moreScriptures: item.Morescriptures, prayer: item.Prayer, thumbnail: item.thumbnail } })}>
              <View style={styles.videoWrapper}><CachedImage uri={item.thumbnail} style={{flex:1}} /></View>
              <ThemedText style={styles.videoTitleText} numberOfLines={1}>{item.Title}</ThemedText>
            </TouchableOpacity>
          )}
        />

        <Spacer size={25} />
        <TouchableOpacity style={[styles.libraryBtn, { backgroundColor: cardBg, borderColor: dynamicBorder }]} onPress={() => router.push('../Library')}>
            <Icon name="library" size={24} color="gold" />
            <ThemedText style={styles.libraryLabel}>Go to Library</ThemedText>
        </TouchableOpacity>

        <View style={styles.socialSection}>
            <ThemedText style={styles.socialHeading}>Connect With Us</ThemedText>
            <View style={styles.socialRow}>
                <TouchableOpacity onPress={() => openSocial('https://www.tiktok.com/@stjulian.anagakazo.media')} style={styles.socialIcon}><Icon name="logo-tiktok" size={24} color="#FFF" /></TouchableOpacity>
                <TouchableOpacity onPress={() => openSocial('https://www.instagram.com/anagkazomedia')} style={styles.socialIcon}><Icon name="logo-instagram" size={24} color="gold" /></TouchableOpacity>
                <TouchableOpacity onPress={() => openSocial('https://www.facebook.com/@frankmutebi')} style={styles.socialIcon}><Icon name="logo-facebook" size={24} color="#1877F2" /></TouchableOpacity>
                <TouchableOpacity onPress={() => openSocial('https://www.youtube.com/@AnagkazoEaglesFellowship')} style={styles.socialIcon}><Icon name="logo-youtube" size={24} color="#FF0000" /></TouchableOpacity>
            </View>
        </View>
        <Spacer size={80} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerSurface: { borderBottomWidth: 1, elevation: 4 },
  sectionHeader: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 32, fontWeight: '900', textTransform: 'uppercase' },
  dateSubText: { fontSize: 13, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase' },
  scrollContent: { paddingTop: 20 },
  cardContainer: { marginHorizontal: 20, borderRadius: 12, padding: 20, borderWidth: 1, marginBottom: 25 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  reference: { fontSize: 12, fontWeight: '900', color: 'gold', textTransform: 'uppercase' },
  verseText: { fontSize: 18, lineHeight: 28, fontStyle: 'italic', opacity: 0.9 },
  headerRow: { paddingHorizontal: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  viewAll: { fontSize: 12, color: 'gold', fontWeight: '800' },
  videoCard: { marginRight: 15, width: VIDEO_WIDTH },
  videoWrapper: { borderRadius: 12, overflow: 'hidden', height: 200, backgroundColor: '#333' },
  videoTitleText: { marginTop: 10, fontSize: 14, fontWeight: '800' },
  libraryBtn: { marginHorizontal: 20, padding: 15, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  libraryLabel: { fontWeight: '900', fontSize: 16, textTransform: 'uppercase' },
  socialSection: { marginTop: 40, alignItems: 'center', paddingHorizontal: 20 },
  socialHeading: { fontSize: 11, fontWeight: '900', opacity: 0.5, marginBottom: 20 },
  socialRow: { flexDirection: 'row', gap: 15 },
  socialIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }
});