import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Dimensions, 
  Pressable, Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import Icon from 'react-native-vector-icons/Ionicons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_LARGE_SCREEN = SCREEN_WIDTH > 768 || Platform.OS === 'web';

export default function VideoDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const videoViewRef = useRef(null);

  const rawSource = params?.video_file || params?.video_url || '';
  const videoSource = rawSource ? encodeURI(decodeURI(rawSource.trim())) : '';

  const isPortraitParam = params?.is_portrait === 'true';
  const [isPortrait, setIsPortrait] = useState(isPortraitParam);
  const [playerError, setPlayerError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = false;
    if (videoSource) {
      playerInstance.play();
    }
  });

  useEffect(() => {
    if (!player) return;

    setPlayerError(null);

    const statusSubscription = player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay') {
        const width = player.videoSize?.width;
        const height = player.videoSize?.height;

        if (width && height) {
          setIsPortrait(IS_LARGE_SCREEN ? false : height > width);
        }
      } else if (status.status === 'error') {
        setPlayerError(status.error?.message || 'Failed to load video stream.');
      }
    });

    return () => {
      statusSubscription.remove();
    };
  }, [player, videoSource]);

  const handleFullscreen = () => {
    if (Platform.OS === 'web') {
      // Browser execution
      const videoElement = document.querySelector('video');
      if (videoElement) {
        if (videoElement.requestFullscreen) {
          videoElement.requestFullscreen();
        } else if (videoElement.webkitRequestFullscreen) {
          videoElement.webkitRequestFullscreen();
        } else if (videoElement.msRequestFullscreen) {
          videoElement.msRequestFullscreen();
        }
      }
    } else {
      // Native Android / iOS / TV execution
      if (videoViewRef.current) {
        videoViewRef.current.enterFullscreen();
      }
    }
  };

  const descriptionText = params?.description || 'No description provided for this video.';
  const isLongDescription = descriptionText.length > 180;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.headerBar}>
        <Pressable
          style={({ focused }) => [
            styles.backButton,
            focused && styles.focusedButton
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
          {IS_LARGE_SCREEN && <Text style={styles.backButtonText}>Back</Text>}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={IS_LARGE_SCREEN ? styles.tvLayoutContainer : styles.mobileLayoutContainer}>
          
          {/* Video Player Section */}
          <View style={[
            IS_LARGE_SCREEN ? styles.tvPlayerWrapper : (isPortrait ? styles.shortsWrapper : styles.standardWrapper)
          ]}>
            <View style={isPortrait && !IS_LARGE_SCREEN ? styles.shortsContainer : styles.standardContainer}>
              {videoSource && !playerError ? (
                <VideoView
                  ref={videoViewRef}
                  player={player}
                  style={styles.video}
                  nativeControls={true}
                  contentFit={isPortrait && !IS_LARGE_SCREEN ? 'cover' : 'contain'}
                  fullscreenOptions={{
                    enable: true,
                  }}
                />
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {playerError || 'No video file found.'}
                  </Text>
                  {rawSource ? (
                    <Text style={styles.debugText} numberOfLines={2}>
                      URL: {rawSource}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          </View>

          {/* Details & Actions Section */}
          <View style={[styles.detailsContainer, IS_LARGE_SCREEN && styles.tvDetailsContainer]}>
            <Text style={styles.title}>
              {params?.title || 'Untitled Video'}
            </Text>

            {params?.date && (
              <Text style={styles.metaText}>
                {new Date(params.date).toLocaleDateString()}
              </Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.descriptionHeader}>Description</Text>
            
            {/* Truncated Description Text */}
            <Text 
              style={styles.description} 
              numberOfLines={isExpanded ? undefined : 3}
            >
              {descriptionText}
            </Text>

            {/* Toggle Full Description Button */}
            {isLongDescription && (
              <Pressable 
                style={({ focused }) => [
                  styles.toggleDescriptionButton,
                  focused && styles.focusedInlineButton
                ]}
                onPress={() => setIsExpanded(!isExpanded)}
              >
                <Text style={styles.toggleDescriptionText}>
                  {isExpanded ? 'Show less' : 'View full description'}
                </Text>
                <Icon 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="gold" 
                />
              </Pressable>
            )}

            {/* Fullscreen Button */}
            <Pressable
              style={({ focused }) => [
                styles.fullscreenButton,
                focused && styles.focusedFullscreenButton
              ]}
              onPress={handleFullscreen}
            >
              <Icon name="expand" size={20} color="#000000" />
              <Text style={styles.fullscreenButtonText}>Watch Fullscreen</Text>
            </Pressable>

          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focusedButton: {
    borderColor: 'gold',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    transform: [{ scale: 1.05 }],
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: 40,
  },

  mobileLayoutContainer: {
    flexDirection: 'column',
  },
  tvLayoutContainer: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    alignItems: 'flex-start',
    gap: 24,
  },
  tvPlayerWrapper: {
    flex: 2,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tvDetailsContainer: {
    flex: 1,
    padding: 0,
  },

  standardWrapper: {
    width: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
  },
  standardContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },

  shortsWrapper: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  shortsContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },

  video: {
    width: '100%',
    height: '100%',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#ff5555',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  debugText: {
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
  },

  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: IS_LARGE_SCREEN ? 24 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 12,
  },
  descriptionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#b0b0b0',
    lineHeight: 22,
  },

  toggleDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  toggleDescriptionText: {
    color: 'gold',
    fontSize: 13,
    fontWeight: '700',
  },
  focusedInlineButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
  },

  fullscreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
    alignSelf: IS_LARGE_SCREEN ? 'flex-start' : 'stretch',
  },
  focusedFullscreenButton: {
    backgroundColor: '#FFE55C',
    transform: [{ scale: 1.04 }],
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fullscreenButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
});