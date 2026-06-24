import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../src/services/api'; 
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { ThemeContext } from '../components/ThemedContext';

export default function LibraryScreen() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const { isDark } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('api/books/');
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = books;
    if (search) filtered = filtered.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== 'All') filtered = filtered.filter(b => b.category === categoryFilter);
    setFilteredBooks(filtered);
  }, [search, categoryFilter, books]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.bookCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]} 
      onPress={() => router.push({ pathname: '/book-detail', params: item })}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.bookImage} />
      ) : (
        <View style={[styles.bookImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
            <Icon name="book" size={24} color="#666" />
        </View>
      )}
      <View style={styles.infoContainer}>
        <ThemedText style={styles.bookTitle} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.bookAuthor} numberOfLines={1}>By {item.author}</ThemedText>
        <ThemedText style={styles.categoryTag}>{item.category}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="gold" />
        </TouchableOpacity>
        <ThemedText style={styles.heading}>Library</ThemedText>
      </View>

      <View style={styles.content}>
        <TextInput 
          style={[styles.searchBar, { color: isDark ? '#FFF' : '#000', backgroundColor: isDark ? '#333' : '#F0F0F0' }]}
          placeholder="Search books..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />

        <Menu 
          visible={menuVisible} 
          onDismiss={() => setMenuVisible(false)} 
          anchor={
            <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.filterBtn} textColor="gold">
              {categoryFilter}
            </Button>
          }
        >
          <Menu.Item title="All" onPress={() => {setCategoryFilter('All'); setMenuVisible(false)}} />
          {['Devotional', 'Leadership', 'Discipleship', 'Evangelism'].map(cat => (
            <Menu.Item key={cat} title={cat} onPress={() => {setCategoryFilter(cat); setMenuVisible(false)}} />
          ))}
        </Menu>

        {loading ? (
          <ActivityIndicator size="large" color="gold" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { marginRight: 15 },
  heading: { fontSize: 28, fontWeight: '900', color: 'gold' },
  content: { paddingHorizontal: 20, flex: 1 },
  searchBar: { padding: 12, borderRadius: 8, marginBottom: 15 },
  filterBtn: { marginBottom: 15, alignSelf: 'flex-start', borderColor: 'gold' },
  loader: { marginTop: 50 },
  list: { paddingBottom: 50 },
  bookCard: { 
    flexDirection: 'row', 
    padding: 10, 
    borderRadius: 12, 
    marginBottom: 15, 
    elevation: 3, 
    height: 120,
    alignItems: 'center' 
  },
  bookImage: { width: 80, height: '100%', borderRadius: 8 },
  infoContainer: { paddingLeft: 15, flex: 1, justifyContent: 'center' },
  bookTitle: { fontSize: 16, fontWeight: 'bold' },
  bookAuthor: { fontSize: 13, opacity: 0.7, marginTop: 4 },
  categoryTag: { fontSize: 11, color: 'gold', fontWeight: '800', marginTop: 4 }
});