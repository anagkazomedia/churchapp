import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, View, FlatList, ActivityIndicator, 
  Pressable, TextInput, Platform, StatusBar, Dimensions 
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_LARGE_SCREEN = SCREEN_WIDTH > 768 || Platform.OS === 'web';
const NUM_COLUMNS = IS_LARGE_SCREEN ? 3 : 1;
const PADDING_HORIZONTAL = 15;

export default function SermonsPage() {
  const { isDark } = useContext(ThemeContext);
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dynamic Theme Colors
  const headerBg = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const searchBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  const sortNewestFirst = (dataArray) => {
    if (!Array.isArray(dataArray)) return [];
    return [...dataArray].sort((a, b) => {
      const dateA = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const net = await NetInfo.fetch();
      
      if (!net.isConnected) {
        const cached = await AsyncStorage.getItem('cache_videos');
        if (cached) {
          const parsed = JSON.parse(cached);
          setVideos(sortNewestFirst(parsed));
        }
      } else {
        try {
          const response = await api.get('api/videos/');
          const sortedData = sortNewestFirst(response.data);
          setVideos(sortedData);
          await AsyncStorage.setItem('cache_videos', JSON.stringify(sortedData));
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const getVideoSource = (item) => {
    const rawUrl = item?.get_video_url || item?.video_file || item?.video_file_key || "";
    if (!rawUrl) return "";

    const trimmed = rawUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    const cleanKey = trimmed.replace(/^\/+/, '');
    return `https://f005.backblazeb2.com/file/anagkazo-storage/${cleanKey}`;
  };

  const isPortraitVideo = (item) => {
    if (!item) return false;
    if (typeof item.is_portrait === 'boolean') return item.is_portrait;
    if (item.aspect_ratio && item.aspect_ratio < 1) return true;
    if (item.orientation === 'portrait') return true;
    if (item.width && item.height && item.height > item.width) return true;
    return false;
  };

  const filteredVideos = videos.filter((video) =>
    video?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const renderSermon = ({ item }) => {
    if (!item) return null;
    const isPortrait = isPortraitVideo(item);

    return (
      <Pressable 
        style={({ focused }) => [
          styles.videoItem,
          focused && styles.focusedVideoItem
        ]}
        onPress={() => router.push({
          pathname: '../video-detail',
          params: { 
            title: item.title || '', 
            video_file: getVideoSource(item),
            description: item.description || '', 
            thumbnail: item.thumbnail || '',
            date: item.created_at || '',
            is_portrait: isPortrait ? 'true' : 'false'
          }
        })}
      >
        <View style={[
          styles.thumbnailWrapper, 
          isPortrait ? styles.portraitWrapper : styles.landscapeWrapper
        ]}>
          <CachedImage uri={item.thumbnail} style={styles.thumbnail} type="video" />

          {isPortrait && (
            <View style={styles.shortsBadge}>
              <Icon name="logo-tiktok" size={12} color="white" style={{ marginRight: 4 }} />
              <ThemedText style={styles.shortsBadgeText}>Shorts</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.titleText} numberOfLines={2}>{item.title}</ThemedText>
          <ThemedText style={styles.dateText}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.root}>
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <View style={styles.headerTop}>
            <ThemedText style={[styles.headerTitle, { color: textColor }]}>Videos</ThemedText>
            <CornerDropdown />
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: searchBg, borderColor: dynamicBorder }]}>
            <Icon name="search" size={20} color="gold" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search videos..."
              placeholderTextColor={isDark ? "#888" : "#666"}
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
          key={NUM_COLUMNS} // Forces re-render when changing column orientation
          numColumns={NUM_COLUMNS}
          data={filteredVideos}
          keyExtractor={(item, index) => 
            item && item.id != null ? String(item.id) : String(index)
          }
          renderItem={renderSermon}
          contentContainerStyle={styles.listPadding}
          columnWrapperStyle={IS_LARGE_SCREEN ? styles.columnWrapper : null}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { 
    paddingHorizontal: PADDING_HORIZONTAL, 
    paddingTop: Platform.OS === 'ios' ? 50 : ((StatusBar.currentHeight || 0) + 20), 
    paddingBottom: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
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
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listPadding: { 
    paddingHorizontal: PADDING_HORIZONTAL, 
    paddingTop: 10,
    paddingBottom: 50 
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 20,
  },

  videoItem: {
    marginBottom: 25,
    flex: IS_LARGE_SCREEN ? 1 / 3 : 1,
    borderRadius: 12,
    padding: 4,
  },
  focusedVideoItem: {
    borderColor: 'gold',
    borderWidth: 2,
    borderRadius: 14,
    transform: [{ scale: 1.03 }],
  },

  thumbnailWrapper: { 
    width: '100%', 
    backgroundColor: '#1E1E1E', 
    borderRadius: 12, 
    overflow: 'hidden',
    position: 'relative',
  },
  landscapeWrapper: { 
    aspectRatio: 16 / 9,
  },
  portraitWrapper: { 
    aspectRatio: IS_LARGE_SCREEN ? 16 / 9 : 9 / 16, 
    maxHeight: IS_LARGE_SCREEN ? 300 : 520,
  },

  thumbnail: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },

  shortsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shortsBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },

  infoContainer: { 
    paddingTop: 10,
    paddingHorizontal: 2 
  },
  titleText: { 
    fontSize: 16, 
    fontWeight: '800', 
    marginBottom: 4 
  },
  dateText: { 
    fontSize: 13, 
    opacity: 0.5, 
    fontWeight: '600' 
  }
});