import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions, 
  ScrollView, ActivityIndicator, Linking, Platform, Pressable 
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

// Responsive sizing: Use fixed poster width on TV/web screens, keeping mobile flexible
const IS_LARGE_SCREEN = width > 768 || Platform.OS === 'web';
const VIDEO_WIDTH = IS_LARGE_SCREEN ? 320 : width * 0.75;

export default function Home() {
  const router = useRouter();
  const { isDark } = useContext(ThemeContext); 
  
  const [randomVerse, setRandomVerse] = useState(null);
  const [latestVideos, setLatestVideos] = useState([]);
  const [latestDevotions, setLatestDevotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const headerBg = isDark ? '#000' : '#FFFFFF'; 
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

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
          const [vidRes, devRes] = await Promise.all([
            api.get('api/videos/'), 
            api.get('api/devotions/')
          ]);

          const sortedVideos = [...(vidRes.data || [])]
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 5);

          const sortedDevotions = [...(devRes.data || [])]
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 5);

          setLatestVideos(sortedVideos);
          setLatestDevotions(sortedDevotions);

          await AsyncStorage.setItem('cache_videos', JSON.stringify(sortedVideos));
          await AsyncStorage.setItem('cache_devs', JSON.stringify(sortedDevotions));
        } catch (e) { 
          console.error(e); 
        }
      }
      setIsLoading(false);
      pickRandomVerse();
    };
    init();
  }, []);

  const pickRandomVerse = () => {
    const all = bibleData.verses;
    if (all && all.length > 0) {
      setRandomVerse(all[Math.floor(Math.random() * all.length)]);
    }
  };

  const openSocial = (url) => Linking.openURL(url).catch((err) => console.error(err));

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="gold" size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header Section */}
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: headerBg }}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTopRow}>
              <View>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>ANAGKAZO</ThemedText>
                <ThemedText style={[styles.dateSubText, { color: isDark ? '#888888' : '#666666' }]}>{today}</ThemedText>
              </View>
              <CornerDropdown />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isOffline && (
          <ThemedText style={styles.offlineText}>
            YOU ARE OFFLINE
          </ThemedText>
        )}
        
        {/* Church-Themed Daily Scripture Card */}
        <View style={[styles.cardContainer, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
          <View style={styles.cardGoldAccent} />
          <View style={styles.cardInnerContent}>
            <View style={styles.topRow}>
              <View style={styles.referenceBadge}>
                <Icon name="book" size={14} color="gold" style={{ marginRight: 6 }} />
                <ThemedText style={styles.reference}>
                  {randomVerse ? `${randomVerse.book_name} ${randomVerse.chapter}:${randomVerse.verse}` : ""}
                </ThemedText>
              </View>
              <TouchableOpacity 
                onPress={pickRandomVerse} 
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="refresh" size={20} color="gold" />
              </TouchableOpacity>
            </View>
            <View style={styles.verseBodyWrapper}>
              <Text style={styles.quoteMark}>“</Text>
              <ThemedText style={styles.verseText}>
                {randomVerse?.text ? randomVerse.text.replace('¶ ', '') : ""}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Latest Videos */}
        <View style={styles.headerRow}>
          <ThemedText style={styles.heading}>Latest Videos</ThemedText>
          <TouchableOpacity 
            style={styles.viewAllBtn} 
            activeOpacity={0.8} 
            onPress={() => router.push('./books')}
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal 
          data={latestVideos} 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable 
              style={({ focused }) => [
                styles.videoCard,
                focused && styles.focusedCard
              ]} 
              onPress={() => router.push({ 
                pathname: '/video-detail', 
                params: { 
                  title: String(item.title || ''), 
                  video_file: String(getVideoSource(item)),
                  description: String(item.description || ''), 
                  thumbnail: String(item.thumbnail || ''), 
                  date: String(item.created_at || ''),
                  is_portrait: item.is_portrait ? 'true' : 'false'
                } 
              })}
            >
              <View style={styles.videoWrapper}>
                <CachedImage uri={item.thumbnail} style={styles.cardImage} />
              </View>
              <ThemedText style={styles.videoTitleText} numberOfLines={1}>
                {item.title}
              </ThemedText>
            </Pressable>
          )}
        />

        <Spacer size={25} />

        {/* Latest Devotions */}
        <View style={styles.headerRow}>
          <ThemedText style={styles.heading}>Latest Devotions</ThemedText>
          <TouchableOpacity 
            style={styles.viewAllBtn} 
            activeOpacity={0.8} 
            onPress={() => router.push('./create')}
          >
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal 
          data={latestDevotions} 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable 
              style={({ focused }) => [
                styles.videoCard,
                focused && styles.focusedCard
              ]} 
              onPress={() => router.push({ 
                pathname: '/devotions-detail', 
                params: { 
                  title: String(item.title || item.Title || ''), 
                  author: String(item.author || ''), 
                  scripture: String(item.scripture || item.Scripture || ''), 
                  body: String(item.body || item.Body || ''), 
                  more_scriptures: String(item.moreScriptures || item.Morescriptures || ''), 
                  prayer: String(item.prayer || item.Prayer || ''), 
                  thumbnail: String(item.thumbnail || '') 
                } 
              })}
            >
              <View style={styles.videoWrapper}>
                <CachedImage uri={item.thumbnail} style={styles.cardImage} />
              </View>
              <ThemedText style={styles.videoTitleText} numberOfLines={1}>
                {item.title || item.Title}
              </ThemedText>
            </Pressable>
          )}
        />

        <Spacer size={25} />

        {/* Library Button */}
        <Pressable 
          style={({ focused }) => [
            styles.libraryBtn, 
            { backgroundColor: cardBg, borderColor: dynamicBorder },
            focused && styles.focusedBtn
          ]} 
          onPress={() => router.push('/Library')}
        >
            <Icon name="library" size={24} color="gold" />
            <ThemedText style={styles.libraryLabel}>Go to Library</ThemedText>
        </Pressable>

        {/* Social Links */}
        <View style={styles.socialSection}>
            <ThemedText style={styles.socialHeading}>Connect With Us</ThemedText>
            <View style={styles.socialRow}>
                <TouchableOpacity onPress={() => openSocial('https://vm.tiktok.com/ZS9kcHgxd1pUJ-5ypcB/')} style={[styles.socialIcon, { borderColor: dynamicBorder }]}>
                  <Icon name="logo-tiktok" size={24} color={textColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSocial('https://www.instagram.com/anagkazomedia')} style={[styles.socialIcon, { borderColor: dynamicBorder }]}>
                  <Icon name="logo-instagram" size={24} color="gold" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSocial('https://www.facebook.com/@frankmutebi')} style={[styles.socialIcon, { borderColor: dynamicBorder }]}>
                  <Icon name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openSocial('https://www.youtube.com/@AnagkazoEaglesFellowship')} style={[styles.socialIcon, { borderColor: dynamicBorder }]}>
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
  headerSurface: { borderBottomWidth: 1, elevation: 4 },
  sectionHeader: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    letterSpacing: 1.2 
  },
  dateSubText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  
  scrollContent: { paddingTop: 20 },
  offlineText: { textAlign: 'center', color: 'gold', marginBottom: 10, fontWeight: 'bold' },

  cardContainer: { 
    marginHorizontal: 20, 
    borderRadius: 14, 
    borderWidth: 1, 
    marginBottom: 25,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardGoldAccent: {
    width: 5,
    backgroundColor: 'gold',
  },
  cardInnerContent: {
    flex: 1,
    padding: 18,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  referenceBadge: { flexDirection: 'row', alignItems: 'center' },
  reference: { fontSize: 12, fontWeight: '900', color: 'gold', textTransform: 'uppercase', letterSpacing: 0.8 },
  
  verseBodyWrapper: { flexDirection: 'row', alignItems: 'flex-start' },
  quoteMark: { fontSize: 26, color: 'gold', fontWeight: 'bold', marginRight: 4, marginTop: -2 },
  verseText: { flex: 1, fontSize: 17, lineHeight: 26, fontStyle: 'italic', opacity: 0.9 },

  headerRow: { paddingHorizontal: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  
  viewAllBtn: { 
    backgroundColor: 'gold', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 8 
  },
  viewAll: { fontSize: 11, color: '#000000', fontWeight: '900', textTransform: 'uppercase' },

  /* Card styling optimized for TV & Mobile */
  videoCard: { 
    marginRight: 15, 
    width: VIDEO_WIDTH,
    borderRadius: 12,
    padding: 4,
  },
  focusedCard: {
    transform: [{ scale: 1.04 }],
    borderColor: 'gold',
    borderWidth: 2,
    borderRadius: 14,
  },
  videoWrapper: { 
    borderRadius: 12, 
    overflow: 'hidden', 
    aspectRatio: 16 / 9, 
    backgroundColor: '#333' 
  },
  cardImage: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover'
  },
  videoTitleText: { marginTop: 10, fontSize: 14, fontWeight: '800' },

  libraryBtn: { 
    marginHorizontal: 20, 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10 
  },
  focusedBtn: {
    borderColor: 'gold',
    borderWidth: 2,
    transform: [{ scale: 1.02 }]
  },
  libraryLabel: { fontWeight: '900', fontSize: 16, textTransform: 'uppercase' },

  socialSection: { marginTop: 40, alignItems: 'center', paddingHorizontal: 20 },
  socialHeading: { fontSize: 11, fontWeight: '900', opacity: 0.5, marginBottom: 20, letterSpacing: 1.2 },
  socialRow: { flexDirection: 'row', gap: 15 },
  socialIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 }
});