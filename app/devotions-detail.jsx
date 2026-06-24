import React, { useContext } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { ThemeContext } from '../components/ThemedContext';
import CachedImage from '../components/CachedImage';

export default function DevotionDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useContext(ThemeContext);

  const saveOffline = async () => {
    try {
      const saved = await AsyncStorage.getItem('offline_devotions');
      const list = saved ? JSON.parse(saved) : [];
      
      if (list.find(d => d.title === params.title)) {
        Alert.alert("Already Saved", "This devotion is already in your offline library.");
        return;
      }
      
      list.push(params);
      await AsyncStorage.setItem('offline_devotions', JSON.stringify(list));
      Alert.alert("Success", "Devotion saved for offline reading!");
    } catch (e) {
      Alert.alert("Error", "Could not save devotion.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon name="arrow-back" size={28} color="gold" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <CachedImage 
          uri={params.thumbnail} 
          style={styles.banner} 
          type="devotion" 
        />
        
        <View style={styles.content}>
          {/* Title and Download Button Row */}
          <View style={styles.titleRow}>
            <ThemedText style={[styles.title, { flex: 1 }]}>{params.title}</ThemedText>
            <TouchableOpacity style={styles.downloadButton} onPress={saveOffline}>
              <ThemedText style={styles.downloadText}>DOWNLOAD</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.author}>By {params.author}</ThemedText>
          
          <ThemedText style={styles.scriptureRef}>{params.scripture}</ThemedText>
          <View style={styles.goldDivider} />
          
          <ThemedText style={styles.body}>{params.body}</ThemedText>
          
          <View style={styles.section}>
            <ThemedText style={styles.subHeading}>Further Study</ThemedText>
            <ThemedText style={styles.studyText}>{params.moreScriptures}</ThemedText>
          </View>

          <View style={[styles.prayerBox, { backgroundColor: isDark ? '#1C1C1C' : '#F9F9F9' }]}>
            <ThemedText style={styles.prayerTitle}>Prayer</ThemedText>
            <ThemedText style={styles.prayerBody}>{params.prayer}</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10, 
    left: 20, 
    zIndex: 10, 
    padding: 5 
  },
  banner: { width: '100%', height: 250 },
  scroll: { paddingBottom: 50 },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '900' },
  downloadButton: { 
    backgroundColor: 'gold', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6,
    marginLeft: 10 
  },
  downloadText: { color: 'black', fontWeight: '900', fontSize: 12 },
  author: { fontSize: 14, opacity: 0.6, marginBottom: 15, fontStyle: 'italic' },
  scriptureRef: { fontSize: 16, fontWeight: '700', color: 'gold', marginBottom: 10 },
  goldDivider: { height: 4, width: 40, backgroundColor: 'gold', marginBottom: 20, borderRadius: 2 },
  body: { fontSize: 17, lineHeight: 28, marginBottom: 25 },
  section: { marginBottom: 25 },
  subHeading: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  studyText: { fontSize: 16, color: 'gold' },
  prayerBox: { padding: 20, borderRadius: 12, borderLeftWidth: 5, borderLeftColor: 'gold' },
  prayerTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  prayerBody: { fontSize: 16, fontStyle: 'italic', opacity: 0.8 }
});