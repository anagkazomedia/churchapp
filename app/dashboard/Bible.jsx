import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, ScrollView, Keyboard 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { account, databases, DATABASE_ID, COLLECTION_ID } from '../../lib/appwrite'; 
import bibleData from '../../assets/kjv.json';
import ThemedView from '../../components/ThemedView'; 
import ThemedText from '../../components/ThemedText';

// Improvement: Move static data outside component to prevent re-calculation on every render
const ALL_BOOKS = [...new Set(bibleData.verses.map(v => v.book_name))];

export default function BibleApp() {
  const router = useRouter();
  const flatListRef = useRef(null);
  
  const [book, setBook] = useState('Genesis');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // New: For performance
  const [currentUser, setCurrentUser] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // --- IMPROVEMENT: DEBOUNCE LOGIC ---
  // This prevents the app from laggy typing by waiting 300ms before filtering 31k verses
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await account.get();
        setCurrentUser(user);
      } catch (e) { setCurrentUser(null); }
    };
    checkUser();
  }, []);

  // --- FIXED & IMPROVED SEARCH/VIEW LOGIC ---
  const versesToDisplay = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    // FIXED: Now shows ALL chapters of the book when not searching
    if (!query) {
      return bibleData.verses.filter(v => v.book_name === book);
    }

    const refRegex = /^(.+)\s(\d+):(\d+)$/i;
    const match = query.match(refRegex);

    if (match) {
      const [_, b, c, v] = match;
      return bibleData.verses.filter(item => 
        item.book_name.toLowerCase() === b.toLowerCase() &&
        item.chapter === parseInt(c) &&
        item.verse === parseInt(v)
      );
    } 

    const bookChapterRegex = /^(.+)\s(\d+)$/i;
    const bcMatch = query.match(bookChapterRegex);
    if (bcMatch) {
        const [_, b, c] = bcMatch;
        return bibleData.verses.filter(item => 
            item.book_name.toLowerCase() === b.toLowerCase() &&
            item.chapter === parseInt(c)
        );
    }

    return bibleData.verses.filter(v => 
      v.text.toLowerCase().includes(query) || 
      v.book_name.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [book, debouncedSearch]); // Removed 'chapter' dependency

  const selectBook = (selectedBook) => {
    setBook(selectedBook);
    setSearchQuery(''); 
    setDebouncedSearch('');
    // Scroll to top when changing books
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const saveToFavorites = async (verseObj) => {
    if (!currentUser) {
      Alert.alert("Login Required", "Log in to save favorites.");
      return;
    }
    // MISTAKE FIX: Use a consistent unique ID string
    const verseId = `${verseObj.book_name}-${verseObj.chapter}-${verseObj.verse}`;
    setSavingId(verseId);
    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
        scripture: `${verseObj.book_name} ${verseObj.chapter}:${verseObj.verse}: ${verseObj.text}`,
        userid: currentUser.$id 
      });
      Alert.alert("Success", "Added to Favorites!");
    } catch (error) {
      Alert.alert("Error", "Check Appwrite permissions.");
    } finally { setSavingId(null); }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        
        <View style={styles.topNavigation}>
            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={18} color="#777" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search (e.g. John 3:16)"
                  placeholderTextColor="#777"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
            </View>
            <TouchableOpacity onPress={() => router.push('../favourites')} style={styles.navFavBtn}>
                <Icon name="heart" size={24} color="#ffd700" />
            </TouchableOpacity>
        </View>

        <View style={styles.bookSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookScroll}>
            {ALL_BOOKS.map((bName) => (
              <TouchableOpacity 
                key={bName} 
                style={[styles.bookChip, book === bName && styles.activeBookChip]}
                onPress={() => selectBook(bName)}
              >
                <ThemedText style={[styles.bookChipText, book === bName && styles.activeBookChipText]}>
                  {bName}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          ref={flatListRef}
          data={versesToDisplay}
          showsVerticalScrollIndicator={false}
          // IMPROVEMENT: More robust key
          keyExtractor={(item) => `${item.book_name}-${item.chapter}-${item.verse}`}
          ListHeaderComponent={
            <View style={styles.header}>
               <ThemedText style={styles.bibleHeading}>
                 {debouncedSearch ? "Search Results" : book}
               </ThemedText>
               <View style={styles.goldUnderline} />
            </View>
          }
          contentContainerStyle={styles.readerContainer}
          renderItem={({ item, index }) => {
            // IMPROVEMENT: Show Chapter Heading when a new chapter starts
            const isNewChapter = !debouncedSearch && (index === 0 || versesToDisplay[index - 1].chapter !== item.chapter);
            const currentId = `${item.book_name}-${item.chapter}-${item.verse}`;

            return (
              <View>
                {isNewChapter && (
                  <ThemedText style={styles.chapterHeader}>Chapter {item.chapter}</ThemedText>
                )}
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => Keyboard.dismiss()} 
                    style={styles.verseWrapper}
                >
                  <ThemedText style={styles.verseNumber}>{item.verse}</ThemedText>
                  <View style={{ flex: 1 }}>
                    {debouncedSearch !== '' && (
                        <ThemedText style={styles.resultRef}>{item.book_name} {item.chapter}:{item.verse}</ThemedText>
                    )}
                    <ThemedText style={styles.verseContent}>{item.text}</ThemedText>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => saveToFavorites(item)} 
                    style={styles.favBtn}
                    disabled={savingId === currentId}
                  >
                    {savingId === currentId ? (
                      <ActivityIndicator size="small" color="#ffd700" />
                    ) : (
                      <Icon name="heart-outline" size={22} color="#888" />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  topNavigation: { flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', gap: 15, marginTop: 10 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.07)', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, marginLeft: 8 },
  navFavBtn: { padding: 5 },
  bookSelectorContainer: { marginTop: 15, marginBottom: 5 },
  bookScroll: { paddingHorizontal: 20, gap: 10 },
  bookChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  activeBookChip: { backgroundColor: 'rgba(255, 215, 0, 0.2)', borderColor: '#ffd700' },
  bookChipText: { fontSize: 13, opacity: 0.7 },
  activeBookChipText: { color: '#ffd700', fontWeight: 'bold', opacity: 1 },
  header: { paddingHorizontal: 25, marginBottom: 10, marginTop: 20 },
  bibleHeading: { fontSize: 34, fontWeight: '900' },
  chapterHeader: { fontSize: 22, fontWeight: 'bold', color: '#ffd700', marginLeft: 25, marginTop: 30, marginBottom: 15 },
  goldUnderline: { height: 4, width: 40, backgroundColor: '#ffd700', marginTop: 5, borderRadius: 2 },
  readerContainer: { paddingBottom: 100 },
  verseWrapper: { flexDirection: 'row', paddingHorizontal: 25, marginBottom: 24, alignItems: 'flex-start' },
  verseNumber: { width: 35, fontSize: 14, fontWeight: 'bold', color: '#ffd700', marginTop: 5 },
  resultRef: { color: '#ffd700', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  verseContent: { fontSize: 18, lineHeight: 28, opacity: 0.9 },
  favBtn: { marginLeft: 15, paddingTop: 4, width: 30, alignItems: 'center' }
});