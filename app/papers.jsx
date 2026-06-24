import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, TextInput, TouchableOpacity, Linking } from 'react-native';
import { Menu, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../src/services/api';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { ThemeContext } from '../components/ThemedContext';

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { isDark } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await api.get('api/papers/');
        setPapers(response.data);
        setFilteredPapers(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPapers();
  }, []);

  useEffect(() => {
    let filtered = papers;
    if (search) filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    if (levelFilter !== 'All Levels') filtered = filtered.filter(p => p.level === levelFilter);
    setFilteredPapers(filtered);
  }, [search, levelFilter, papers]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Back Button and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="gold" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Research Papers</ThemedText>
      </View>

      <View style={styles.content}>
        <TextInput 
          style={[styles.searchBar, { color: isDark ? '#FFF' : '#000', backgroundColor: isDark ? '#333' : '#F0F0F0' }]}
          placeholder="Search by title..."
          value={search}
          onChangeText={setSearch}
        />

        <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={
            <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                {levelFilter}
            </Button>}>
          <Menu.Item title="All Levels" onPress={() => {setLevelFilter('All Levels'); setMenuVisible(false)}} />
          {['Senior 1', 'Senior 2', 'Senior 3', 'Senior 4', 'Senior 5', 'Senior 6'].map(lvl => (
            <Menu.Item key={lvl} title={lvl} onPress={() => {setLevelFilter(lvl); setMenuVisible(false)}} />
          ))}
        </Menu>

        <FlatList
          data={filteredPapers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
              <ThemedText style={styles.paperTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.meta}>{item.level} • {item.subject} • {item.year}</ThemedText>
              <Button mode="contained" buttonColor="gold" textColor="black" style={{ marginTop: 10 }} onPress={() => Linking.openURL(item.file)}>
                Open PDF
              </Button>
            </View>
          )}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '900', textTransform: 'uppercase' },
  content: { paddingHorizontal: 16, flex: 1 },
  searchBar: { padding: 12, borderRadius: 8, marginBottom: 10 },
  menuBtn: { marginBottom: 15, alignSelf: 'flex-start' },
  card: { padding: 20, borderRadius: 12, marginBottom: 15, elevation: 3 },
  paperTitle: { fontSize: 18, fontWeight: 'bold' },
  meta: { fontSize: 14, opacity: 0.7, marginTop: 4 }
});