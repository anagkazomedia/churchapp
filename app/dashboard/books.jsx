import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { 
  StyleSheet, View, Animated, Dimensions, 
  TouchableOpacity, Share, Text, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from "react-native-youtube-iframe";
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";

import ThemedView from '../../components/ThemedView'; 
import ThemedText from '../../components/ThemedText'; 
import CornerDropdown from '../../components/CornerDropdown'; 
import { ThemeContext } from '../../components/ThemedContext';

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width - 40;

// This must be exact: Video(210) + Content(~175) + MarginBottom(25)
const ITEM_SIZE = 410; 

const API_KEY = 'AIzaSyBaf4btLUotVuyjk90t0Mdhj8CYWq6zjf4'; 
const CHANNEL_ID = 'UCH9G4vzflQn7Ty4K12tR8WQ'; 

const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function SermonsPage() {
  const { isDark } = useContext(ThemeContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const textOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const onShare = async (title, videoId) => {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      await Share.share({ message: `Watch this: "${title}"\n${videoUrl}` });
    } catch (error) { console.log(error.message); }
  };

  const renderSermon = useCallback(({ item, index }) => {
    /** * THE PHANEROO FIX: 
     * We create a window around the item. 
     * As the scrollY passes this item's position, it scales up to 1.
     * When it's far above or far below, it scales down.
     */
    const inputRange = [
      (index - 1) * ITEM_SIZE,
      index * ITEM_SIZE,
      (index + 1) * ITEM_SIZE,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[
        styles.sermonCard, 
        { 
          backgroundColor: cardBg, 
          borderColor: dynamicBorder,
          opacity,
          transform: [{ scale }] 
        }
      ]}>
        <View style={styles.videoWrapper}>
          {isOffline ? (
            <View style={styles.offlineVideoPlaceholder}>
               <Icon name="cloud-offline-outline" size={48} color="gold" />
               <ThemedText style={styles.offlinePlaceholderText}>Connect to watch</ThemedText>
            </View>
          ) : (
            <YoutubePlayer height={210} width={VIDEO_WIDTH} videoId={item.videoId} play={false} />
          )}
        </View>
        
        <View style={styles.contentPadding}>
          <ThemedText style={styles.titleText} numberOfLines={2}>{item.title}</ThemedText>
          <ThemedText style={styles.descriptionText} numberOfLines={2}>{item.description}</ThemedText>
          <TouchableOpacity style={styles.shareAction} onPress={() => onShare(item.title, item.videoId)}>
            <Icon name="share-social" size={16} color="gold" />
            <Text style={styles.shareText}>SHARE VIDEO</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }, [isDark, isOffline]);

  return (
    <ThemedView style={styles.root}>
      <Animated.View style={[
        styles.headerSurface, 
        { 
          height: headerHeight,
          backgroundColor: headerBg, 
          borderBottomColor: dynamicBorder,
          zIndex: 100
        }
      ]}>
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={styles.headerArea}>
            <View style={styles.headerTopRow}>
              <Animated.View style={{ opacity: textOpacity }}>
                <ThemedText style={styles.mainTitle}>Videos</ThemedText>
                <ThemedText style={styles.dateSubText}>Watch our latest videos</ThemedText>
              </Animated.View>
              <CornerDropdown />
            </View>
            <Animated.View style={[styles.goldUnderline, { opacity: textOpacity }]} />
          </View>
        </SafeAreaView>
      </Animated.View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="gold" />
        </View>
      ) : (
        <Animated.FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={renderSermon}
          contentContainerStyle={[styles.listPadding, { paddingTop: HEADER_MAX_HEIGHT + 20 }]}
          showsVerticalScrollIndicator={false}
          
          // PHYSICS FIX:
          snapToAlignment="start"
          decelerationRate="normal" // Changed from 'fast' to allow continuous scrolling
          snapToInterval={ITEM_SIZE}
          
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerSurface: { position: 'absolute', top: 0, left: 0, right: 0, borderBottomWidth: 1, elevation: 4, zIndex: 100 },
  headerArea: { paddingHorizontal: 20, flex: 1, justifyContent: 'center' },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textTransform: 'uppercase' },
  dateSubText: { fontSize: 13, opacity: 0.6, fontWeight: '600', marginTop: 2 },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 8, borderRadius: 2 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listPadding: { paddingBottom: 120 },
  sermonCard: { 
    marginHorizontal: 20, 
    marginBottom: 25, 
    borderRadius: 12, 
    borderWidth: 1, 
    overflow: 'hidden', 
    elevation: 3,
    // Ensure height is stable for animation
    height: ITEM_SIZE - 25 
  },
  videoWrapper: { backgroundColor: '#000', height: 210 },
  offlineVideoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  offlinePlaceholderText: { color: 'gold', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginTop: 10, opacity: 0.8 },
  contentPadding: { padding: 18 },
  titleText: { fontSize: 18, fontWeight: '800', marginBottom: 8, lineHeight: 24 },
  descriptionText: { fontSize: 13, opacity: 0.6, lineHeight: 18, marginBottom: 18 },
  shareAction: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'gold', alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  shareText: { color: 'gold', fontWeight: '900', fontSize: 11, marginLeft: 8, letterSpacing: 1 },
});