import React, { useState, useEffect } from 'react';
import { Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import NetInfo from "@react-native-community/netinfo";

const FALLBACKS = {
  video: require('../assets/offline-images/video-default.png'),
  book: require('../assets/offline-images/book-default.png'),
  event: require('../assets/offline-images/event-default.png'),
  devotion: require('../assets/offline-images/devotion-default.png'),
  paper: require('../assets/offline-images/paper-default.png'),
  default: require('../assets/offline-images/devotion-default.png'),
};

export default function CachedImage({ uri, style, type = 'default' }) {
  const [loadError, setLoadError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const fallbackSource = RNImage.resolveAssetSource(FALLBACKS[type]);

  // Check network status to handle offline display behavior
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Use the fallback if offline, if no URI is provided, or if a load error occurred
  const shouldShowFallback = !uri || loadError || (isOffline && !uri);

  if (shouldShowFallback) {
    return (
      <Image 
        style={style} 
        source={fallbackSource} 
        contentFit="cover" 
        transition={200}
      />
    );
  }

  return (
    <Image
      style={style}
      source={{ uri }}
      placeholder={fallbackSource}
      contentFit="cover"
      transition={200}
      // 'disk' policy ensures that once loaded, it stays on the device
      cachePolicy="disk"
      onLoadError={() => setLoadError(true)}
    />
  );
}