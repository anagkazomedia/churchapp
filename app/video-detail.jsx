import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av'; // <--- Using expo-av instead
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import ThemedText from '../components/ThemedText';
import ThemedView from '../components/ThemedView';

export default function VideoDetail() {
  const params = useLocalSearchParams();
  const { title, description, date } = params;
  const activeVideoUrl = params.video_url || params.get_video_url || params.video_file || params.video_file_key || "";
  const encodedVideoUrl = activeVideoUrl ? encodeURI(activeVideoUrl.trim()) : "";
  useEffect(() => {
    console.log('VideoDetail params:', params);
  }, [params]);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [isBuffering, setIsBuffering] = useState(true);
  const [playbackError, setPlaybackError] = useState(false);
  useEffect(() => {
    // This will print the exact URL the app is trying to load
    console.log("DEBUG: Attempting to play URL:", activeVideoUrl, "encoded:", encodedVideoUrl);
  }, [activeVideoUrl, encodedVideoUrl]);
  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="gold" />
        </TouchableOpacity>
      </View>

      <View style={styles.videoWrapper}>
        {playbackError ? (
          <View style={styles.errorOverlay}>
            <ThemedText>Playback Error</ThemedText>
          </View>
        ) : (
          <Video
            source={{ uri: encodedVideoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            useNativeControls
            onLoad={() => setIsBuffering(false)}
            onError={(e) => {
              console.error("AV Player Error:", e);
              setPlaybackError(true);
            }}
          />
        )}
        {isBuffering && !playbackError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="gold" />
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.desc}>{description}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 15 },
  videoWrapper: { width: '100%', height: 250, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  desc: { fontSize: 15, opacity: 0.7 }
});