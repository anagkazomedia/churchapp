import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, ScrollView, 
  Text, Keyboard // Ensure 'Text' is imported here
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";

import { account, databases, DATABASE_ID, COLLECTION_ID } from '../../lib/appwrite'; 
import bibleData from '../../assets/kjv.json';
import CornerDropdown from '../../components/CornerDropdown'; 
import { ThemeContext } from '../../components/ThemedContext';
import { Colors } from '../../constants/Colors';

// Safe check for bible data
const ALL_BOOKS = bibleData?.verses ? [...new Set(bibleData.verses.map(v => v.book_name))] : [];

export default function BibleApp() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const { isDark } = useContext(ThemeContext);
  
  // Dynamic UI values
  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  const [book, setBook] = useState('Genesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); 
  const [currentUser, setCurrentUser] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 350);
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

  const chapterList = useMemo(() => {
    const bookVerses = bibleData.verses.filter(v => v.book_name === book);
    const maxChapter = Math.max(...bookVerses.map(v => v.chapter));
    return Array.from({ length: maxChapter }, (_, i) => i + 1);
  }, [book]);

  const versesToDisplay = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (query) {
      return bibleData.verses.filter(v => 
        v.text.toLowerCase().includes(query) || 
        v.book_name.toLowerCase().includes(query)
      ).slice(0, 50);
    }
    return bibleData.verses.filter(v => v.book_name === book && v.chapter === currentChapter);
  }, [book, currentChapter, debouncedSearch]);

  const selectBook = (selectedBook) => {
    setBook(selectedBook);
    setCurrentChapter(1);
    setSearchQuery('');
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const selectChapter = (chap) => {
    setCurrentChapter(chap);
    setSearchQuery('');
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const saveToFavorites = async (verseObj) => {
    if (!currentUser) {
      Alert.alert("Login Required", "Log in to save favorites.");
      return;
    }
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert("Offline", "Connection required to save favorites.");
      return;
    }
    const verseId = `${verseObj.book_name}-${verseObj.chapter}-${verseObj.verse}`;
    setSavingId(verseId);
    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, 'unique()', {
        scripture: `${verseObj.book_name} ${verseObj.chapter}:${verseObj.verse}: ${verseObj.text}`,
        userid: currentUser.$id 
      });
      Alert.alert("Success", "Saved to favorites!");
    } catch (error) {
      Alert.alert("Error", "Save failed.");
    } finally { setSavingId(null); }
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#000' : '#FFF' }]}>
      {/* PHANEROO HEADER SURFACE */}
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topNavigation}>
              <View style={[styles.searchContainer, { backgroundColor: inputBg }]}>
                  <Icon name="search-outline" size={18} color={isDark ? "#888" : "#666"} />
                  <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Search Bible..."
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
              </View>
              <View style={styles.headerActions}>
                  <TouchableOpacity onPress={() => router.push('../favourites')} style={styles.navFavBtn}>
                      <Icon name="heart-outline" size={24} color="gold" />
                  </TouchableOpacity>
                  <CornerDropdown />
              </View>
          </View>

          <View style={styles.persistentSelectors}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              {ALL_BOOKS.map((bName) => (
                <TouchableOpacity 
                  key={bName} 
                  style={[
                      styles.bookChip, 
                      { backgroundColor: inputBg, borderColor: dynamicBorder },
                      book === bName && styles.activeBookChip
                  ]}
                  onPress={() => selectBook(bName)}
                >
                  <Text style={[styles.bookChipText, { color: textColor }, book === bName && styles.activeBookChipText]}>{bName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ height: 10 }} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              {chapterList.map((chap) => (
                <TouchableOpacity 
                  key={chap} 
                  style={[
                      styles.chapterBtn, 
                      { backgroundColor: inputBg, borderColor: dynamicBorder },
                      currentChapter === chap && styles.activeChapterBtn
                  ]}
                  onPress={() => selectChapter(chap)}
                >
                  <Text style={[styles.chapterBtnText, { color: textColor }, currentChapter === chap && styles.activeChapterBtnText]}>
                    {chap}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        ref={flatListRef}
        data={versesToDisplay}
        keyExtractor={(item) => `${item.book_name}-${item.chapter}-${item.verse}`}
        ListHeaderComponent={
          <View style={styles.header}>
             <Text style={[styles.bibleHeading, { color: textColor }]}>
               {debouncedSearch ? "SEARCH RESULTS" : `${book.toUpperCase()} ${currentChapter}`}
             </Text>
             <View style={styles.goldUnderline} />
          </View>
        }
        contentContainerStyle={styles.readerContainer}
        renderItem={({ item }) => (
          <View style={styles.verseWrapper}>
            <Text style={styles.verseNumber}>{item.verse}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.verseContent, { color: isDark ? '#CCC' : '#333' }]}>{item.text}</Text>
            </View>
            <TouchableOpacity onPress={() => saveToFavorites(item)} style={styles.favBtn}>
              {savingId === `${item.book_name}-${item.chapter}-${item.verse}` ? (
                <ActivityIndicator size="small" color="gold" />
              ) : (
                <Icon name="bookmark-outline" size={20} color={isDark ? "#888" : "#999"} />
              )}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// --- CRITICAL: THE STYLES OBJECT ---
const styles = StyleSheet.create({
  root: { flex: 1 },
  headerSurface: {
    borderBottomWidth: 1,
    elevation: 4,
    paddingBottom: 15,
  },
  topNavigation: { flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center', marginTop: 10, gap: 10 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  navFavBtn: { padding: 8 },
  persistentSelectors: { marginTop: 15 },
  scrollPadding: { paddingHorizontal: 20, gap: 8 },
  bookChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  activeBookChip: { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: 'gold' },
  bookChipText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  activeBookChipText: { color: 'gold' },
  chapterBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  activeChapterBtn: { backgroundColor: 'gold', borderColor: 'gold' },
  chapterBtnText: { fontSize: 13, fontWeight: '800' },
  activeChapterBtnText: { color: '#000' },
  header: { paddingHorizontal: 25, marginBottom: 20, marginTop: 25 },
  bibleHeading: { fontSize: 24, fontWeight: '900' },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 5, borderRadius: 2 },
  readerContainer: { paddingBottom: 60 },
  verseWrapper: { flexDirection: 'row', paddingHorizontal: 25, marginBottom: 25 },
  verseNumber: { width: 35, fontSize: 14, fontWeight: '900', color: 'gold', marginTop: 4 },
  verseContent: { fontSize: 18, lineHeight: 30 },
  favBtn: { marginLeft: 10, paddingTop: 4, width: 30, alignItems: 'center' },
});