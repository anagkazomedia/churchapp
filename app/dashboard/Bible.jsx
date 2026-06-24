import React, { useState, useMemo, useRef, useContext } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, 
  FlatList, ScrollView, Text, Modal 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import bibleData from '../../assets/kjv.json';
import CornerDropdown from '../../components/CornerDropdown'; 
import { ThemeContext } from '../../components/ThemedContext';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';

const ALL_BOOKS = bibleData?.verses ? [...new Set(bibleData.verses.map(v => v.book_name))] : [];

export default function BibleApp() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const { isDark } = useContext(ThemeContext);
  
  const [book, setBook] = useState('Genesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const headerBg = isDark ? '#121212' : '#F0F0F3'; 
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  const chapterList = useMemo(() => {
    const bookVerses = bibleData.verses.filter(v => v.book_name === book);
    const maxChapter = Math.max(...bookVerses.map(v => v.chapter));
    return Array.from({ length: maxChapter }, (_, i) => i + 1);
  }, [book]);

  const versesToDisplay = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return bibleData.verses.filter(v => 
        v.text.toLowerCase().includes(query) || 
        v.book_name.toLowerCase().includes(query)
      ).slice(0, 50);
    }
    return bibleData.verses.filter(v => v.book_name === book && v.chapter === currentChapter);
  }, [book, currentChapter, searchQuery]);

  return (
    <ThemedView style={styles.root}>
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topNavigation}>
              <View style={[styles.searchContainer, { backgroundColor: inputBg }]}>
                  <Icon name="search-outline" size={18} color={isDark ? "#888" : "#666"} />
                  <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Search e.g John 3:16"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
              </View>
              <CornerDropdown />
          </View>

          <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowPicker(true)}>
            <Text style={[styles.pickerText, { color: textColor }]}>{book} {currentChapter}</Text>
            <Icon name="chevron-down" size={16} color="gold" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <FlatList
        ref={flatListRef}
        data={versesToDisplay}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.header}>
             <Text style={[styles.bibleHeading, { color: textColor }]}>
               {searchQuery ? "SEARCH RESULTS" : `${book.toUpperCase()} ${currentChapter}`}
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
          </View>
        )}
      />

      {/* Selector Modal */}
      <Modal visible={showPicker} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: headerBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Scripture</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Icon name="close-circle" size={28} color="gold" />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerColumns}>
              <ScrollView style={styles.column}>
                {ALL_BOOKS.map((bName) => (
                  <TouchableOpacity key={bName} onPress={() => { setBook(bName); setCurrentChapter(1); }} style={styles.pickerItem}>
                    <Text style={[styles.pickerItemText, { color: textColor }]}>{bName}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={styles.column}>
                {chapterList.map((chap) => (
                  <TouchableOpacity key={chap} onPress={() => { setCurrentChapter(chap); setShowPicker(false); }} style={styles.pickerItem}>
                    <Text style={[styles.pickerItemText, { color: textColor }]}>Chapter {chap}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
// ... keep your styles object from the previous file

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerSurface: { borderBottomWidth: 1, elevation: 4, paddingBottom: 10 },
  topNavigation: { flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center', marginTop: 10, gap: 10 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  navFavBtn: { padding: 8 },
  
  // New Styles for Picker
  pickerTrigger: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 15, 
    gap: 5,
    paddingVertical: 5
  },
  pickerText: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { height: '70%', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  pickerColumns: { flex: 1, flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
  pickerItem: { paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, marginBottom: 5 },
  activeItem: { backgroundColor: 'rgba(255, 215, 0, 0.1)' },
  pickerItemText: { fontSize: 16, fontWeight: '600' },

  header: { paddingHorizontal: 25, marginBottom: 20, marginTop: 25 },
  bibleHeading: { fontSize: 24, fontWeight: '900' },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 5, borderRadius: 2 },
  readerContainer: { paddingBottom: 60 },
  verseWrapper: { flexDirection: 'row', paddingHorizontal: 25, marginBottom: 25 },
  verseNumber: { width: 35, fontSize: 14, fontWeight: '900', color: 'gold', marginTop: 4 },
  verseContent: { fontSize: 18, lineHeight: 30 },
  favBtn: { marginLeft: 10, paddingTop: 4, width: 30, alignItems: 'center' },
});