import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, Linking, RefreshControl, TextInput 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your Appwrite config
import { storage, BUCKET_ID } from '../lib/appwrite';
import ThemedView from '../components/ThemedView'; 
import ThemedText from '../components/ThemedText';

export default function BooksScreen() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]); // ✅ For search results
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState(''); // ✅ Search state

  const PROJECT_ID = '694512df0028c4ddf6c7'; 
  const ENDPOINT = 'https://cloud.appwrite.io/v1'; 

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await storage.listFiles(BUCKET_ID);
      
      // ✅ SORTING: Newest books appear at the top
      const sorted = response.files.sort((a, b) => 
        new Date(b.$createdAt) - new Date(a.$createdAt)
      );
      
      setBooks(sorted);
      setFilteredBooks(sorted); // Initialize filtered list
    } catch (error) {
      Alert.alert("Error", "Library connection failed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ SEARCH LOGIC: Filter list based on text input
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => 
        book.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchText(''); // Clear search on refresh
    fetchBooks();
  };

  const handleOpenPdf = async (fileId) => {
    try {
      const manualUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
      await Linking.openURL(encodeURI(manualUrl));
    } catch (e) {
      Alert.alert("Error", "Could not open the book.");
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.heading}>Library</ThemedText>
          <View style={styles.goldUnderline} />
        </View>

        {/* ✅ SEARCH BAR UI */}
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#ffd700" />
          </View>
        ) : (
          <FlatList
            data={filteredBooks} // ✅ Use filtered list here
            keyExtractor={(item) => item.$id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffd700" />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <ThemedText style={{ opacity: 0.5 }}>No books found</ThemedText>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.bookCard} 
                onPress={() => handleOpenPdf(item.$id)}
              >
                <View style={styles.bookInfo}>
                  <ThemedText style={styles.bookTitle}>
                    {item.name.replace('.pdf', '')}
                  </ThemedText>
                  <ThemedText style={styles.bookAuthor}>Tap to read online</ThemedText>
                </View>
                <Icon name="open-outline" size={22} color="#ffd700" />
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 25, marginTop: 15 },
  heading: { fontSize: 34, fontWeight: '900' },
  goldUnderline: { height: 4, width: 45, backgroundColor: '#ffd700', marginTop: 5, marginBottom: 15, borderRadius: 2 },
  
  // ✅ SEARCH STYLES
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 25,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 45,
    marginBottom: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 },
  bookCard: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 15, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)'
  },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 17, fontWeight: 'bold' },
  bookAuthor: { fontSize: 13, color: '#ffd700', marginTop: 4, opacity: 0.8 },
});