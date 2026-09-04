import React, { useState, useMemo, useRef, useContext, useCallback } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, 
  FlatList, SectionList, Text, Modal 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import kjvData from '../../assets/kjv.json';
import asvData from '../../assets/ASV.json';
import bsbData from '../../assets/BSB.json';

import CornerDropdown from '../../components/CornerDropdown'; 
import { ThemeContext } from '../../components/ThemedContext';
import ThemedText from '../../components/ThemedText';
import ThemedView from '../../components/ThemedView';

const BIBLE_VERSIONS = {
  KJV: kjvData,
  ASV: asvData,
  BSB: bsbData,
};

const OLD_TESTAMENT_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"
];

const NEW_TESTAMENT_BOOKS = [
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

// Helper function to normalize book names for cross-version compatibility
const normalizeBookName = (str) => {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};

export default function BibleApp() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { isDark } = useContext(ThemeContext);

  const [book, setBook] = useState('Genesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState('KJV');
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Unified Dataset Extraction & Normalization Layer
  const currentNormalizedVerses = useMemo(() => {
    const data = BIBLE_VERSIONS[selectedVersion] || kjvData;

    // Structure 1: KJV / Flat Array Structure ({ verses: [{ book_name, chapter, verse, text }] })
    if (data?.verses && Array.isArray(data.verses)) {
      return data.verses.map((v) => ({
        book_name: v.book_name || v.book || '',
        chapter: Number(v.chapter),
        verse: Number(v.verse),
        text: v.text || '',
      }));
    }

    // Structure 2: ASV / Nested Structure ({ books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] })
    if (data?.books && Array.isArray(data.books)) {
      const flattened = [];
      for (const bookObj of data.books) {
        const bName = bookObj.name || bookObj.book_name || '';
        if (!bookObj.chapters || !Array.isArray(bookObj.chapters)) continue;

        for (const chapObj of bookObj.chapters) {
          const cNum = Number(chapObj.chapter);
          if (!chapObj.verses || !Array.isArray(chapObj.verses)) continue;

          for (const verseObj of chapObj.verses) {
            flattened.push({
              book_name: bName,
              chapter: cNum,
              verse: Number(verseObj.verse),
              text: verseObj.text || '',
            });
          }
        }
      }
      return flattened;
    }

    return [];
  }, [selectedVersion]);

  // Outside Search Query (Searches Verse Content)
  const [contentSearchQuery, setContentSearchQuery] = useState('');

  // Modal Navigation & Filter States
  const [showScriptureModal, setShowScriptureModal] = useState(false);
  const [step, setStep] = useState('book');
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [scriptureSearchQuery, setScriptureSearchQuery] = useState('');

  // Segmented Control State: 'all' | 'ot' | 'nt'
  const [testamentFilter, setTestamentFilter] = useState('all');

  // Dynamic Theme Colors
  const headerBg = isDark ? '#000000' : '#FFFFFF'; 
  const inputBg = isDark ? '#1E1E1E' : '#F1F3F5';
  const dynamicBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const cardBg = isDark ? '#2A2A2A' : '#F8F9FA';
  const tabBg = isDark ? '#181818' : '#E9ECEF';

  // Handle Bible Version Change Safely
  const handleVersionChange = (versionKey) => {
    setSelectedVersion(versionKey);
    setShowVersionModal(false);
    
    // Scroll to top when changing versions
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  };

  const testamentSections = useMemo(() => {
    const q = scriptureSearchQuery.trim().toLowerCase();

    const ot = OLD_TESTAMENT_BOOKS.filter(b => b.toLowerCase().includes(q));
    const nt = NEW_TESTAMENT_BOOKS.filter(b => b.toLowerCase().includes(q));

    const sections = [];

    if ((testamentFilter === 'all' || testamentFilter === 'ot') && ot.length > 0) {
      sections.push({ title: 'OLD TESTAMENT', data: chunkArray(ot, 3) });
    }

    if ((testamentFilter === 'all' || testamentFilter === 'nt') && nt.length > 0) {
      sections.push({ title: 'NEW TESTAMENT', data: chunkArray(nt, 3) });
    }

    return sections;
  }, [scriptureSearchQuery, testamentFilter]);

  // Normalized Chapter Lookup
  const chaptersForSelectedBook = useMemo(() => {
    let maxChapter = 1;
    const targetBookNorm = normalizeBookName(selectedBook);

    for (let i = 0; i < currentNormalizedVerses.length; i++) {
      if (normalizeBookName(currentNormalizedVerses[i].book_name) === targetBookNorm) {
        const chapNum = currentNormalizedVerses[i].chapter;
        if (chapNum > maxChapter) maxChapter = chapNum;
      }
    }
    return Array.from({ length: maxChapter }, (_, i) => i + 1);
  }, [selectedBook, currentNormalizedVerses]);

  // Normalized Main Display Filtering
  const versesToDisplay = useMemo(() => {
    const q = contentSearchQuery.trim().toLowerCase();

    if (q) {
      return currentNormalizedVerses.filter(v => v.text && v.text.toLowerCase().includes(q));
    }

    const currentBookNorm = normalizeBookName(book);
    return currentNormalizedVerses.filter(
      v => normalizeBookName(v.book_name) === currentBookNorm && v.chapter === Number(currentChapter)
    );
  }, [book, currentChapter, contentSearchQuery, currentNormalizedVerses]);

  const jumpToChapter = useCallback((targetBook, targetChapter) => {
    const chapNum = Number(targetChapter);
    setBook(targetBook);
    setCurrentChapter(chapNum);
    setContentSearchQuery(''); 
    setShowScriptureModal(false);

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, []);

  const openScriptureModal = () => {
    setSelectedBook(book);
    setStep('book');
    setScriptureSearchQuery('');
    setTestamentFilter('all');
    setShowScriptureModal(true);
  };

  const handleSelectBook = (bName) => {
    setSelectedBook(bName);
    setStep('chapter');
  };

  const handleSelectChapter = (chapNum) => {
    jumpToChapter(selectedBook, chapNum);
  };

  const handleModalBack = () => {
    if (step === 'chapter') setStep('book');
  };

  const totalChaptersInCurrentBook = useMemo(() => {
    let maxChapter = 1;
    const currentBookNorm = normalizeBookName(book);

    for (let i = 0; i < currentNormalizedVerses.length; i++) {
      if (normalizeBookName(currentNormalizedVerses[i].book_name) === currentBookNorm) {
        const chapNum = currentNormalizedVerses[i].chapter;
        if (chapNum > maxChapter) maxChapter = chapNum;
      }
    }
    return maxChapter;
  }, [book, currentNormalizedVerses]);

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      jumpToChapter(book, currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < totalChaptersInCurrentBook) {
      jumpToChapter(book, currentChapter + 1);
    }
  };

  const renderVerseItem = useCallback(({ item }) => {
    return (
      <View style={styles.verseWrapper}>
        {(Number(item.verse) === 1 || contentSearchQuery.length > 0) && (
          <View style={styles.chapterHeaderDivider}>
            <Text style={styles.chapterDividerText}>
              {book.toUpperCase()} {item.chapter}
            </Text>
          </View>
        )}
        <View style={styles.verseRow}>
          <Text style={styles.verseNumber}>{item.verse}</Text>
          <View style={styles.verseContentContainer}>
            <Text style={[styles.verseContent, { color: isDark ? '#CCC' : '#333' }]}>
              {item.text}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [isDark, contentSearchQuery, book]);

  return (
    <ThemedView style={styles.root}>
      {/* Devotions Style Header Area */}
      <View style={[styles.headerSurface, { backgroundColor: headerBg, borderBottomColor: dynamicBorder }]}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: headerBg }}>
          <View style={styles.topNavigation}>
            <View style={styles.leftNavGroup}>
              <TouchableOpacity style={styles.pickerTrigger} onPress={openScriptureModal}>
                <Text style={[styles.pickerText, { color: textColor }]}>
                  {`${book} ${currentChapter}`}
                </Text>
                <Icon name="chevron-down" size={18} color="gold" />
              </TouchableOpacity>

              {/* Bible Version Selection Dropdown Trigger */}
              <TouchableOpacity 
                style={styles.versionBadge} 
                onPress={() => setShowVersionModal(true)}
              >
                <Text style={styles.versionBadgeText}>{selectedVersion}</Text>
                <Icon name="chevron-down" size={12} color="gold" />
              </TouchableOpacity>
            </View>

            <CornerDropdown />
          </View>

          {/* Outside Search Bar: Searches Verse Content */}
          <View style={[styles.headerSearchBox, { backgroundColor: inputBg }]}>
            <Icon name="search" size={18} color={isDark ? "#888" : "#666"} />
            <TextInput
              style={[styles.headerSearchInput, { color: textColor }]}
              placeholder="Search verse content..."
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={contentSearchQuery}
              onChangeText={setContentSearchQuery}
              returnKeyType="search"
            />
            {contentSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setContentSearchQuery('')}>
                <Icon name="close-circle" size={18} color={isDark ? "#888" : "#666"} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Verses List */}
      <FlatList
        ref={flatListRef}
        data={versesToDisplay}
        keyExtractor={(item, index) => `${selectedVersion}-${item.book_name || book}-${item.chapter}-${item.verse}-${index}`}
        initialNumToRender={20}
        maxToRenderPerBatch={25}
        windowSize={5}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.bibleHeading, { color: textColor }]}>
              {contentSearchQuery 
                ? `RESULTS FOR "${contentSearchQuery.toUpperCase()}"` 
                : `${book.toUpperCase()} ${currentChapter} (${selectedVersion})`}
            </Text>
            <View style={styles.goldUnderline} />
          </View>
        }
        ListFooterComponent={
          !contentSearchQuery ? (
            <View style={styles.chapterFooterNav}>
              <TouchableOpacity 
                style={[styles.navBtn, currentChapter <= 1 && styles.navBtnDisabled]}
                onPress={handlePrevChapter}
                disabled={currentChapter <= 1}
              >
                <Icon name="arrow-back" size={16} color={currentChapter <= 1 ? '#666' : 'gold'} />
                <Text style={[styles.navBtnText, { color: currentChapter <= 1 ? '#666' : textColor }]}>
                  PREVIOUS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.navBtn, currentChapter >= totalChaptersInCurrentBook && styles.navBtnDisabled]}
                onPress={handleNextChapter}
                disabled={currentChapter >= totalChaptersInCurrentBook}
              >
                <Text style={[styles.navBtnText, { color: currentChapter >= totalChaptersInCurrentBook ? '#666' : textColor }]}>
                  NEXT
                </Text>
                <Icon name="arrow-forward" size={16} color={currentChapter >= totalChaptersInCurrentBook ? '#666' : 'gold'} />
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={[styles.readerContainer, { paddingBottom: 40 + insets.bottom }]}
        renderItem={renderVerseItem}
      />

      {/* Version Selector Modal */}
      <Modal visible={showVersionModal} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setShowVersionModal(false)}
        >
          <View style={[styles.versionDropdownCard, { backgroundColor: cardBg, borderColor: dynamicBorder }]}>
            <Text style={[styles.versionDropdownTitle, { color: textColor }]}>Select Bible Version</Text>
            {Object.keys(BIBLE_VERSIONS).map((ver) => (
              <TouchableOpacity
                key={ver}
                style={[styles.versionOption, selectedVersion === ver && styles.versionOptionActive]}
                onPress={() => handleVersionChange(ver)}
              >
                <Text style={[styles.versionOptionText, selectedVersion === ver ? styles.versionOptionTextActive : { color: textColor }]}>
                  {ver}
                </Text>
                {selectedVersion === ver && <Icon name="checkmark" size={16} color="gold" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Scripture Selection Modal */}
      <Modal visible={showScriptureModal} animationType="slide" transparent={false}>
        <ThemedView style={styles.modalContainer}>
          <SafeAreaView style={{ flex: 1, backgroundColor: headerBg }}>
            <View style={[styles.modalHeader, { borderBottomColor: dynamicBorder }]}>
              {step !== 'book' ? (
                <TouchableOpacity onPress={handleModalBack} style={styles.backBtn}>
                  <Icon name="arrow-back" size={22} color={textColor} />
                </TouchableOpacity>
              ) : (
                <View style={styles.headerSpacer} />
              )}

              <ThemedText style={styles.modalTitle}>
                {step === 'book' && 'Select Book'}
                {step === 'chapter' && `${selectedBook} - Select Chapter`}
              </ThemedText>

              <TouchableOpacity onPress={() => setShowScriptureModal(false)}>
                <Icon name="close-circle" size={26} color="gold" />
              </TouchableOpacity>
            </View>

            {step === 'book' && (
              <>
                <View style={[styles.modalSearchBox, { backgroundColor: inputBg }]}>
                  <Icon name="search" size={18} color={isDark ? "#888" : "#666"} />
                  <TextInput
                    style={[styles.modalSearchInput, { color: textColor }]}
                    placeholder="Search book name..."
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    value={scriptureSearchQuery}
                    onChangeText={setScriptureSearchQuery}
                  />
                </View>

                <View style={[styles.segmentContainer, { backgroundColor: tabBg }]}>
                  <TouchableOpacity
                    style={[styles.segmentTab, testamentFilter === 'all' && styles.segmentTabActive]}
                    onPress={() => setTestamentFilter('all')}
                  >
                    <Text style={[styles.segmentText, testamentFilter === 'all' ? styles.segmentTextActive : { color: textColor }]}>
                      ALL
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentTab, testamentFilter === 'ot' && styles.segmentTabActive]}
                    onPress={() => setTestamentFilter('ot')}
                  >
                    <Text style={[styles.segmentText, testamentFilter === 'ot' ? styles.segmentTextActive : { color: textColor }]}>
                      OLD TESTAMENT
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentTab, testamentFilter === 'nt' && styles.segmentTabActive]}
                    onPress={() => setTestamentFilter('nt')}
                  >
                    <Text style={[styles.segmentText, testamentFilter === 'nt' ? styles.segmentTextActive : { color: textColor }]}>
                      NEW TESTAMENT
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* STEP 1: BOOKS GRID */}
            {step === 'book' && (
              <SectionList
                sections={testamentSections}
                keyExtractor={(item, index) => `row-${index}`}
                contentContainerStyle={styles.gridList}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section: { title } }) => (
                  <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionHeaderText}>{title}</Text>
                  </View>
                )}
                renderItem={({ item: rowItems }) => (
                  <View style={styles.gridRow}>
                    {rowItems.map((bName) => (
                      <TouchableOpacity
                        key={bName}
                        style={[styles.squareGridBox, { backgroundColor: cardBg }]}
                        onPress={() => handleSelectBook(bName)}
                      >
                        <Text style={[styles.gridBoxTitle, { color: textColor }]} numberOfLines={2}>
                          {bName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {rowItems.length < 3 && Array.from({ length: 3 - rowItems.length }).map((_, i) => (
                      <View key={`empty-${i}`} style={styles.squareGridBoxEmpty} />
                    ))}
                  </View>
                )}
              />
            )}

            {/* STEP 2: CHAPTERS GRID */}
            {step === 'chapter' && (
              <FlatList
                data={chaptersForSelectedBook}
                keyExtractor={(item) => `chap-${item}`}
                numColumns={4}
                contentContainerStyle={styles.gridList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.squareGridBoxSmall, { backgroundColor: cardBg }]}
                    onPress={() => handleSelectChapter(item)}
                  >
                    <Text style={[styles.gridBoxNumber, { color: 'gold' }]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </SafeAreaView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerSurface: { borderBottomWidth: 1, elevation: 4, paddingBottom: 12 },
  topNavigation: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 10 
  },
  leftNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerTrigger: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    paddingVertical: 4
  },
  pickerText: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'gold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  versionBadgeText: { fontSize: 12, fontWeight: '800', color: 'gold' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionDropdownCard: {
    width: '80%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  versionDropdownTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  versionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  versionOptionActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  versionOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  versionOptionTextActive: {
    color: 'gold',
  },

  headerSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  headerSearchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerSpacer: { width: 22 },
  backBtn: { padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800' },

  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 10,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: 'gold',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  segmentTextActive: {
    color: '#000000',
  },

  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  modalSearchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  gridList: { paddingHorizontal: 10, paddingBottom: 20 },
  sectionHeaderContainer: {
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '900',
    color: 'gold',
    letterSpacing: 1.2,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  squareGridBox: {
    flex: 1,
    aspectRatio: 1.2,
    margin: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  squareGridBoxEmpty: {
    flex: 1,
    aspectRatio: 1.2,
    margin: 6,
  },
  squareGridBoxSmall: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBoxTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  gridBoxNumber: { fontSize: 18, fontWeight: '800' },

  header: { paddingHorizontal: 25, marginBottom: 10, marginTop: 20 },
  bibleHeading: { fontSize: 24, fontWeight: '900' },
  goldUnderline: { height: 4, width: 40, backgroundColor: 'gold', marginTop: 5, borderRadius: 2 },
  readerContainer: { paddingBottom: 40 },

  verseWrapper: { paddingHorizontal: 25, marginBottom: 16, paddingVertical: 4 },
  verseRow: { flexDirection: 'row' },
  verseContentContainer: { flex: 1 },
  chapterHeaderDivider: { marginTop: 20, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 215, 0, 0.3)', paddingBottom: 5 },
  chapterDividerText: { fontSize: 18, fontWeight: '900', color: 'gold', letterSpacing: 1.5 },
  verseNumber: { width: 35, fontSize: 14, fontWeight: '900', color: 'gold', marginTop: 4 },
  verseContent: { fontSize: 18, lineHeight: 30 },

  chapterFooterNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginTop: 30,
    marginBottom: 20,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  navBtnDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});