import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, View, FlatList, ActivityIndicator, 
  TouchableOpacity, TextInput, Platform, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../src/services/api';
import ThemedView from '../../components/ThemedView'; 
import ThemedText from '../../components/ThemedText'; 
import { ThemeContext } from '../../components/ThemedContext';
import CornerDropdown from '../../components/CornerDropdown';
import CachedImage from '../../components/CachedImage';

export default function SermonsPage() {
  const { isDark } = useContext(ThemeContext);
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const net = await NetInfo.fetch();
      
      if (!net.isConnected) {
        const cached = await AsyncStorage.getItem('cache_videos');
        if (cached) setVideos(JSON.parse(cached));
      } else {
        try {
          const response = await api.get('api/videos/');
          // DIAGNOSTIC: Log the first item to confirm if get_video_url is present
          console.log("--- API DEBUG: First Video Item ---");
          console.log(response.data[0]); 
          
          const data = response.data.reverse();
          setVideos(data);
          await AsyncStorage.setItem('cache_videos', JSON.stringify(data));
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

  // DEFENSIVE FIX: Logic to reconstruct the URL if the API field is missing
// UPDATED: Added encodeURI to handle special characters in B2 filenames
  const getVideoSource = (item) => {
    const rawUrl = item.get_video_url || item.video_file || item.video_file_key || "";
    if (!rawUrl) return "";

    const trimmed = rawUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    const cleanKey = trimmed.replace(/^\/+/, '');
    return `https://f005.backblazeb2.com/file/anagkazo-storage/${cleanKey}`;
  };

  const filteredVideos = videos.filter((video) =>
    video?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const renderSermon = ({ item }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => router.push({
        pathname: '../video-detail',
        params: { 
            title: item.title, 
            video_url: getVideoSource(item),
            get_video_url: item.get_video_url,
            video_file: item.video_file,
            video_file_key: item.video_file_key,
            description: item.description, 
            thumbnail: item.thumbnail,
            date: item.created_at
        }
      })}
    >
      <View style={styles.thumbnailWrapper}>
        <CachedImage uri={item.thumbnail} style={styles.thumbnail} type="video" />
        <View style={styles.playOverlay}>
            <Icon name="play" size={40} color="white" />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.titleText} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.root}>
      <View style={[styles.header, { backgroundColor: isDark ? '#121212' : '#F0F0F3' }]}>
        <View style={styles.headerTop}>
            <ThemedText style={styles.headerTitle}>Videos</ThemedText>
            <CornerDropdown />
        </View>
        
        <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="gold" style={styles.searchIcon} />
            <TextInput
            style={styles.searchInput}
            placeholder="Search videos..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            />
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="gold" />
        </View>
      ) : (
        <FlatList
          data={filteredVideos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSermon}
          contentContainerStyle={styles.listPadding}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20, 
    paddingBottom: 20 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  headerTitle: { fontSize: 24, fontWeight: '900', textTransform: 'uppercase' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: 'gold', fontSize: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listPadding: { paddingBottom: 50 },
  videoItem: { marginBottom: 25, paddingHorizontal: 15 },
  thumbnailWrapper: { width: '100%', height: 220, backgroundColor: '#333', borderRadius: 8, overflow: 'hidden' },
  thumbnail: { width: '100%', height: '100%' },
  playOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.2)' 
  },
  infoContainer: { padding: 12 },
  titleText: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  dateText: { fontSize: 13, opacity: 0.6, fontWeight: '600' }
});