import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, FlatList, ActivityIndicator, View, 
  TextInput, Pressable, Linking, Dimensions, Platform 
} from 'react-native';
import { Menu, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../src/services/api';
import ThemedView from '../components/ThemedView';
import ThemedText from '../components/ThemedText';
import { ThemeContext } from '../components/ThemedContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_LARGE_SCREEN = SCREEN_WIDTH > 768 || Platform.OS === 'web';
const NUM_COLUMNS = IS_LARGE_SCREEN ? 3 : 2;

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
        const latestFirst = Array.isArray(response.data) ? [...response.data].reverse() : [];
        setPapers(latestFirst);
        setFilteredPapers(latestFirst);
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

  const handleOpenPdf = (pdfUrl) => {
    if (!pdfUrl) return;
    if (IS_LARGE_SCREEN) {
      const gdocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}`;
      Linking.openURL(gdocsViewerUrl);
    } else {
      Linking.openURL(pdfUrl);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Back Button and Title */}
      <View style={styles.header}>
        <Pressable 
          style={({ focused }) => [
            styles.backButton,
            focused && styles.focusedBackButton
          ]}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="gold" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Research Papers</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.filterRow}>
          <TextInput 
            style={[
              styles.searchBar, 
              { color: isDark ? '#FFF' : '#000', backgroundColor: isDark ? '#333' : '#F0F0F0' }
            ]}
            placeholder="Search by title..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />

          <Menu 
            visible={menuVisible} 
            onDismiss={() => setMenuVisible(false)} 
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setMenuVisible(true)} 
                style={styles.menuBtn} 
                textColor="gold"
              >
                {levelFilter}
              </Button>
            }
          >
            <Menu.Item title="All Levels" onPress={() => { setLevelFilter('All Levels'); setMenuVisible(false); }} />
            {['Senior 1', 'Senior 2', 'Senior 3', 'Senior 4', 'Senior 5', 'Senior 6'].map(lvl => (
              <Menu.Item key={lvl} title={lvl} onPress={() => { setLevelFilter(lvl); setMenuVisible(false); }} />
            ))}
          </Menu>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="gold" style={styles.loader} />
        ) : (
          <FlatList
            key={NUM_COLUMNS} // Forces grid rerender on rotation/screen resizing
            data={filteredPapers}
            keyExtractor={(item) => item.id.toString()}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
                <View style={styles.cardHeader}>
                  <Icon name="document-text-outline" size={24} color="gold" style={{ marginRight: 8 }} />
                  <ThemedText style={styles.paperTitle} numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                </View>

                <View style={styles.cardBody}>
                  <ThemedText style={styles.meta}>
                    {item.level || 'All Levels'} • {item.subject || 'General'}
                  </ThemedText>
                  {item.year && <ThemedText style={styles.metaYear}>Year: {item.year}</ThemedText>}
                </View>
                
                <Pressable 
                  style={({ focused }) => [
                    styles.pdfButton,
                    focused && styles.focusedPdfButton
                  ]} 
                  onPress={() => handleOpenPdf(item.file)}
                >
                  <Icon name="book-outline" size={16} color="black" style={{ marginRight: 6 }} />
                  <ThemedText style={styles.pdfButtonText}>OPEN PDF</ThemedText>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  backButton: { 
    marginRight: 15,
    padding: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focusedBackButton: {
    borderColor: 'gold',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', textTransform: 'uppercase' },
  content: { paddingHorizontal: 16, flex: 1 },
  
  filterRow: {
    flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
    alignItems: IS_LARGE_SCREEN ? 'center' : 'stretch',
    gap: 12,
    marginBottom: 15,
  },
  searchBar: { 
    flex: 1,
    padding: 12, 
    borderRadius: 8,
  },
  menuBtn: { 
    alignSelf: IS_LARGE_SCREEN ? 'center' : 'flex-start', 
    borderColor: 'gold',
  },
  loader: { marginTop: 50 },
  
  // Grid layout styles
  list: { paddingBottom: 50 },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  card: { 
    flex: 1,
    padding: 16, 
    borderRadius: 12, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    justifyContent: 'space-between',
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paperTitle: { 
    flex: 1,
    fontSize: 16, 
    fontWeight: 'bold',
    lineHeight: 22,
  },
  cardBody: {
    marginBottom: 12,
  },
  meta: { fontSize: 13, opacity: 0.7, marginTop: 4 },
  metaYear: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  
  pdfButton: {
    flexDirection: 'row',
    backgroundColor: 'gold',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focusedPdfButton: {
    backgroundColor: '#FFE55C',
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.03 }],
  },
  pdfButtonText: {
    color: 'black',
    fontWeight: '800',
    fontSize: 13,
  },
});