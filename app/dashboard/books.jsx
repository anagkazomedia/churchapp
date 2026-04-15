import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  StyleSheet, View, FlatList, Dimensions, 
  TouchableOpacity, Share, Text, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from "react-native-youtube-iframe";
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo"; // 1. Added NetInfo

import ThemedView from '../../components/ThemedView'; 
import ThemedText from '../../components/ThemedText'; 
import CornerDropdown from '../../components/CornerDropdown'; 
import { ThemeContext } from '../../components/ThemedContext';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width - 40;

const API_KEY = 'AIzaSyBaf4btLUotVuyjk90t0Mdhj8CYWq6zjf4'; 
const CHANNEL_ID = 'UCH9G4vzflQn7Ty4K12tR8WQ'; 

export default function SermonsPage() {
  const { isDark } = useContext(ThemeContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false); // 2. Offline state

  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // 3. Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      // Don't try to fetch if we know we are offline
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50`
        );
        const data = await response.json();
        
        if (data.items) {
          const formattedVideos = data.items
            .filter(item => item.id.videoId)
            .map((item) => ({
              id: item.id.videoId,
              videoId: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
            }));
          setVideos(formattedVideos);
        }
      } catch (error) {
        console.error("Error fetching sermons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const onShare = async (title, videoId) => {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      await Share.share({ message: `Watch this video: "${title}"\n${videoUrl}` });
    } catch (error) { console.log(error.message); }
  };

  const renderSermon = useCallback(({ item }) => (
    <View style={[styles.sermonCard, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
      <View style={styles.videoWrapper}>
        {/* 4. STEP 3: Offline Placeholder for the Player */}
        {isOffline ? (
          <View style={styles.offlineVideoPlaceholder}>
             <Icon name="cloud-offline-outline" size={48} color="gold" />
             <ThemedText style={styles.offlinePlaceholderText}>Connect to watch this sermon</ThemedText>
          </View>
        ) : (
          <YoutubePlayer
            height={210}
            width={VIDEO_WIDTH}
            videoId={item.videoId}
            play={false}
          />
        )}
      </View>
      
      <View style={styles.contentPadding}>
        <ThemedText style={styles.titleText} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.descriptionText} numberOfLines={2}>
            {item.description}
        </ThemedText>

        <TouchableOpacity 
          style={styles.shareAction} 
          onPress={() => onShare(item.title, item.videoId)}
        >
          <Icon name="share-social" size={16} color="gold" />
          <Text style={styles.shareText}>SHARE VIDEO</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [isDark, isOffline]); // isOffline added to dependencies

  return (
    <ThemedView style={styles.root}>
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerArea}>
            <View style={styles.headerTopRow}>
              <View>
                <ThemedText style={styles.mainTitle}>Videos</ThemedText>
                <ThemedText style={styles.dateSubText}>Watch our latest videos</ThemedText>
              </View>
              <CornerDropdown />
            </View>
            <View style={styles.goldUnderline} />
          </View>
        </SafeAreaView>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="gold" />
          <ThemedText style={{ marginTop: 10 }}>Loading Videos...</ThemedText>
        </View>
      ) : isOffline && videos.length === 0 ? (
        // Case where user opens the app offline and has no cached videos
        <View style={styles.loaderContainer}>
          <Icon name="wifi-outline" size={50} color="gold" />
          <ThemedText style={{ marginTop: 15, textAlign: 'center', paddingHorizontal: 40 }}>
            Videos are unavailable while offline. Please check your connection.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={renderSermon}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerSurface: { borderBottomWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  headerArea: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mainTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textTransform: 'uppercase' },
  dateSubText: { fontSize: 13, opacity: 0.6, fontWeight: '600', marginTop: 2 },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 8, borderRadius: 2 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listPadding: { paddingBottom: 100, paddingTop: 20 },
  sermonCard: { marginHorizontal: 20, marginBottom: 25, borderRadius: 12, borderWidth: 1, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  videoWrapper: { backgroundColor: '#000', height: 210 }, // Fixed height for consistency
  
  // 5. Placeholder Styles
  offlineVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  offlinePlaceholderText: {
    color: 'gold',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 10,
    opacity: 0.8
  },

  contentPadding: { padding: 18 },
  titleText: { fontSize: 18, fontWeight: '800', marginBottom: 8, lineHeight: 24 },
  descriptionText: { fontSize: 13, opacity: 0.6, lineHeight: 18, marginBottom: 18 },
  shareAction: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'gold', alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  shareText: { color: 'gold', fontWeight: '900', fontSize: 11, marginLeft: 8, letterSpacing: 1 },
});