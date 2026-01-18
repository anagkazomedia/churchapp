import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Import this
import ThemedView from '../components/ThemedView';

export default function CommunityPage() {
  const insets = useSafeAreaInsets(); // 2. Get the screen "safe" gaps

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* 3. Apply the insets as padding to this wrapper View */}
      <View style={{ 
        flex: 1, 
        paddingTop: insets.top, 
        paddingBottom: insets.bottom 
      }}>
        <WebView 
          source={{ uri: 'https://www.talkjesus.com/' }} 
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#ffd700" />
            </View>
          )}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});