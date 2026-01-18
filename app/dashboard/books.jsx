import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, View, FlatList, Dimensions, 
  TouchableOpacity, Share, Text, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import YoutubePlayer from "react-native-youtube-iframe";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ThemedView from '../../components/ThemedView'; 
import ThemedText from '../../components/ThemedText'; 

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = width - 40;

// REPLACE THIS WITH YOUR KEY
const API_KEY = 'AIzaSyBaf4btLUotVuyjk90t0Mdhj8CYWq6zjf4'; 
const CHANNEL_ID = 'UCH9G4vzflQn7Ty4K12tR8WQ'; 

export default function SermonsPage() {
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- AUTOMATIC FETCH LOGIC ---
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50`
        );
        const data = await response.json();
        
        // Map the API data to your existing format
        const formattedVideos = data.items
          .filter(item => item.id.videoId) // Ensure it's a video, not a playlist/channel
          .map((item) => ({
            id: item.id.videoId,
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
          }));

        setVideos(formattedVideos);
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
      await Share.share({
        message: `Watch this video: "${title}"\n${videoUrl}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const renderSermon = useCallback(({ item }) => (
    <View style={styles.sermonCard}>
      <View style={styles.videoWrapper}>
        <YoutubePlayer
          height={210}
          width={VIDEO_WIDTH}
          videoId={item.videoId}
          play={false}
          webViewProps={{
            allowsFullscreenVideo: true,
            androidLayerType: 'hardware' 
          }}
        />
      </View>
      
      <View style={styles.contentPadding}>
        <ThemedText style={styles.titleText}>{item.title}</ThemedText>
        <ThemedText style={styles.descriptionText} numberOfLines={3}>
            {item.description}
        </ThemedText>

        <TouchableOpacity 
          style={styles.shareAction} 
          onPress={() => onShare(item.title, item.videoId)}
          activeOpacity={0.7}
        >
          <Icon name="share-social" size={18} color="#ffd700" />
          <Text style={styles.shareText}>Share with Friends</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), []);

  return (
    <ThemedView style={styles.root}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffd700" />
          <ThemedText style={{ marginTop: 10 }}>Loading Videos...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={renderSermon}
          contentContainerStyle={[styles.listPadding, { paddingTop: insets.top + 20 }]}
          ListHeaderComponent={() => (
            <View style={styles.headerArea}>
              <ThemedText style={styles.mainTitle}>Videos</ThemedText>
              <ThemedText style={styles.dateSubText}>Watch our weekly videos</ThemedText>
              <View style={styles.underline} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listPadding: { paddingBottom: 50 },
  headerArea: { paddingHorizontal: 20, marginBottom: 25 },
  mainTitle: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  underline: { height: 4, width: 35, backgroundColor: '#ffd700', marginTop: 4, borderRadius: 2 },
  sermonCard: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  videoWrapper: { backgroundColor: '#000' },
  contentPadding: { padding: 18 },
  titleText: { fontSize: 19, fontWeight: '700', marginBottom: 6 },
  descriptionText: { fontSize: 14, opacity: 0.7, lineHeight: 20, marginBottom: 15 },
  shareAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)', 
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  shareText: { color: '#ffd700', fontWeight: '700', fontSize: 13, marginLeft: 8 },
  dateSubText: { fontSize: 14, opacity: 0.6, fontWeight: '600', marginTop: 4 },

});