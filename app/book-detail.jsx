import React from 'react';
import { StyleSheet, View, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import Icon from 'react-native-vector-icons/Ionicons';
import CachedImage from '../components/CachedImage'; // 1. Import CachedImage

export default function BookDetail() {
  const book = useLocalSearchParams();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Icon name="arrow-back" size={24} color="gold" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 2. Swapped Image for CachedImage with 'book' type */}
        <CachedImage 
          uri={book.thumbnail} 
          style={styles.thumbnail} 
          type="book" 
        />
        
        <ThemedText style={styles.title}>{book.title}</ThemedText>
        <ThemedText style={styles.author}>by {book.author}</ThemedText>
        <View style={styles.tag}><ThemedText>{book.category}</ThemedText></View>
        
        <ThemedText style={styles.descTitle}>Description</ThemedText>
        <ThemedText style={styles.desc}>{book.description}</ThemedText>

        <TouchableOpacity style={styles.readBtn} onPress={() => Linking.openURL(book.pdf)}>
            <ThemedText style={styles.readBtnText}>READ BOOK</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  thumbnail: { width: '100%', height: 300, borderRadius: 12, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900' },
  author: { fontSize: 18, opacity: 0.7, marginBottom: 10 },
  tag: { backgroundColor: 'gold', alignSelf: 'flex-start', padding: 5, borderRadius: 5, marginBottom: 20 },
  descTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  desc: { fontSize: 16, lineHeight: 24, opacity: 0.8, marginBottom: 30 },
  readBtn: { backgroundColor: 'gold', padding: 15, borderRadius: 12, alignItems: 'center' },
  readBtnText: { color: 'black', fontWeight: 'bold' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 }
});